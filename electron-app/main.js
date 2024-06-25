const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const mysql = require("mysql2");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const crypto = require("crypto");
const { autoUpdater } = require("electron-updater");
const { exec } = require('child_process');
const os = require('os');

// Read and parse the configuration file
const configPath = path.join(app.getPath('appData'), 'TaxPrepTracker', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const algorithm = "aes-256-cbc";
const key = Buffer.from(config.key, "hex");
const iv = Buffer.from(config.iv, "hex");

// Function to log errors
function logError(error) {
  try {
    const logFilePath = path.join(os.homedir(), 'tax-prep-tracker-error_log.txt');
    const logMessage = `${new Date().toISOString()} - ${error.stack || error}\n\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
    console.log(`Logged error to ${logFilePath}`);
  } catch (logError) {
    console.error('Failed to write error log:', logError);
  }
}

// Catch unhandled exceptions and promise rejections
process.on('uncaughtException', (error) => {
  console.error('Unhandled Exception:', error);
  logError(error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  logError(reason);
});

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
  database: "tax_prep_db"
});

// Attempt to connect and log any errors
connection.connect((err) => {
  if (err) {
    logError(`Error connecting to MySQL: ${err.message}`);
    console.error(`Error connecting to MySQL: ${err.message}`);
  } else {
    console.log('Connected to MySQL successfully.');
  }
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

  console.log('Creating main window');

  // Load the index.html of the app.
  win.loadFile(path.join(__dirname, "renderer", "index.html"));

  win.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.on("ready", createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Update available",
    message: "A new version is available. Downloading now...",
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox({
      type: "info",
      title: "Update ready",
      message:
        "A new version has been downloaded. Restart the application to apply the updates.",
      buttons: ["Restart", "Later"],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});

// Helper functions for date calculations
function getFiscalYearStart() {
  const now = new Date();
  const year = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(year, 9, 1); // October 1st of the fiscal year
}

function getToday() {
  return new Date();
}

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
            // Credits should be negative, debits positive
            const signedAmount = type === "Debit" ? amount : -amount;
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
        logError(error);
        reject(error);
      } else {
        try {
          // Log raw query results for debugging
          console.log("Raw query results:", results);
          const logFilePath = path.join(os.homedir(), 'tax-prep-tracker-query_log.txt');
          fs.appendFileSync(logFilePath, `${new Date().toISOString()} - Raw query results: ${JSON.stringify(results)}\n\n`, 'utf8');

          // Since accounts is already parsed as an array of objects, no need to JSON.parse
          const parsedResults = results.map((row) => ({
            ...row,
            accounts: row.accounts || [], // Ensure accounts is always an array
          }));
          console.log("Parsed transaction details:", parsedResults); // Debug log
          fs.appendFileSync(logFilePath, `${new Date().toISOString()} - Parsed transaction details: ${JSON.stringify(parsedResults)}\n\n`, 'utf8');
          resolve(parsedResults);
        } catch (parseError) {
          console.error("Error parsing transaction details:", parseError);
          logError(parseError);
          reject(parseError);
        }
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
  async (event, { reportPath, content, reportType }) => {
    try {
      if (!content) {
        throw new Error("Content is undefined or empty.");
      }

      console.log("Generating PDF report...");
      console.log("Report Path:", reportPath);
      console.log("Report Type:", reportType);
      console.log("Content:", content);

      const {
        assetAccounts,
        liabilityAccounts,
        equityAccounts,
        trialBalanceData = [],
        totalAssets,
        totalLiabilities,
        totalEquity,
      } = content;

      let revenueAccounts = [];
      let expenseAccounts = [];
      let totalRevenue = 0;
      let totalExpenses = 0;

      if (reportType === "incomeStatement") {
        revenueAccounts = await fetchRevenueAccounts();
        expenseAccounts = await fetchExpenseAccounts();

        totalRevenue = revenueAccounts.reduce(
          (sum, account) => sum + account.account_balance,
          0,
        );
        totalExpenses = expenseAccounts.reduce(
          (sum, account) => sum + account.account_balance,
          0,
        );
      }

      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(reportPath));

      // Helper function to format numbers with commas
      const formatNumber = (num) => {
        if (typeof num !== 'number') {
          num = parseFloat(num);
        }
        if (isNaN(num)) {
          num = 0;
        }
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };

      // Title and date
      let title = "";
      let dateRange = "";
      const currentDate = new Date();

      if (reportType === "balanceSheet") {
        title = "Balance Sheet";
        dateRange = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        const startOfYear = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() >= 9 ? 9 : -3,
          1,
        );
        dateRange = `${startOfYear.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })} - ${currentDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`;
      }

      if (reportType === "incomeStatement") {
        title = "Income Statement";
      } else if (reportType === "trialBalance") {
        title = "Trial Balance";
      }

      doc.fontSize(20).text(title, { align: "center" });
      doc.moveDown(0.5);

      // Add the date range
      doc.fontSize(14).text(`${dateRange}`, { align: "center" });
      doc.moveDown(2);

      if (reportType === "balanceSheet") {
        // Balance Sheet report generation code...

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
          doc.fontSize(12).text(`$${formatNumber(account.account_balance)}`, {
            align: "right",
          });
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
        doc.text(`$${formatNumber(totalAssets)}`, { align: "right" });
        doc.moveDown(2.5); // Increase space after total

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
          doc.fontSize(12).text(`$${formatNumber(account.account_balance)}`, {
            align: "right",
          });
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
        doc.text(`$${formatNumber(totalLiabilities)}`, { align: "right" });
        doc.moveDown(2.5); // Increase space after total

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
          doc.fontSize(12).text(`$${formatNumber(account.account_balance)}`, {
            align: "right",
          });
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
        doc.text(`$${formatNumber(totalEquity)}`, { align: "right" });
        doc.moveDown(2.5); // Increase space after total

        doc.moveDown(1.5);
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("TOTAL LIABILITIES & OWNER'S EQUITY", {
            align: "left",
            underline: false,
            continued: true,
          });
        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(`$${formatNumber(totalLiabilitiesAndEquity)}`, {
            align: "right",
          });

        // Check if totals match
        if (totalAssets !== totalLiabilitiesAndEquity) {
          const difference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
          doc.moveDown(2);
          doc
            .fontSize(16)
            .font("Helvetica-Bold")
            .fillColor("red")
            .text("EQUATION NOT IN BALANCE", { align: "center" });
          doc.moveDown(0.5);
          doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text(`CROSS-CHECK $${formatNumber(difference)}`, {
              align: "center",
            })
            .fillColor("black"); // Reset color to black for subsequent text
        }
      } else if (reportType === "incomeStatement") {
        // Income Statement report generation code...

        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("REVENUE", { align: "left", underline: true });
        doc.moveDown(0.5);

        revenueAccounts.forEach((account) => {
          doc
            .fontSize(12)
            .font("Helvetica")
            .text(account.description, { continued: true });
          doc.fontSize(12).text(`$${formatNumber(account.account_balance)}`, {
            align: "right",
          });
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
        doc.text(`TOTAL REVENUE`, { continued: true, underline: false });
        doc.text(`$${formatNumber(totalRevenue)}`, { align: "right" });
        doc.moveDown(2.5); // Increase space after total

        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("EXPENSES", { align: "left", underline: true });
        doc.moveDown(0.5);

        expenseAccounts.forEach((account) => {
          doc
            .fontSize(12)
            .font("Helvetica")
            .text(account.description, { continued: true });
          doc.fontSize(12).text(`$${formatNumber(account.account_balance)}`, {
            align: "right",
          });
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
        doc.text(`TOTAL EXPENSES`, { continued: true, underline: false });
        doc.text(`$${formatNumber(totalExpenses)}`, { align: "right" });
        doc.moveDown(2.5); // Increase space after total

        const netIncome = totalRevenue - totalExpenses;
        doc.moveDown(1.5);
        doc.fontSize(16).font("Helvetica-Bold").text("NET INCOME", {
          align: "left",
          underline: false,
          continued: true,
        });
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(`$${formatNumber(netIncome)}`, {
            align: "right",
          });
      } else if (reportType === "trialBalance") {
        // Trial Balance

        // Headers
        const columnWidth = (doc.page.width - 80) / 3;
        let startX = 40;
        let currentY = doc.y;

        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Account", startX, currentY, { width: columnWidth });
        startX = 105;
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Debit", startX + columnWidth, currentY, {
            width: columnWidth,
            align: "center",
            underline: true,
          });
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Credit", startX + 2 * columnWidth, currentY, {
            width: columnWidth,
            align: "center",
            underline: true,
          });
        startX = 40;
        doc.moveDown(1);

        currentY = doc.y;

        let totalDebits = 0;
        let totalCredits = 0;

        // Iterate through trialBalanceData
        trialBalanceData.forEach(
          ({ description, total_debit, total_credit }) => {
            const netChange = total_credit - total_debit;
            let debit = 0;
            let credit = 0;

            if (netChange > 0) {
              credit = netChange;
            } else {
              debit = -netChange;
            }

            if (debit !== 0 || credit !== 0) {
              totalDebits += debit;
              totalCredits += credit;

              doc
                .fontSize(12)
                .font("Helvetica")
                .text(description, startX, currentY, { width: columnWidth });

              if (debit !== 0) {
                doc
                  .fontSize(12)
                  .text(
                    `$${formatNumber(debit)}`,
                    startX + columnWidth,
                    currentY,
                    {
                      width: columnWidth,
                      align: "right",
                    },
                  );
              }

              if (credit !== 0) {
                doc
                  .fontSize(12)
                  .text(
                    `$${formatNumber(credit)}`,
                    startX + 2 * columnWidth,
                    currentY,
                    {
                      width: columnWidth,
                      align: "right",
                    },
                  );
              }

              currentY += 20;
            }
          },
        );

        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .moveTo(startX, currentY)
          .lineTo(startX + columnWidth * 3, currentY)
          .stroke()
          .moveDown(0.5);
        doc.text(`Totals`, startX, currentY + 5, { width: columnWidth });

        doc.text(
          `$${formatNumber(totalDebits)}`,
          startX + columnWidth,
          currentY + 5,
          {
            width: columnWidth,
            align: "right",
          },
        );

        doc.text(
          `$${formatNumber(totalCredits)}`,
          startX + 2 * columnWidth,
          currentY + 5,
          {
            width: columnWidth,
            align: "right",
          },
        );
      }

      doc.end();

      return `${title} generated successfully.`;
    } catch (error) {
      console.error("Error generating PDF report: ", error);
      logError(error);
      throw new Error(error.message);
    }
  },
);

ipcMain.handle("delete-transaction", async (event, transactionId) => {
  try {
    logError(`Starting deletion for transaction ID: ${transactionId}`);
    await new Promise((resolve, reject) => {
      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          logError(`Error starting transaction: ${transactionErr.message}`);
          reject(transactionErr);
        } else {
          resolve();
        }
      });
    });

    const transactionLines = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT account_id, amount FROM transaction_lines WHERE transaction_id = ?`,
        [transactionId],
        (selectErr, results) => {
          if (selectErr) {
            logError(`Error selecting transaction lines: ${selectErr.message}`);
            reject(selectErr);
          } else {
            resolve(results);
          }
        }
      );
    });

    if (!Array.isArray(transactionLines) || transactionLines.length === 0) {
      throw new Error("No transaction lines found for the given transaction ID.");
    }

    await Promise.all(transactionLines.map((line) => {
      return new Promise((resolve, reject) => {
        connection.query(
          `UPDATE accounts SET account_balance = account_balance + ? WHERE account_id = ?`,
          [-line.amount, line.account_id],
          (updateErr) => {
            if (updateErr) {
              reject(updateErr);
            } else {
              resolve();
            }
          }
        );
      });
    }));

    await new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM transaction_lines WHERE transaction_id = ?`,
        [transactionId],
        (deleteLinesErr) => {
          if (deleteLinesErr) {
            logError(`Error deleting transaction lines: ${deleteLinesErr.message}`);
            reject(deleteLinesErr);
          } else {
            resolve();
          }
        }
      );
    });

    await new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM transactions WHERE transaction_id = ?`,
        [transactionId],
        (deleteTransactionErr) => {
          if (deleteTransactionErr) {
            logError(`Error deleting transaction: ${deleteTransactionErr.message}`);
            reject(deleteTransactionErr);
          } else {
            resolve();
          }
        }
      );
    });

    await new Promise((resolve, reject) => {
      connection.commit((commitErr) => {
        if (commitErr) {
          logError(`Error committing transaction: ${commitErr.message}`);
          reject(commitErr);
        } else {
          logError(`Successfully deleted transaction ID: ${transactionId}`);
          resolve();
        }
      });
    });

    return { success: true };
  } catch (error) {
    logError(`Error during deletion of transaction ID: ${transactionId} - ${error.message}`);
    await new Promise((resolve) => connection.rollback(resolve));
    return { success: false, error: error.message };
  }
});

// Expose a method to log errors from renderer process
ipcMain.handle("log-error", async (event, errorMessage) => {
  logError(errorMessage);
});

async function fetchTrialBalanceData() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        a.account_id,
        a.description,
        a.account_class,
        SUM(CASE WHEN tl.amount > 0 THEN tl.amount ELSE 0 END) AS total_credit,
        SUM(CASE WHEN tl.amount < 0 THEN -tl.amount ELSE 0 END) AS total_debit
      FROM
        accounts a
        LEFT JOIN transaction_lines tl ON a.account_id = tl.account_id
        LEFT JOIN transactions t ON tl.transaction_id = t.transaction_id
      WHERE
        YEAR(t.transaction_date) = YEAR(CURDATE())
      GROUP BY
        a.account_id, a.description, a.account_class
    `;
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        const trialBalanceData = results
          .filter(
            (result) => result.total_credit !== 0 || result.total_debit !== 0,
          )
          .map((result) => ({
            description: result.description,
            total_debit: parseFloat(result.total_debit.toFixed(2)),
            total_credit: parseFloat(result.total_credit.toFixed(2)),
          }));
        resolve(trialBalanceData);
      }
    });
  });
}

ipcMain.handle("fetch-trial-balance-data", async (event) => {
  try {
    const query = `
      SELECT
        a.account_id,
        a.description,
        a.account_class,
        SUM(CASE WHEN tl.amount < 0 THEN -tl.amount ELSE 0 END) AS total_debit,
        SUM(CASE WHEN tl.amount > 0 THEN tl.amount ELSE 0 END) AS total_credit
      FROM
        accounts a
        LEFT JOIN transaction_lines tl ON a.account_id = tl.account_id
        LEFT JOIN transactions t ON tl.transaction_id = t.transaction_id
      WHERE
        YEAR(t.transaction_date) = YEAR(CURDATE())
      GROUP BY
        a.account_id, a.description, a.account_class
    `;

    const results = await new Promise((resolve, reject) => {
      connection.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    return results;
  } catch (error) {
    console.error("Error fetching trial balance data:", error);
    throw error;
  }
});

async function fetchRevenueAccounts() {
  return new Promise((resolve, reject) => {
    const fiscalYearStart = getFiscalYearStart().toISOString().split("T")[0];
    const today = getToday().toISOString().split("T")[0];
    const query = `
      SELECT
        a.account_id,
        a.description,
        SUM(tl.amount) AS account_balance
      FROM
        accounts a
        LEFT JOIN transaction_lines tl ON a.account_id = tl.account_id
        LEFT JOIN transactions t ON tl.transaction_id = t.transaction_id
      WHERE
        a.account_class = 'Revenue' AND
        t.transaction_date BETWEEN ? AND ?
      GROUP BY
        a.account_id, a.description
    `;
    connection.query(query, [fiscalYearStart, today], (error, results) => {
      if (error) {
        reject(error);
      } else {
        const revenueAccounts = results.map((result) => ({
          description: result.description,
          account_balance: parseFloat(result.account_balance.toFixed(2)),
        }));
        resolve(revenueAccounts);
      }
    });
  });
}

async function fetchExpenseAccounts() {
  return new Promise((resolve, reject) => {
    const fiscalYearStart = getFiscalYearStart().toISOString().split("T")[0];
    const today = getToday().toISOString().split("T")[0];
    const query = `
      SELECT
        a.account_id,
        a.description,
        SUM(-tl.amount) AS account_balance
      FROM
        accounts a
        LEFT JOIN transaction_lines tl ON a.account_id = tl.account_id
        LEFT JOIN transactions t ON tl.transaction_id = t.transaction_id
      WHERE
        a.account_class = 'Expense' AND
        t.transaction_date BETWEEN ? AND ?
      GROUP BY
        a.account_id, a.description
    `;
    connection.query(query, [fiscalYearStart, today], (error, results) => {
      if (error) {
        reject(error);
      } else {
        const expenseAccounts = results.map((result) => ({
          description: result.description,
          account_balance: parseFloat(result.account_balance.toFixed(2)),
        }));
        resolve(expenseAccounts);
      }
    });
  });
}

ipcMain.handle("fetch-revenue-accounts", async () => {
  try {
    const results = await fetchRevenueAccounts();
    return results;
  } catch (error) {
    console.error("Error fetching revenue accounts:", error);
    throw error;
  }
});

ipcMain.handle("fetch-expense-accounts", async () => {
  try {
    const results = await fetchExpenseAccounts();
    return results;
  } catch (error) {
    console.error("Error fetching expense accounts:", error);
    throw error;
  }
});

ipcMain.handle("focus-window", () => {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow) {
    mainWindow.blur();
    setTimeout(() => {
      mainWindow.focus();
    }, 1);
  }
});
