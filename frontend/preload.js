// Bridge between Electron main process and renderer
const { contextBridge, ipcRenderer } = require("electron");

// Expose secure API functions to frontend
contextBridge.exposeInMainWorld("electronAPI", {
  // Save image data to filesystem
  saveFile: (data, fileName) =>
    ipcRenderer.invoke("save-file", { data, fileName }),

  // Retrieve stored images
  getUserImages: () => ipcRenderer.invoke("get-user-images"),

  // Remove image from filesystem
  deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
});
