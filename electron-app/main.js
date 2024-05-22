const { app, BrowserWindow, ipcMain, dialog } = require("electron");
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
    height: 1000,
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

ipcMain.handle("add-transaction", async (event, transaction) => {
  return new Promise((resolve, reject) => {
    const { client_id, description, date, lines } = transaction;

    // Start a transaction
    connection.beginTransaction((err) => {
      if (err) {
        reject(err);
        return;
      }

      // Insert into transactions table
      connection.query(
        "INSERT INTO transactions (client_id, transaction_date, description) VALUES (?, ?, ?)",
        [client_id, date, description],
        (error, results) => {
          if (error) {
            return connection.rollback(() => {
              reject(error);
            });
          }

          const transactionId = results.insertId;

          // Prepare transaction lines queries
          const transactionLineQueries = lines.map((line) => {
            const { account_id, type, amount } = line;
            const signedAmount = type === "Debit" ? -amount : amount;
            return new Promise((resolve, reject) => {
              connection.query(
                "INSERT INTO transaction_lines (transaction_id, account_id, amount) VALUES (?, ?, ?)",
                [transactionId, account_id, signedAmount],
                (error, results) => {
                  if (error) {
                    return reject(error);
                  }

                  // Update account balance
                  connection.query(
                    "UPDATE accounts SET account_balance = account_balance + ? WHERE account_id = ?",
                    [signedAmount, account_id],
                    (error, results) => {
                      if (error) {
                        return reject(error);
                      }
                      resolve();
                    },
                  );
                },
              );
            });
          });

          // Execute all transaction line queries
          Promise.all(transactionLineQueries)
            .then(() => {
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    reject(err);
                  });
                }
                resolve();
              });
            })
            .catch((error) => {
              connection.rollback(() => {
                reject(error);
              });
            });
        },
      );
    });
  });
});

ipcMain.handle("fetch-transaction-history", async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        t.transaction_id,
        c.name AS client_name,
        t.transaction_date,
        t.description,
        SUM(CASE WHEN tl.amount > 0 THEN tl.amount ELSE 0 END) AS amount
      FROM transactions t
      JOIN clients c ON t.client_id = c.client_id
      JOIN transaction_lines tl ON t.transaction_id = tl.transaction_id
      GROUP BY t.transaction_id, c.name, t.transaction_date, t.description
      ORDER BY t.transaction_date DESC;
    `;

    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
});

ipcMain.handle("fetch-transactions", async () => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM transactions ORDER BY transaction_date DESC",
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

// Add a handler for the directory dialog
ipcMain.handle("open-directory-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (result.canceled) {
    return "";
  } else {
    return result.filePaths[0];
  }
});
