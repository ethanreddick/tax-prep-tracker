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
  fetchTransactionHistory: () =>
    ipcRenderer.invoke("fetch-transaction-history"),
  fetchTransactions: () => ipcRenderer.invoke("fetch-transactions"),
  openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
  generatePdfReport: (reportPath, content) =>
    ipcRenderer.invoke("generate-pdf-report", { reportPath, content }), // Add this line
});
