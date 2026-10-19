require('dotenv').config({ quiet: true });
const { Pool, types } = require('pg');
types.setTypeParser(1700, (v) => parseFloat(v));
types.setTypeParser(20, (v) => parseInt(v, 10));
module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
