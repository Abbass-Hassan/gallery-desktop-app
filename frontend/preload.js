// preload.js
const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload loaded: exposing electronAPI");

contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (data, fileName) => {
    return ipcRenderer.invoke("save-file", { data, fileName });
  },
  getUserImages: () => {
    return ipcRenderer.invoke("get-user-images");
  },
});
