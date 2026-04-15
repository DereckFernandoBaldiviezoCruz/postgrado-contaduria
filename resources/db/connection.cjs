const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "maestrias"
});

connection.connect(err => {
  if (err) {
    console.log("Error MySQL:", err);
  } else {
    console.log("✅ MySQL conectado");
  }
});

module.exports = connection;
