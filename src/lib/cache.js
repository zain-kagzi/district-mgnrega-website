// src/lib/cache.js
import pool from './db.js';

export async function getCache(key) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT cache_data, expires_at 
       FROM api_cache 
       WHERE cache_key = $1 AND expires_at > NOW()`,
      [key]
    );
    
    if (result.rows.length > 0) {
      console.log(`✓ Cache HIT for key: ${key}`);
      const data = result.rows[0].cache_data;
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
    
    console.log(`✗ Cache MISS for key: ${key}`);
    return null;
  } catch (error) {
    console.error('Cache GET error:', error);
    return null;
  } finally {
    if (client) client.release();
  }
}

export async function setCache(key, data, hoursToExpire = 6) {
  let client;
  try {
    client = await pool.connect();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hoursToExpire);
    
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
    
    await client.query(
      `INSERT INTO api_cache (cache_key, cache_data, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (cache_key) 
       DO UPDATE SET 
         cache_data = $2, 
         expires_at = $3, 
         created_at = NOW()`,
      [key, jsonData, expiresAt]
    );
    
    console.log(`✓ Cache SET for key: ${key}, expires in ${hoursToExpire} hours`);
  } catch (error) {
    console.error('Cache SET error:', error);
  } finally {
    if (client) client.release();
  }
}

export async function deleteCache(key) {
  let client;
  try {
    client = await pool.connect();
    await client.query('DELETE FROM api_cache WHERE cache_key = $1', [key]);
    console.log(`✓ Cache DELETED for key: ${key}`);
  } catch (error) {
    console.error('Cache DELETE error:', error);
  } finally {
    if (client) client.release();
  }
}

export async function clearExpiredCache() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'DELETE FROM api_cache WHERE expires_at < NOW()'
    );
    const deletedCount = result.rowCount || 0;
    console.log(`✓ Cleared ${deletedCount} expired cache entries`);
    return deletedCount;
  } catch (error) {
    console.error('Clear expired cache error:', error);
    return 0;
  } finally {
    if (client) client.release();
  }
}

export async function clearAllCache() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('DELETE FROM api_cache');
    const deletedCount = result.rowCount || 0;
    console.log(`✓ Cleared all cache (${deletedCount} entries)`);
    return deletedCount;
  } catch (error) {
    console.error('Clear all cache error:', error);
    return 0;
  } finally {
    if (client) client.release();
  }
}

export async function getCacheStats() {
  let client;
  try {
    client = await pool.connect();
    const totalResult = await client.query(
      'SELECT COUNT(*) as count FROM api_cache'
    );
    const expiredResult = await client.query(
      'SELECT COUNT(*) as count FROM api_cache WHERE expires_at < NOW()'
    );
    
    const total = parseInt(totalResult.rows[0].count);
    const expired = parseInt(expiredResult.rows[0].count);
    
    return {
      total,
      expired,
      active: total - expired,
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { total: 0, expired: 0, active: 0 };
  } finally {
    if (client) client.release();
  }
}