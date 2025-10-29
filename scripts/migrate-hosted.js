// scripts/migrate-hosted.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('Running migrations...');
  
  try {
    // Read and execute schema
    const schema = fs.readFileSync('./src/db/schema.sql', 'utf8');
    await pool.query(schema);
    console.log('✓ Schema created');
    
    // Read and execute seed
    const seed = fs.readFileSync('./src/db/seed.sql', 'utf8');
    await pool.query(seed);
    console.log('✓ Data seeded');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();