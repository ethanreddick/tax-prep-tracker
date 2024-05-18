const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  addClient: (client) => ipcRenderer.invoke("add-client", client),
  fetchClients: () => ipcRenderer.invoke("fetch-clients"),
  fetchClient: (clientId) => ipcRenderer.invoke("fetch-client", clientId),
  updateClient: (client) => ipcRenderer.invoke("update-client", client),
  removeClient: (clientId) => ipcRenderer.invoke("remove-client", clientId),
  addAccount: (account) => ipcRenderer.invoke("add-account", account),
  fetchAccounts: () => ipcRenderer.invoke("fetch-accounts"),
  fetchAccount: (accountId) => ipcRenderer.invoke("fetch-account", accountId),
  updateAccount: (account) => ipcRenderer.invoke("update-account", account),
  removeAccount: (accountId) => ipcRenderer.invoke("remove-account", accountId),
});
