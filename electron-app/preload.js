const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  fetchClients: () => ipcRenderer.invoke("fetch-clients"),
  fetchClient: (clientId) => ipcRenderer.invoke("fetch-client", clientId),
  addClient: (client) => ipcRenderer.invoke("add-client", client),
  updateClient: (client) => ipcRenderer.invoke("update-client", client),
  removeClient: (clientId) => ipcRenderer.invoke("remove-client", clientId),
});
