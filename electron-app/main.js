const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const mysql = require("mysql");
const fs = require("fs");
const PDFDocument = require("pdfkit");
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
      "SELECT account_id, description, account_class, account_balance FROM accounts",
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

ipcMain.handle("fetch-transaction-details", async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        t.transaction_id,
        c.name AS client_name,
        t.transaction_date,
        t.description,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'description', a.description,
            'type', IF(tl.amount > 0, 'Credit', 'Debit'),
            'amount', ABS(tl.amount)
          )
        ) AS accounts
      FROM transactions t
      JOIN clients c ON t.client_id = c.client_id
      JOIN transaction_lines tl ON t.transaction_id = tl.transaction_id
      JOIN accounts a ON tl.account_id = a.account_id
      GROUP BY t.transaction_id, c.name, t.transaction_date, t.description
      ORDER BY t.transaction_date DESC;
    `;

    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching transaction details:", error);
        reject(error);
      } else {
        // Parse accounts JSON string
        const parsedResults = results.map((row) => ({
          ...row,
          accounts: JSON.parse(row.accounts),
        }));
        console.log("Fetched transaction details:", parsedResults); // Debug log
        resolve(parsedResults);
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

ipcMain.handle(
  "generate-pdf-report",
  async (event, { reportPath, content }) => {
    try {
      if (!content) {
        throw new Error("Content is undefined or empty.");
      }

      console.log("Generating PDF report...");
      console.log("Report Path: ", reportPath);
      console.log("Content: ", content);

      const {
        assetAccounts,
        liabilityAccounts,
        equityAccounts,
        totalAssets,
        totalLiabilities,
        totalEquity,
      } = content;

      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(reportPath));

      // Title and date
      doc.fontSize(20).text("Balance Sheet", { align: "center" });
      doc.moveDown(0.5);

      // Add the current date in full form below the title
      const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.fontSize(14).text(`${currentDate}`, { align: "center" });
      doc.moveDown(2);

      // Assets
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("ASSETS", { align: "left", underline: true });
      doc.moveDown(0.5);

      assetAccounts.forEach((account) => {
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(account.description, { continued: true });
        doc
          .fontSize(12)
          .text(`$${account.account_balance.toFixed(2)}`, { align: "right" });
        doc.moveDown(0.5);
      });

      doc.moveDown(0.5);
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .moveTo(40, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);
      doc.text(`TOTAL ASSETS`, { continued: true, underline: false });
      doc.text(`$${totalAssets.toFixed(2)}`, { align: "right" });
      doc.moveDown(2.5); // Increase space after total

      // Liabilities
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("LIABILITIES", { align: "left", underline: true });
      doc.moveDown(0.5);

      liabilityAccounts.forEach((account) => {
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(account.description, { continued: true });
        doc
          .fontSize(12)
          .text(`$${account.account_balance.toFixed(2)}`, { align: "right" });
        doc.moveDown(0.5);
      });

      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .moveTo(40, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);
      doc.text(`TOTAL LIABILITIES`, { continued: true, underline: false });
      doc.text(`$${totalLiabilities.toFixed(2)}`, { align: "right" });
      doc.moveDown(2.5); // Increase space after total

      // Owner's Equity
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("OWNER'S EQUITY", { align: "left", underline: true });
      doc.moveDown(0.5);

      equityAccounts.forEach((account) => {
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(account.description, { continued: true });
        doc
          .fontSize(12)
          .text(`$${account.account_balance.toFixed(2)}`, { align: "right" });
        doc.moveDown(0.5);
      });

      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .moveTo(40, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);
      doc.text(`Total Owner's Equity`, { continued: true });
      doc.text(`$${totalEquity.toFixed(2)}`, { align: "right" });
      doc.moveDown(2.5); // Increase space after total

      // Total Liabilities and Owner's Equity
      doc.moveDown(1.5);
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("TOTAL LIABILITIES & OWNER'S EQUITY", {
          align: "left",
          underline: false,
          continued: true,
        });
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(`$${(totalLiabilities + totalEquity).toFixed(2)}`, {
          align: "right",
        });

      doc.end();

      return "Report generated successfully.";
    } catch (error) {
      console.error("Error generating PDF report: ", error);
      throw new Error(error.message);
    }
  },
);

ipcMain.handle("delete-transaction", async (event, transactionId) => {
  try {
    // Start a transaction
    await connection.beginTransaction();

    // Get the transaction details
    const transactionLines = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT account_id, amount FROM transaction_lines WHERE transaction_id = ?`,
        [transactionId],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        },
      );
    });

    if (!Array.isArray(transactionLines) || transactionLines.length === 0) {
      throw new Error(
        "No transaction lines found for the given transaction ID.",
      );
    }

    // Rollback the changes to the accounts
    for (const line of transactionLines) {
      await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE accounts SET account_balance = account_balance + ? WHERE account_id = ?`,
          [-line.amount, line.account_id],
          (error) => {
            if (error) return reject(error);
            resolve();
          },
        );
      });
    }

    // Delete the transaction lines
    await new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM transaction_lines WHERE transaction_id = ?`,
        [transactionId],
        (error) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });

    // Delete the transaction
    await new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM transactions WHERE transaction_id = ?`,
        [transactionId],
        (error) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });

    // Commit the transaction
    await connection.commit();
    return { success: true };
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();
    return { success: false, error: error.message };
  }
});
