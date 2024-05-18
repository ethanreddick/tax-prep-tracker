const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const mysql = require("mysql");
const fs = require("fs");
const crypto = require("crypto");

// Read and parse the configuration file
const configPath = path.join(__dirname, "../config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const algorithm = "aes-256-cbc";
const key = Buffer.from(config.key, "hex");
const iv = Buffer.from(config.iv, "hex");

function decrypt(encrypted) {
  const encryptedText = Buffer.from(encrypted, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Decrypt the credentials
const credentials = decrypt(config.encrypted).split(":");

const connection = mysql.createConnection({
  host: "localhost",
  user: credentials[0],
  password: credentials[1],
  database: "tax_prep_db",
});

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  // Load the index.html of the app.
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.on("ready", createWindow);

ipcMain.handle("fetch-clients", async () => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT client_id, name FROM clients",
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      },
    );
  });
});

ipcMain.handle("fetch-client", async (event, clientId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM clients WHERE client_id = ?",
      [clientId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      },
    );
  });
});

ipcMain.handle("add-client", async (event, client) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO clients (name, ssn, address, bank) VALUES (?, ?, ?, ?)",
      [client.name, client.ssn, client.address, client.bank],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      },
    );
  });
});

ipcMain.handle("update-client", async (event, client) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE clients SET name = ?, ssn = ?, address = ?, bank = ? WHERE client_id = ?",
      [client.name, client.ssn, client.address, client.bank, client.id],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      },
    );
  });
});

ipcMain.handle("remove-client", async (event, clientId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "DELETE FROM clients WHERE client_id = ?",
      [clientId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      },
    );
  });
});

ipcMain.handle("add-account", async (event, account) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO accounts (description, account_class, statement_type, account_balance) VALUES (?, ?, ?, ?)",
      [
        account.description,
        account.accountClass,
        account.statementType,
        account.accountBalance,
      ],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      },
    );
  });
});

ipcMain.handle("fetch-accounts", async () => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT account_id, description FROM accounts",
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      },
    );
  });
});

ipcMain.handle("fetch-account", async (event, accountId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM accounts WHERE account_id = ?",
      [accountId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      },
    );
  });
});

ipcMain.handle("update-account", async (event, account) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE accounts SET description = ?, account_class = ?, statement_type = ?, account_balance = ? WHERE account_id = ?",
      [
        account.description,
        account.account_class,
        account.statement_type,
        account.account_balance,
        account.id,
      ],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      },
    );
  });
});

ipcMain.handle("remove-account", async (event, accountId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "DELETE FROM accounts WHERE account_id = ?",
      [accountId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      },
    );
  });
});
