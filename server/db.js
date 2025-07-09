const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'neha@9294',
  database: 'cleantogether',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL pool connection error:', err);
  } else {
    console.log('✅ Connected to MySQL DB via pool');
    connection.release(); // Release immediately after checking
  }
});

module.exports = db;
