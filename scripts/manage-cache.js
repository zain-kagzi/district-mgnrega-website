// scripts/manage-cache.js
const {
  getCacheStats,
  clearExpiredCache,
  clearAllCache,
} = require('../src/lib/cache');

async function manageCache(action) {
  console.log('\n🗄️ Cache Management Tool\n');
  
  try {
    if (action === 'stats' || !action) {
      // Show cache statistics
      console.log('Fetching cache statistics...\n');
      const stats = await getCacheStats();
      
      console.log('=== Cache Statistics ===');
      console.log(`Total entries: ${stats.total}`);
      console.log(`Active entries: ${stats.active}`);
      console.log(`Expired entries: ${stats.expired}`);
      console.log('=======================\n');
      
      if (stats.expired > 0) {
        console.log(`💡 Tip: Run "node scripts/manage-cache.js clear-expired" to remove ${stats.expired} expired entries`);
      }
    } else if (action === 'clear-expired') {
      // Clear expired entries
      console.log('Clearing expired cache entries...\n');
      const deleted = await clearExpiredCache();
      console.log(`✓ Deleted ${deleted} expired entries\n`);
    } else if (action === 'clear-all') {
      // Clear all cache
      console.log('⚠️  WARNING: This will clear ALL cache entries!');
      console.log('Are you sure? (This is running automatically)\n');
      
      const deleted = await clearAllCache();
      console.log(`✓ Deleted ${deleted} cache entries\n`);
    } else {
      console.log('Unknown action. Available actions:');
      console.log('  - stats (default): Show cache statistics');
      console.log('  - clear-expired: Remove expired entries');
      console.log('  - clear-all: Remove all cache entries');
      console.log('\nUsage: node scripts/manage-cache.js [action]\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cache management failed:', error);
    process.exit(1);
  }
}

const action = process.argv[2];
manageCache(action);