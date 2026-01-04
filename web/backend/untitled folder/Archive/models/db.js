const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// Create a connection pool
// This setup works for standard local Windows MySQL installations (XAMPP/WAMP)
// as well as custom configured environments via .env
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",       // Default XAMPP/WAMP user
  password: process.env.DB_PASSWORD || "",   // Default XAMPP/WAMP password (empty)
  database: process.env.DB_NAME || "curevirtual",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Check connection
db.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused. Check if your Windows MySQL server is running.');
    }
  }
  if (connection) connection.release();
  return;
});

// Export promise-wrapped pool for async/await usage
module.exports = db.promise();
