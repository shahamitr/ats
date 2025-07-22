const mysql = require('mysql2/promise');

// It's recommended to use a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'ats_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Database connection pool created.');
module.exports = pool;