// scripts/backfill-historical.js
const { getAllDistricts, fetchHistoricalData } = require('../src/lib/mgnrega-api');

async function backfillHistoricalData(months = 12) {
  console.log(`\n📚 Backfilling ${months} months of historical data...\n`);
  
  const startTime = Date.now();
  
  try {
    const districts = await getAllDistricts();
    console.log(`Found ${districts.length} districts`);
    console.log(`Total data points to fetch: ${districts.length * months}\n`);
    
    let completedDistricts = 0;
    let totalDataPoints = 0;
    
    for (const district of districts) {
      console.log(`\n[${completedDistricts + 1}/${districts.length}] Processing ${district.name}...`);
      
      try {
        const historicalData = await fetchHistoricalData(district.district_code, months);
        totalDataPoints += historicalData.length;
        completedDistricts++;
        
        console.log(`  ✓ Fetched ${historicalData.length} months of data`);
        
        // Small delay between districts
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ❌ Failed for ${district.name}:`, error.message);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n=== Backfill Summary ===');
    console.log(`Districts processed: ${completedDistricts}/${districts.length}`);
    console.log(`Total data points: ${totalDataPoints}`);
    console.log(`Duration: ${duration}s`);
    console.log(`Average time per district: ${(duration / completedDistricts).toFixed(2)}s`);
    console.log('=======================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  }
}

// Get months from command line argument, default to 12
const months = parseInt(process.argv[2]) || 12;
backfillHistoricalData(months);