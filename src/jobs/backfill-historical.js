// src/jobs/backfill-historical.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'mgnrega_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mgnrega_db',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

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

async function backfillHistoricalData(months = 12) {
  const startTime = Date.now();
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Historical Data Backfill Job Started    ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`Backfilling ${months} months of historical data\n`);
  
  const client = await pool.connect();
  
  try {
    // Get all districts
    const result = await client.query('SELECT district_code, name FROM districts ORDER BY name');
    const districts = result.rows;
    
    console.log(`📊 Processing ${districts.length} districts`);
    console.log(`📅 Total data points: ${districts.length * months}\n`);
    
    let totalDataPoints = 0;
    let completedDistricts = 0;
    
    for (const district of districts) {
      console.log(`\n[${completedDistricts + 1}/${districts.length}] ${district.name}`);
      console.log('─'.repeat(50));
      
      // Generate data for each month
      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        monthDate.setDate(1);
        
        try {
          const data = generateMockData(district.district_code, monthDate);
          
          await client.query(
            `INSERT INTO district_performance (
              district_code, month, total_workers, active_workers,
              job_cards_issued, work_completed, average_wage,
              total_expenditure, person_days_generated, api_last_fetched
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            ON CONFLICT (district_code, month) DO NOTHING`,
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
          
          totalDataPoints++;
          process.stdout.write(`  ✓ ${monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} `);
        } catch (error) {
          console.error(`\n  ❌ Failed for ${monthDate.toLocaleDateString()}:`, error.message);
        }
      }
      
      completedDistricts++;
      console.log(`\n  Total: ${months} months backfilled`);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n\n╔════════════════════════════════════════════╗');
    console.log('║  Backfill Completion Summary              ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log(`Districts processed:  ${completedDistricts}/${districts.length}`);
    console.log(`Data points created:  ${totalDataPoints}`);
    console.log(`Duration:             ${duration}s`);
    console.log(`Avg time/district:    ${(duration / completedDistricts).toFixed(2)}s`);
    console.log(`Data points/second:   ${(totalDataPoints / (duration || 1)).toFixed(2)}\n`);
    
  } catch (error) {
    console.error('\n❌ Backfill failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  const months = parseInt(process.argv[2]) || 12;
  
  if (months < 1 || months > 24) {
    console.error('❌ Error: Months must be between 1 and 24');
    process.exit(1);
  }
  
  backfillHistoricalData(months)
    .then(() => {
      console.log('✓ Backfill completed successfully\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Backfill failed:', error);
      process.exit(1);
    });
}

module.exports = { backfillHistoricalData };