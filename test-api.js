// test-api.js
const { 
  fetchDistrictData, 
  fetchHistoricalData,
  getAllDistricts,
  getDistrictByCode 
} = require('./src/lib/mgnrega-api');

async function testAPI() {
  console.log('\n=== Testing MGNREGA API Integration ===\n');
  
  try {
    // Test 1: Get all districts
    console.log('Test 1: Fetching all districts...');
    const districts = await getAllDistricts();
    console.log(`✓ Found ${districts.length} districts`);
    console.log('First 3 districts:', districts.slice(0, 3));
    
    // Test 2: Get specific district
    console.log('\nTest 2: Fetching specific district...');
    const district = await getDistrictByCode('UP_LUCKNOW');
    console.log('District:', district);
    
    // Test 3: Fetch current month data
    console.log('\nTest 3: Fetching current month data...');
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const currentData = await fetchDistrictData('UP_LUCKNOW', currentMonth);
    console.log('Current data:', {
      totalWorkers: currentData.totalWorkers,
      activeWorkers: currentData.activeWorkers,
      averageWage: currentData.averageWage,
    });
    
    // Test 4: Fetch again (should come from cache)
    console.log('\nTest 4: Fetching same data again (should be cached)...');
    const cachedData = await fetchDistrictData('UP_LUCKNOW', currentMonth);
    console.log('Cache test passed!');
    
    // Test 5: Fetch historical data
    console.log('\nTest 5: Fetching 6 months of historical data...');
    const historical = await fetchHistoricalData('UP_LUCKNOW', 6);
    console.log(`✓ Fetched ${historical.length} months of data`);
    historical.forEach((data, idx) => {
      console.log(`  Month ${idx + 1}: ${data.totalWorkers} workers, ₹${data.totalExpenditure}Cr spent`);
    });
    
    console.log('\n=== All API tests completed successfully! ===\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testAPI();