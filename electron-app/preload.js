const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  fetchClients: () => ipcRenderer.invoke("fetch-clients"),
  fetchClient: (clientId) => ipcRenderer.invoke("fetch-client", clientId),
  addClient: (client) => ipcRenderer.invoke("add-client", client),
  updateClient: (client) => ipcRenderer.invoke("update-client", client),
  removeClient: (clientId) => ipcRenderer.invoke("remove-client", clientId),
  addAccount: (account) => ipcRenderer.invoke("add-account", account),
  fetchAccounts: () => ipcRenderer.invoke("fetch-accounts"),
  fetchAccount: (accountId) => ipcRenderer.invoke("fetch-account", accountId),
  updateAccount: (account) => ipcRenderer.invoke("update-account", account),
  removeAccount: (accountId) => ipcRenderer.invoke("remove-account", accountId),
  addTransaction: (transaction) =>
    ipcRenderer.invoke("add-transaction", transaction),
  fetchTransactions: () => ipcRenderer.invoke("fetch-transactions"),
  fetchTransactionHistory: () =>
    ipcRenderer.invoke("fetch-transaction-history"),
  fetchTransactionDetails: () =>
    ipcRenderer.invoke("fetch-transaction-details"),
  openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
  generatePdfReport: (reportPath, content, reportType, startDate, endDate, endPeriodDate) =>
    ipcRenderer.invoke("generate-pdf-report", {
      reportPath,
      content,
      reportType,
      startDate,
      endDate,
      endPeriodDate,
    }),
  deleteTransaction: (transactionId) =>
    ipcRenderer.invoke("delete-transaction", transactionId),
  fetchTrialBalanceData: (startDate, endDate) => ipcRenderer.invoke("fetch-trial-balance-data", { startDate, endDate }),
  fetchRevenueAccounts: (startDate, endDate) => ipcRenderer.invoke("fetch-revenue-accounts", { startDate, endDate }),
  fetchExpenseAccounts: (startDate, endDate) => ipcRenderer.invoke("fetch-expense-accounts", { startDate, endDate }),
  fetchBalanceSheetData: (endPeriodDate) => ipcRenderer.invoke("fetch-balance-sheet-data", endPeriodDate),
  logError: (errorMessage) => ipcRenderer.invoke("log-error", errorMessage),
  focusWindow: () => ipcRenderer.invoke('focus-window'),
});
