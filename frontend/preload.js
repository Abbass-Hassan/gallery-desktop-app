const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload loaded: exposing electronAPI");

contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (data, fileName) =>
    ipcRenderer.invoke("save-file", { data, fileName }),
  getUserImages: () => ipcRenderer.invoke("get-user-images"),
  deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
});
