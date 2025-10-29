const { Pool } = require('pg');

const pool = new Pool({
  user: 'mgnrega_user',
  host: 'localhost',
  database: 'mgnrega_db',
  password: 'mgnrega',
  port: 5432,
});

pool.query('SELECT COUNT(*) FROM districts', (err, res) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('✓ Database connected!');
    console.log('Districts count:', res.rows[0].count);
  }
  pool.end();
});