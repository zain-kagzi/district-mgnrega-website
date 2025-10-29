// src/lib/mgnrega-api.js
const axios = require('axios');
const { getCache, setCache } = require('./cache');
const pool = require('./db').pool || require('./db').default;

/**
 * Generate mock data for development/demo
 */
function generateMockData(districtCode, month) {
  const seed = districtCode.split('_')[1]?.charCodeAt(0) || 65;
  const monthSeed = month.getMonth() + 1;
  
  const baseWorkers = 50000 + (seed * 1000) + (monthSeed * 5000);
  const activityRate = 0.65 + (Math.sin(seed) * 0.15);
  const completionRate = 70 + (Math.cos(seed) * 15);
  const baseWage = 250 + (seed % 50);
  
  const totalWorkers = Math.floor(baseWorkers);
  const activeWorkers = Math.floor(totalWorkers * activityRate);
  const jobCardsIssued = Math.floor(totalWorkers * 1.15);
  const workCompleted = parseFloat(completionRate.toFixed(2));
  const averageWage = parseFloat(baseWage.toFixed(2));
  const personDaysGenerated = Math.floor(activeWorkers * (25 + (monthSeed * 2)));
  const totalExpenditure = parseFloat(
    ((personDaysGenerated * averageWage) / 10000000).toFixed(2)
  );
  
  return {
    districtCode,
    month,
    totalWorkers,
    activeWorkers,
    jobCardsIssued,
    workCompleted,
    averageWage,
    totalExpenditure,
    personDaysGenerated,
  };
}

/**
 * Fetch from actual API (placeholder)
 */
async function fetchFromMGNREGAAPI(districtCode, month) {
  try {
    // Actual API call would go here
    // For now, return null to use mock data
    return null;
  } catch (error) {
    console.error('API Error:', error.message);
    return null;
  }
}

/**
 * Get data from database
 */
async function getFromDatabase(districtCode, month) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM district_performance 
       WHERE district_code = $1 AND month = $2`,
      [districtCode, month]
    );
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log(`✓ Found data in database for ${districtCode}`);
      return {
        districtCode: row.district_code,
        month: new Date(row.month),
        totalWorkers: parseInt(row.total_workers),
        activeWorkers: parseInt(row.active_workers),
        jobCardsIssued: parseInt(row.job_cards_issued),
        workCompleted: parseFloat(row.work_completed),
        averageWage: parseFloat(row.average_wage),
        totalExpenditure: parseFloat(row.total_expenditure),
        personDaysGenerated: parseInt(row.person_days_generated),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Database query error:', error);
    return null;
  } finally {
    if (client) client.release();
  }
}

/**
 * Save to database
 */
async function saveToDatabase(data) {
  let client;
  try {
    client = await pool.connect();
    await client.query(
      `INSERT INTO district_performance (
        district_code, month, total_workers, active_workers,
        job_cards_issued, work_completed, average_wage,
        total_expenditure, person_days_generated, api_last_fetched
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (district_code, month)
      DO UPDATE SET
        total_workers = $3,
        active_workers = $4,
        job_cards_issued = $5,
        work_completed = $6,
        average_wage = $7,
        total_expenditure = $8,
        person_days_generated = $9,
        api_last_fetched = NOW(),
        updated_at = NOW()`,
      [
        data.districtCode,
        data.month,
        data.totalWorkers,
        data.activeWorkers,
        data.jobCardsIssued,
        data.workCompleted,
        data.averageWage,
        data.totalExpenditure,
        data.personDaysGenerated,
      ]
    );
    console.log(`✓ Saved data to database for ${data.districtCode}`);
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
}

/**
 * Main function to fetch district data
 * Priority: Cache -> Database -> API -> Mock Data
 */
async function fetchDistrictData(districtCode, month) {
  const cacheKey = `district_${districtCode}_${month.toISOString().slice(0, 7)}`;
  
  console.log(`\n📊 Fetching data for ${districtCode} - ${month.toISOString().slice(0, 7)}`);
  
  // 1. Try cache
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log('✓ Data source: CACHE');
    return cached;
  }
  
  // 2. Try database
  const dbData = await getFromDatabase(districtCode, month);
  if (dbData) {
    console.log('✓ Data source: DATABASE');
    await setCache(cacheKey, dbData, 6);
    return dbData;
  }
  
  // 3. Try API
  console.log('⏳ Attempting to fetch from API...');
  const apiData = await fetchFromMGNREGAAPI(districtCode, month);
  if (apiData) {
    console.log('✓ Data source: API');
    await saveToDatabase(apiData);
    await setCache(cacheKey, apiData, 6);
    return apiData;
  }
  
  // 4. Use mock data
  console.log('⚠ Using MOCK DATA');
  const mockData = generateMockData(districtCode, month);
  await saveToDatabase(mockData);
  await setCache(cacheKey, mockData, 6);
  
  return mockData;
}

/**
 * Fetch historical data
 */
async function fetchHistoricalData(districtCode, months = 12) {
  console.log(`\n📈 Fetching ${months} months of historical data for ${districtCode}`);
  
  const data = [];
  const currentDate = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(currentDate);
    monthDate.setMonth(monthDate.getMonth() - i);
    monthDate.setDate(1);
    
    const monthData = await fetchDistrictData(districtCode, monthDate);
    data.push(monthData);
  }
  
  console.log(`✓ Fetched ${data.length} months of data`);
  return data;
}

/**
 * Get all districts
 */
async function getAllDistricts() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT id, name, state, district_code FROM districts ORDER BY name'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  } finally {
    if (client) client.release();
  }
}

/**
 * Get district by code
 */
async function getDistrictByCode(code) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT id, name, state, district_code FROM districts WHERE district_code = $1',
      [code]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching district:', error);
    return null;
  } finally {
    if (client) client.release();
  }
}

// Export all functions
module.exports = {
  fetchDistrictData,
  fetchHistoricalData,
  getAllDistricts,
  getDistrictByCode,
  generateMockData,
  fetchFromMGNREGAAPI,
  getFromDatabase,
  saveToDatabase,
};