// src/lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'mgnrega_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mgnrega_db',
  password: process.env.DB_PASSWORD || 'mgnrega',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✓ New client connected to database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✓ Database connection successful at:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export async function getClient() {
  return await pool.connect();
}

export default pool;