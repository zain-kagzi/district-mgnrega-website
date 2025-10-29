// tests/integration-test.js
const axios = require('axios');
const { Pool } = require('pg');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const pool = new Pool({
  user: process.env.DB_USER || 'mgnrega_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mgnrega_db',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✓' : '❌';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${name}${message ? ': ' + message : ''}`);
  
  testResults.tests.push({ name, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function testDatabase() {
  console.log('\n📊 Testing Database Connection...\n');
  
  try {
    const client = await pool.connect();
    
    // Test 1: Connection
    const timeResult = await client.query('SELECT NOW()');
    logTest('Database connection', timeResult.rows.length > 0);
    
    // Test 2: Districts table
    const districtsResult = await client.query('SELECT COUNT(*) FROM districts');
    const districtCount = parseInt(districtsResult.rows[0].count);
    logTest('Districts table exists', districtCount > 0, `${districtCount} districts found`);
    
    // Test 3: Performance table
    const performanceResult = await client.query('SELECT COUNT(*) FROM district_performance');
    const performanceCount = parseInt(performanceResult.rows[0].count);
    logTest('Performance data exists', performanceCount > 0, `${performanceCount} records found`);
    
    // Test 4: Cache table
    const cacheResult = await client.query('SELECT COUNT(*) FROM api_cache');
    logTest('Cache table exists', true);
    
    // Test 5: Check for latest month data
    const latestResult = await client.query(
      'SELECT MAX(month) as latest FROM district_performance'
    );
    const latestMonth = latestResult.rows[0].latest;
    logTest('Latest month data', latestMonth !== null, latestMonth ? new Date(latestMonth).toLocaleDateString() : '');
    
    client.release();
    return true;
  } catch (error) {
    logTest('Database tests', false, error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...\n');
  
  try {
    // Test 1: Health check
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    logTest('GET /api/health', healthResponse.status === 200);
    
    // Test 2: Get districts
    const districtsResponse = await axios.get(`${BASE_URL}/api/districts`);
    logTest('GET /api/districts', districtsResponse.status === 200 && Array.isArray(districtsResponse.data));
    
    const districts = districtsResponse.data;
    if (districts.length === 0) {
      logTest('Districts data available', false, 'No districts found');
      return false;
    }
    
    const testDistrict = districts[0].district_code;
    
    // Test 3: Get single district
    const districtResponse = await axios.get(`${BASE_URL}/api/district/${testDistrict}`);
    logTest('GET /api/district/:code', districtResponse.status === 200);
    
    // Test 4: Get historical data
    const historicalResponse = await axios.get(`${BASE_URL}/api/district/${testDistrict}?historical=true&months=6`);
    logTest('GET /api/district/:code?historical=true', 
      historicalResponse.status === 200 && Array.isArray(historicalResponse.data),
      `${historicalResponse.data.length} months returned`
    );
    
    // Test 5: Compare districts
    if (districts.length >= 2) {
      const compareResponse = await axios.get(
        `${BASE_URL}/api/compare?district1=${districts[0].district_code}&district2=${districts[1].district_code}`
      );
      logTest('GET /api/compare', compareResponse.status === 200);
    }
    
    // Test 6: State statistics
    const stateResponse = await axios.get(`${BASE_URL}/api/state/Uttar Pradesh`);
    logTest('GET /api/state/:state', stateResponse.status === 200);
    
    // Test 7: Top performers
    const topResponse = await axios.get(`${BASE_URL}/api/top-performers?metric=activeWorkers&limit=5`);
    logTest('GET /api/top-performers', topResponse.status === 200);
    
    // Test 8: Location API
    const locationResponse = await axios.post(`${BASE_URL}/api/location`, {
      latitude: 26.8467,
      longitude: 80.9462
    });
    logTest('POST /api/location', locationResponse.status === 200);
    
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logTest('API endpoints', false, 'Server not running. Start with: npm run dev');
    } else {
      logTest('API endpoints', false, error.message);
    }
    return false;
  }
}

async function testFrontend() {
  console.log('\n🎨 Testing Frontend...\n');
  
  try {
    // Test 1: Homepage loads
    const homeResponse = await axios.get(BASE_URL);
    logTest('Homepage loads', homeResponse.status === 200);
    
    // Test 2: Check for React hydration
    const hasReactRoot = homeResponse.data.includes('__NEXT_DATA__');
    logTest('Next.js hydration', hasReactRoot);
    
    return true;
  } catch (error) {
    logTest('Frontend', false, error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...\n');
  
  try {
    const start = Date.now();
    await axios.get(`${BASE_URL}/api/districts`);
    const duration1 = Date.now() - start;
    logTest('First request (cold)', duration1 < 5000, `${duration1}ms`);
    
    const start2 = Date.now();
    await axios.get(`${BASE_URL}/api/districts`);
    const duration2 = Date.now() - start2;
    logTest('Second request (cached)', duration2 < 1000, `${duration2}ms`);
    
    const improvement = ((1 - duration2/duration1) * 100).toFixed(0);
    logTest('Cache improvement', duration2 < duration1, `${improvement}% faster`);
    
    return true;
  } catch (error) {
    logTest('Performance tests', false, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║  MGNREGA Dashboard - Integration Tests       ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log(`\nTest URL: ${BASE_URL}`);
  console.log(`Started at: ${new Date().toLocaleString()}\n`);
  
  await testDatabase();
  await testAPIEndpoints();
  await testFrontend();
  await testPerformance();
  
  // Print summary
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║  Test Summary                                 ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total:  ${testResults.tests.length}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%\n`);
  
  await pool.end();
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});