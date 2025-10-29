// test-api-advanced.js
const {
  compareDistricts,
  getStateStatistics,
  getTopPerformingDistricts,
} = require('./src/lib/api-helpers');

async function runAdvancedTests() {
  console.log('\n=== Advanced API Tests ===\n');
  
  const currentMonth = new Date();
  currentMonth.setDate(1);
  
  try {
    // Test 1: Compare two districts
    console.log('Test 1: Comparing Lucknow vs Varanasi...');
    const comparison = await compareDistricts('UP_LUCKNOW', 'UP_VARANASI', currentMonth);
    console.log('\nComparison Results:');
    console.log(`  District 1: ${comparison.district1.code}`);
    console.log(`    - Workers: ${comparison.district1.data.totalWorkers.toLocaleString('en-IN')}`);
    console.log(`    - Expenditure: ₹${comparison.district1.data.totalExpenditure.toFixed(2)}Cr`);
    console.log(`  District 2: ${comparison.district2.code}`);
    console.log(`    - Workers: ${comparison.district2.data.totalWorkers.toLocaleString('en-IN')}`);
    console.log(`    - Expenditure: ₹${comparison.district2.data.totalExpenditure.toFixed(2)}Cr`);
    console.log(`  Differences:`);
    console.log(`    - Workers: ${comparison.comparison.workersDiff.toLocaleString('en-IN')}`);
    console.log(`    - Expenditure: ₹${comparison.comparison.expenditureDiff.toFixed(2)}Cr`);
    console.log(`    - Wage: ₹${comparison.comparison.wageDiff.toFixed(2)}`);
    
    // Test 2: State-wide statistics
    console.log('\n\nTest 2: Getting Uttar Pradesh state statistics...');
    const stateStats = await getStateStatistics('Uttar Pradesh', currentMonth);
    console.log('\nState Statistics:');
    console.log(`  Total Districts: ${stateStats.totalDistricts}`);
    console.log(`  Total Workers: ${stateStats.totalWorkers.toLocaleString('en-IN')}`);
    console.log(`  Active Workers: ${stateStats.totalActiveWorkers.toLocaleString('en-IN')}`);
    console.log(`  Total Expenditure: ₹${stateStats.totalExpenditure.toFixed(2)}Cr`);
    console.log(`  Total Person Days: ${stateStats.totalPersonDays.toLocaleString('en-IN')}`);
    console.log(`  Average Wage: ₹${stateStats.averageWage.toFixed(2)}`);
    
    // Test 3: Top performing districts by active workers
    console.log('\n\nTest 3: Getting top 5 districts by active workers...');
    const topByWorkers = await getTopPerformingDistricts('activeWorkers', 5, currentMonth);
    console.log('\nTop 5 Districts (by Active Workers):');
    topByWorkers.forEach((district, index) => {
      console.log(`  ${index + 1}. ${district.name}`);
      console.log(`     - Active Workers: ${district.performance.activeWorkers.toLocaleString('en-IN')}`);
      console.log(`     - Total Workers: ${district.performance.totalWorkers.toLocaleString('en-IN')}`);
    });
    
    // Test 4: Top by expenditure
    console.log('\n\nTest 4: Getting top 5 districts by expenditure...');
    const topByExpenditure = await getTopPerformingDistricts('totalExpenditure', 5, currentMonth);
    console.log('\nTop 5 Districts (by Expenditure):');
    topByExpenditure.forEach((district, index) => {
      console.log(`  ${index + 1}. ${district.name} - ₹${district.performance.totalExpenditure.toFixed(2)}Cr`);
    });
    
    // Test 5: Top by work completion
    console.log('\n\nTest 5: Getting top 5 districts by work completion...');
    const topByCompletion = await getTopPerformingDistricts('workCompleted', 5, currentMonth);
    console.log('\nTop 5 Districts (by Work Completion):');
    topByCompletion.forEach((district, index) => {
      console.log(`  ${index + 1}. ${district.name} - ${district.performance.workCompleted.toFixed(2)}%`);
    });
    
    console.log('\n\n=== All advanced tests completed successfully! ===\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

runAdvancedTests();