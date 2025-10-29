// src/lib/api-helpers.js
const { fetchDistrictData, getAllDistricts } = require('./mgnrega-api');

/**
 * Compare two districts performance
 */
async function compareDistricts(districtCode1, districtCode2, month) {
  const [data1, data2] = await Promise.all([
    fetchDistrictData(districtCode1, month),
    fetchDistrictData(districtCode2, month),
  ]);
  
  return {
    district1: {
      code: districtCode1,
      data: data1,
    },
    district2: {
      code: districtCode2,
      data: data2,
    },
    comparison: {
      workersDiff: data1.totalWorkers - data2.totalWorkers,
      expenditureDiff: data1.totalExpenditure - data2.totalExpenditure,
      wageDiff: data1.averageWage - data2.averageWage,
    },
  };
}

/**
 * Get state-wide statistics
 */
async function getStateStatistics(state = 'Uttar Pradesh', month) {
  const districts = await getAllDistricts();
  const stateDistricts = districts.filter(d => d.state === state);
  
  let totalWorkers = 0;
  let totalActiveWorkers = 0;
  let totalExpenditure = 0;
  let totalPersonDays = 0;
  
  console.log(`\nCalculating statistics for ${stateDistricts.length} districts in ${state}...`);
  
  for (const district of stateDistricts) {
    const data = await fetchDistrictData(district.district_code, month);
    totalWorkers += data.totalWorkers;
    totalActiveWorkers += data.activeWorkers;
    totalExpenditure += data.totalExpenditure;
    totalPersonDays += data.personDaysGenerated;
  }
  
  return {
    state,
    totalDistricts: stateDistricts.length,
    totalWorkers,
    totalActiveWorkers,
    totalExpenditure,
    totalPersonDays,
    averageWage: totalPersonDays > 0 ? (totalExpenditure * 10000000) / totalPersonDays : 0,
  };
}

/**
 * Get top performing districts
 */
async function getTopPerformingDistricts(metric = 'activeWorkers', limit = 5, month) {
  const districts = await getAllDistricts();
  const districtData = [];
  
  console.log(`\nFetching performance data for ${districts.length} districts...`);
  
  for (const district of districts) {
    const data = await fetchDistrictData(district.district_code, month);
    districtData.push({
      ...district,
      performance: data,
    });
  }
  
  // Sort by metric
  districtData.sort((a, b) => {
    return b.performance[metric] - a.performance[metric];
  });
  
  return districtData.slice(0, limit);
}

module.exports = {
  compareDistricts,
  getStateStatistics,
  getTopPerformingDistricts,
};