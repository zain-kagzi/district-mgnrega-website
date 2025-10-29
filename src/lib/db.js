// src/lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for most hosted databases
  },
  max: 10, // Reduced for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Vercel serverless optimization
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { duration, rows: result.rowCount });
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