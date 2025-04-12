import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Not recommended for production
    },
  });

  console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

// IPC handler for saving a file (receives file data and fileName)
ipcMain.handle("save-file", async (event, { data, fileName }) => {
  // Define the destination directory on the Desktop
  const destinationDir = path.join(os.homedir(), "Desktop", "MyAppImages");

  // Create the directory if it doesn't exist
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
  }

  const destinationPath = path.join(destinationDir, fileName);

  // Convert the received data (which is a typed array) into a Node Buffer
  const bufferData = Buffer.from(data);

  return new Promise((resolve, reject) => {
    fs.writeFile(destinationPath, bufferData, (err) => {
      if (err) {
        console.error("Error writing file:", err);
        reject(err);
      } else {
        resolve(destinationPath); // Return the new file path to the renderer
      }
    });
  });
});

// IPC handler to retrieve images from the Desktop folder
ipcMain.handle("get-user-images", async () => {
  // Define the folder on the Desktop where images are saved
  const destinationDir = path.join(os.homedir(), "Desktop", "MyAppImages");

  // If the folder doesn't exist, return an empty array.
  if (!fs.existsSync(destinationDir)) {
    return [];
  }

  // Read files in that directory
  const fileNames = fs.readdirSync(destinationDir);

  // Map each file name to its absolute path.
  const filePaths = fileNames.map((file) => path.join(destinationDir, file));

  return filePaths;
});

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
