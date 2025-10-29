// test-cache.js
const { 
  setCache, 
  getCache, 
  clearExpiredCache,
  getCacheStats 
} = require('./src/lib/cache');

async function testCache() {
  console.log('\n=== Testing Cache System ===\n');
  
  // Test 1: Set cache
  console.log('Test 1: Setting cache...');
  await setCache('test_key_1', { message: 'Hello from cache!', timestamp: Date.now() }, 1);
  
  // Test 2: Get cache
  console.log('\nTest 2: Getting cache...');
  const cached = await getCache('test_key_1');
  console.log('Retrieved:', cached);
  
  // Test 3: Cache miss
  console.log('\nTest 3: Cache miss test...');
  const missing = await getCache('non_existent_key');
  console.log('Missing key result:', missing);
  
  // Test 4: Cache stats
  console.log('\nTest 4: Cache statistics...');
  const stats = await getCacheStats();
  console.log('Cache stats:', stats);
  
  // Test 5: Clear expired
  console.log('\nTest 5: Clearing expired cache...');
  await clearExpiredCache();
  
  console.log('\n=== All tests completed ===\n');
  process.exit(0);
}

testCache().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});