// scripts/db-stats.js
const pool = require('../src/lib/db').pool;

async function getDatabaseStats() {
  console.log('\n📊 Database Statistics\n');
  
  let client;
  try {
    client = await pool.connect();
    
    // Districts count
    const districtsResult = await client.query(
      'SELECT COUNT(*) as count FROM districts'
    );
    const districtsCount = parseInt(districtsResult.rows[0].count);
    
    // Performance records count
    const performanceResult = await client.query(
      'SELECT COUNT(*) as count FROM district_performance'
    );
    const performanceCount = parseInt(performanceResult.rows[0].count);
    
    // Date range of data
    const dateRangeResult = await client.query(
      'SELECT MIN(month) as earliest, MAX(month) as latest FROM district_performance'
    );
    const dateRange = dateRangeResult.rows[0];
    
    // Cache statistics
    const cacheResult = await client.query(
      'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE expires_at > NOW()) as active FROM api_cache'
    );
    const cacheStats = cacheResult.rows[0];
    
    // Total workers across all districts (latest month)
    const workersResult = await client.query(`
      SELECT SUM(total_workers) as total_workers,
             SUM(active_workers) as active_workers,
             SUM(person_days_generated) as person_days
      FROM district_performance
      WHERE month = (SELECT MAX(month) FROM district_performance)
    `);
    const workerStats = workersResult.rows[0];
    
    // Top 5 districts by active workers
    const topDistrictsResult = await client.query(`
      SELECT d.name, dp.active_workers, dp.total_expenditure
      FROM district_performance dp
      JOIN districts d ON dp.district_code = d.district_code
      WHERE dp.month = (SELECT MAX(month) FROM district_performance)
      ORDER BY dp.active_workers DESC
      LIMIT 5
    `);
    
    console.log('=== Database Overview ===');
    console.log(`Total Districts: ${districtsCount}`);
    console.log(`Performance Records: ${performanceCount}`);
    console.log(`Data Range: ${dateRange.earliest ? new Date(dateRange.earliest).toLocaleDateString() : 'N/A'} to ${dateRange.latest ? new Date(dateRange.latest).toLocaleDateString() : 'N/A'}`);
    console.log(`\n=== Cache Statistics ===`);
    console.log(`Total Cache Entries: ${cacheStats.total}`);
    console.log(`Active Cache Entries: ${cacheStats.active}`);
    
    if (workerStats.total_workers) {
      console.log(`\n=== Latest Month Statistics ===`);
      console.log(`Total Workers: ${parseInt(workerStats.total_workers).toLocaleString('en-IN')}`);
      console.log(`Active Workers: ${parseInt(workerStats.active_workers).toLocaleString('en-IN')}`);
      console.log(`Person Days: ${parseInt(workerStats.person_days).toLocaleString('en-IN')}`);
    }
    
    if (topDistrictsResult.rows.length > 0) {
      console.log(`\n=== Top 5 Districts (by Active Workers) ===`);
      topDistrictsResult.rows.forEach((row, idx) => {
        console.log(`${idx + 1}. ${row.name}: ${parseInt(row.active_workers).toLocaleString('en-IN')} workers, ₹${parseFloat(row.total_expenditure).toFixed(2)}Cr`);
      });
    }
    
    console.log('\n==============================\n');
    
  } catch (error) {
    console.error('❌ Failed to get statistics:', error);
  } finally {
    if (client) client.release();
    process.exit(0);
  }
}

getDatabaseStats();