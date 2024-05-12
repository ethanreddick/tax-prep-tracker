const mysql = require("mysql");
const fs = require("fs");
const crypto = require("crypto");

// Read and parse the configuration file
const config = JSON.parse(fs.readFileSync("../config.json", "utf8"));
const algorithm = "aes-256-cbc";
const key = Buffer.from(config.key, "hex");
const iv = Buffer.from(config.iv, "hex");

function decrypt(encrypted, key, iv) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Decrypt the credentials
const credentials = JSON.parse(decrypt(config.encrypted, key, iv));

// Create a connection to the database using the decrypted credentials
const connection = mysql.createConnection({
  host: "localhost", // Or your MySQL server host
  user: credentials.username, // 'username' should match the key in your stored JSON
  password: credentials.password, // 'password' should match the key in your stored JSON
  database: "tax_prep_db", // Make sure this is your database name
});

// Connect to the database
connection.connect((error) => {
  if (error) {
    return console.error("Error connecting to the database: " + error.message);
  }
  console.log("Connected to the MySQL server.");
});

// Function to run a query
function executeQuery(sql, callback) {
  connection.query(sql, function (error, results, fields) {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
}

// Function to close the database connection
function closeConnection() {
  connection.end();
}

module.exports = { executeQuery, closeConnection };
