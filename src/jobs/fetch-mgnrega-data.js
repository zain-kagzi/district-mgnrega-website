// src/jobs/fetch-mgnrega-data.js
const { Pool } = require('pg');
const axios = require('axios');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'mgnrega_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mgnrega_db',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Mock data generator (replace with actual API in production)
function generateMockData(districtCode, month) {
  const seed = districtCode.split('_')[1]?.charCodeAt(0) || 65;
  const monthSeed = month.getMonth() + 1;
  
  const baseWorkers = 50000 + (seed * 1000) + (monthSeed * 5000);
  const activityRate = 0.65 + (Math.sin(seed) * 0.15);
  const completionRate = 70 + (Math.cos(seed) * 15);
  const baseWage = 250 + (seed % 50);
  
  const totalWorkers = Math.floor(baseWorkers);
  const activeWorkers = Math.floor(totalWorkers * activityRate);
  const jobCardsIssued = Math.floor(totalWorkers * 1.15);
  const workCompleted = parseFloat(completionRate.toFixed(2));
  const averageWage = parseFloat(baseWage.toFixed(2));
  const personDaysGenerated = Math.floor(activeWorkers * (25 + (monthSeed * 2)));
  const totalExpenditure = parseFloat(
    ((personDaysGenerated * averageWage) / 10000000).toFixed(2)
  );
  
  return {
    districtCode,
    month,
    totalWorkers,
    activeWorkers,
    jobCardsIssued,
    workCompleted,
    averageWage,
    totalExpenditure,
    personDaysGenerated,
  };
}

// Fetch from actual MGNREGA API (placeholder)
async function fetchFromAPI(districtCode, month) {
  try {
    // In production, replace with actual API call
    // const response = await axios.get(`${process.env.MGNREGA_API_URL}`, {
    //   params: { district: districtCode, month: month }
    // });
    // return response.data;
    
    return null; // Returns null to use mock data
  } catch (error) {
    console.error(`API fetch failed for ${districtCode}:`, error.message);
    return null;
  }
}

// Save data to database
async function saveToDatabase(client, data) {
  await client.query(
    `INSERT INTO district_performance (
      district_code, month, total_workers, active_workers,
      job_cards_issued, work_completed, average_wage,
      total_expenditure, person_days_generated, api_last_fetched
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (district_code, month)
    DO UPDATE SET
      total_workers = $3,
      active_workers = $4,
      job_cards_issued = $5,
      work_completed = $6,
      average_wage = $7,
      total_expenditure = $8,
      person_days_generated = $9,
      api_last_fetched = NOW(),
      updated_at = NOW()`,
    [
      data.districtCode,
      data.month,
      data.totalWorkers,
      data.activeWorkers,
      data.jobCardsIssued,
      data.workCompleted,
      data.averageWage,
      data.totalExpenditure,
      data.personDaysGenerated,
    ]
  );
}

// Main job function
async function fetchAllDistrictsData() {
  const startTime = Date.now();
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  MGNREGA Data Fetch Job Started          ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`Started at: ${new Date().toLocaleString()}\n`);
  
  const client = await pool.connect();
  
  try {
    // Get all districts
    const result = await client.query('SELECT district_code, name FROM districts ORDER BY name');
    const districts = result.rows;
    console.log(`📊 Found ${districts.length} districts to process\n`);
    
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of month
    
    let successCount = 0;
    let failCount = 0;
    let apiSuccessCount = 0;
    let mockDataCount = 0;
    
    // Process each district
    for (let i = 0; i < districts.length; i++) {
      const district = districts[i];
      const progress = `[${i + 1}/${districts.length}]`;
      
      try {
        console.log(`${progress} Processing ${district.name} (${district.district_code})...`);
        
        // Try to fetch from API first
        let data = await fetchFromAPI(district.district_code, currentMonth);
        
        if (data) {
          apiSuccessCount++;
          console.log(`  ✓ Fetched from API`);
        } else {
          // Fallback to mock data
          data = generateMockData(district.district_code, currentMonth);
          mockDataCount++;
          console.log(`  ⚠ Using mock data (API unavailable)`);
        }
        
        // Save to database
        await saveToDatabase(client, data);
        console.log(`  ✓ Saved to database`);
        console.log(`  📈 Workers: ${data.totalWorkers.toLocaleString()}, Expenditure: ₹${data.totalExpenditure}Cr\n`);
        
        successCount++;
        
        // Small delay to avoid overwhelming systems
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failCount++;
        console.error(`  ❌ Error: ${error.message}\n`);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Print summary
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  Job Completion Summary                   ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log(`Total Districts:     ${districts.length}`);
    console.log(`✓ Successful:        ${successCount} (${((successCount/districts.length)*100).toFixed(1)}%)`);
    console.log(`❌ Failed:            ${failCount}`);
    console.log(`🌐 API Success:       ${apiSuccessCount}`);
    console.log(`🔧 Mock Data Used:    ${mockDataCount}`);
    console.log(`⏱  Duration:          ${duration}s`);
    console.log(`📅 Month Processed:   ${currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    console.log(`🕐 Completed at:      ${new Date().toLocaleString()}\n`);
    
  } catch (error) {
    console.error('\n❌ Job failed with error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run job if called directly
if (require.main === module) {
  fetchAllDistrictsData()
    .then(() => {
      console.log('✓ Job completed successfully\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Job failed:', error);
      process.exit(1);
    });
}

module.exports = { fetchAllDistrictsData };