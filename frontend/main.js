import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import os from "os";

// Set up path constants for the application
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the main application window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1512,
    height: 982,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  // Load appropriate frontend based on environment
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

// Handle image saving from renderer process
ipcMain.handle("save-file", async (event, { data, fileName }) => {
  // Define storage location on user's desktop
  const destinationDir = path.join(os.homedir(), "Desktop", "MyAppImages");

  // Create storage directory if needed
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
  }

  const destinationPath = path.join(destinationDir, fileName);

  // Convert array data to Buffer for file writing
  const bufferData = Buffer.from(data);

  return new Promise((resolve, reject) => {
    fs.writeFile(destinationPath, bufferData, (err) => {
      if (err) {
        console.error("Error writing file:", err);
        reject(err);
      } else {
        resolve(destinationPath);
      }
    });
  });
});

// Retrieve saved images from storage directory
ipcMain.handle("get-user-images", async () => {
  const destinationDir = path.join(os.homedir(), "Desktop", "MyAppImages");

  // Return empty array if directory doesn't exist yet
  if (!fs.existsSync(destinationDir)) {
    return [];
  }

  // Get all files and convert to absolute paths
  const fileNames = fs.readdirSync(destinationDir);
  const filePaths = fileNames.map((file) => path.join(destinationDir, file));

  return filePaths;
});

// Remove images from storage
ipcMain.handle("delete-file", async (event, filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        reject(err);
      } else {
        resolve("File deleted successfully");
      }
    });
  });
});

// Application lifecycle handlers
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
