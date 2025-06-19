const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Saloni@123', // Enter the password you use in the popup
  database: 'cleantogether'
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL DB');
  }
});

module.exports = db;
