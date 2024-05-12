const mysql = require("mysql");
const fs = require("fs");
const crypto = require("crypto");

// Read and parse the configuration file
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const algorithm = "aes-256-cbc";
const key = Buffer.from(config.key, "hex");
const iv = Buffer.from(config.iv, "hex");

function decrypt(encrypted) {
  const textParts = encrypted.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Decrypt the credentials
const credentials = JSON.parse(decrypt(config.data));

// Create a connection to the database using the decrypted credentials
const connection = mysql.createConnection({
  host: "localhost",
  user: credentials.user,
  password: credentials.password,
  database: "tax_prep_db",
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
