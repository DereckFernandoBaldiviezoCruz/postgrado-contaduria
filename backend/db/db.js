const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const caPath = path.join(__dirname, 'ca.pem');

const pool = mysql.createPool({
  host: 'mysql-2bfe0608-postgrado-contaduria-usfx.b.aivencloud.com',
  port: 19202,
  user: 'avnadmin',
  password: 'AVNS_8Pk-jC0Ll43h_BSYMbr',
  database: 'defaultdb',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    ca: fs.readFileSync(caPath),
  },
});

module.exports = pool;
