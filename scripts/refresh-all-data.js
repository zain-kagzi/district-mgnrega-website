// scripts/refresh-all-data.js
const { getAllDistricts, fetchDistrictData } = require('../src/lib/mgnrega-api');
const { clearExpiredCache } = require('../src/lib/cache');

async function refreshAllData() {
  console.log('\n🔄 Starting data refresh for all districts...\n');
  
  const startTime = Date.now();
  
  try {
    // Clear expired cache first
    console.log('Clearing expired cache...');
    await clearExpiredCache();
    
    // Get all districts
    console.log('Fetching district list...');
    const districts = await getAllDistricts();
    console.log(`Found ${districts.length} districts to refresh\n`);
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    let successCount = 0;
    let failCount = 0;
    
    // Refresh data for each district
    for (let i = 0; i < districts.length; i++) {
      const district = districts[i];
      try {
        console.log(`[${i + 1}/${districts.length}] Refreshing ${district.name}...`);
        await fetchDistrictData(district.district_code, currentMonth);
        successCount++;
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Failed to refresh ${district.name}:`, error.message);
        failCount++;
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n=== Refresh Summary ===');
    console.log(`Total districts: ${districts.length}`);
    console.log(`✓ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⏱ Duration: ${duration}s`);
    console.log('=====================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Refresh failed:', error);
    process.exit(1);
  }
}

refreshAllData();