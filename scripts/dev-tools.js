// scripts/dev-tools.js
const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
  user: process.env.DB_USER || 'mgnrega_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mgnrega_db',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║  MGNREGA Dashboard - Developer Tools         ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  console.log('1. View Database Statistics');
  console.log('2. Clear All Cache');
  console.log('3. Reset Performance Data');
  console.log('4. Seed Sample Data');
  console.log('5. Test Database Connection');
  console.log('6. View Recent Logs');
  console.log('7. Backup Database');
  console.log('8. Check System Health');
  console.log('0. Exit\n');
}

async function viewStats() {
  const client = await pool.connect();
  try {
    console.log('\n📊 Database Statistics:\n');
    
    const districts = await client.query('SELECT COUNT(*) FROM districts');
    console.log(`Districts: ${districts.rows[0].count}`);
    
    const performance = await client.query('SELECT COUNT(*) FROM district_performance');
    console.log(`Performance Records: ${performance.rows[0].count}`);
    
    const cache = await client.query('SELECT COUNT(*) FROM api_cache');
    console.log(`Cache Entries: ${cache.rows[0].count}`);
    
    const latest = await client.query('SELECT MAX(month) FROM district_performance');
    console.log(`Latest Month: ${latest.rows[0].max ? new Date(latest.rows[0].max).toLocaleDateString() : 'N/A'}`);
    
  } finally {
    client.release();
  }
}

async function clearCache() {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM api_cache');
    console.log(`\n✓ Cleared ${result.rowCount} cache entries`);
  } finally {
    client.release();
  }
}

async function resetPerformanceData() {
  rl.question('\n⚠️  This will delete ALL performance data. Continue? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() === 'yes') {
      const client = await pool.connect();
      try {
        const result = await client.query('DELETE FROM district_performance');
        console.log(`\n✓ Deleted ${result.rowCount} records`);
      } finally {
        client.release();
      }
    } else{
        console.log('\n❌ Operation cancelled');
    }
    mainMenu();
  });
}

async function seedSampleData() {
  console.log('\n🌱 Seeding sample data...\n');
  const { fetchAllDistrictsData } = require('../src/jobs/fetch-mgnrega-data');
  await fetchAllDistrictsData();
  console.log('\n✓ Sample data seeded successfully');
}

async function testConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW(), version()');
    console.log('\n✓ Database Connection Successful!');
    console.log(`Time: ${result.rows[0].now}`);
    console.log(`Version: ${result.rows[0].version.split(',')[0]}`);
  } catch (error) {
    console.log('\n❌ Database Connection Failed!');
    console.error(error.message);
  } finally {
    client.release();
  }
}

async function viewRecentLogs() {
  const fs = require('fs');
  const path = require('path');
  const logsPath = path.join(__dirname, '..', 'logs');
  
  try {
    if (!fs.existsSync(logsPath)) {
      console.log('\n📝 No logs directory found');
      return;
    }
    
    const files = fs.readdirSync(logsPath)
      .filter(f => f.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, 5);
    
    if (files.length === 0) {
      console.log('\n📝 No log files found');
      return;
    }
    
    console.log('\n📝 Recent Log Files:\n');
    files.forEach((file, idx) => {
      const stats = fs.statSync(path.join(logsPath, file));
      console.log(`${idx + 1}. ${file} (${(stats.size / 1024).toFixed(2)}KB) - ${stats.mtime.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error reading logs:', error.message);
  }
}

async function backupDatabase() {
  console.log('\n💾 Creating database backup...\n');
  const { exec } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(backupDir, `mgnrega_backup_${timestamp}.sql`);
  
  const command = `pg_dump -U ${process.env.DB_USER || 'mgnrega_user'} -h ${process.env.DB_HOST || 'localhost'} -d ${process.env.DB_NAME || 'mgnrega_db'} > "${backupFile}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backup failed:', error.message);
      mainMenu();
      return;
    }
    
    const stats = fs.statSync(backupFile);
    console.log(`✓ Backup created successfully!`);
    console.log(`Location: ${backupFile}`);
    console.log(`Size: ${(stats.size / 1024).toFixed(2)}KB\n`);
    mainMenu();
  });
}

async function checkSystemHealth() {
  console.log('\n🏥 System Health Check:\n');
  
  try {
    // Check database
    const client = await pool.connect();
    console.log('✓ Database: Connected');
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`✓ Tables: ${tables.rows.length} found`);
    
    // Check disk space (Windows)
    const { exec } = require('child_process');
    exec('wmic logicaldisk get size,freespace,caption', (error, stdout) => {
      if (!error) {
        console.log('\n💾 Disk Space:');
        console.log(stdout);
      }
    });
    
    // Check Node.js version
    console.log(`✓ Node.js: ${process.version}`);
    
    // Check memory usage
    const used = process.memoryUsage();
    console.log(`\n💻 Memory Usage:`);
    console.log(`  RSS: ${(used.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Used: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    client.release();
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function mainMenu() {
  showMenu();
  
  rl.question('Select option: ', async (answer) => {
    console.log('');
    
    switch(answer) {
      case '1':
        await viewStats();
        mainMenu();
        break;
      case '2':
        await clearCache();
        mainMenu();
        break;
      case '3':
        await resetPerformanceData();
        break;
      case '4':
        await seedSampleData();
        mainMenu();
        break;
      case '5':
        await testConnection();
        mainMenu();
        break;
      case '6':
        await viewRecentLogs();
        mainMenu();
        break;
      case '7':
        await backupDatabase();
        break;
      case '8':
        await checkSystemHealth();
        mainMenu();
        break;
      case '0':
        console.log('Goodbye! 👋\n');
        rl.close();
        pool.end();
        process.exit(0);
        break;
      default:
        console.log('Invalid option. Please try again.');
        mainMenu();
    }
  });
}

// Start the menu
mainMenu();