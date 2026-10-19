const fs = require('fs');
const path = require('path');
const pool = require('./db');
(async () => {
  try {
    await pool.query(fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8'));
    console.log('Database tables created (old tables were dropped).');
  } catch (e) {
    console.error('Failed:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
