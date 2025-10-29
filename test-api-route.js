// test-api-routes.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPIRoutes() {
  console.log('\n=== Testing Next.js API Routes ===\n');
  console.log('Make sure your Next.js dev server is running (npm run dev)\n');
  
  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✓ Health Status:', healthResponse.data.status);
    console.log('  Districts:', healthResponse.data.database.districts);
    
    // Test 2: Get Districts
    console.log('\nTest 2: Get Districts List...');
    const districtsResponse = await axios.get(`${BASE_URL}/api/districts`);
    console.log(`✓ Found ${districtsResponse.data.length} districts`);
    console.log('  First 3:', districtsResponse.data.slice(0, 3).map(d => d.name).join(', '));
    
    // Test 3: Get Single District
    console.log('\nTest 3: Get District Data...');
    const districtResponse = await axios.get(`${BASE_URL}/api/district/UP_LUCKNOW`);
    console.log('✓ District:', districtResponse.data.districtCode);
    console.log('  Workers:', districtResponse.data.totalWorkers);
    console.log('  Expenditure: ₹' + districtResponse.data.totalExpenditure + 'Cr');
    
    // Test 4: Get Historical Data
    console.log('\nTest 4: Get Historical Data...');
    const historicalResponse = await axios.get(`${BASE_URL}/api/district/UP_LUCKNOW?historical=true&months=6`);
    console.log(`✓ Fetched ${historicalResponse.data.length} months of data`);
    
    // Test 5: Compare Districts
    console.log('\nTest 5: Compare Districts...');
    const compareResponse = await axios.get(`${BASE_URL}/api/compare?district1=UP_LUCKNOW&district2=UP_VARANASI`);
    console.log('✓ Comparison complete');
    console.log('  Workers difference:', compareResponse.data.comparison.workersDiff);
    
    console.log('\n=== All API route tests passed! ===\n');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Error: Could not connect to Next.js server');
      console.error('   Please start the development server with: npm run dev\n');
    } else {
      console.error('\n❌ Test failed:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
    }
  }
}

testAPIRoutes();