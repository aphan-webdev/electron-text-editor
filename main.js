// -------------------------------------------------------------
// 🧠 MAIN PROCESS — This is the "brain" of your Electron app.
// It controls windows, the file system, and system dialogs.
// -------------------------------------------------------------

// Import Electron modules that let us control the app and windows.
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

// Import Node.js built-in modules for file handling and file paths.
const fs = require('fs');
const path = require('path');


// -------------------------------------------------------------
// 🪟 1. CREATE THE APP WINDOW
// -------------------------------------------------------------
function createWindow() {
  // Think of BrowserWindow as a blank "browser tab" inside your desktop app.
  const win = new BrowserWindow({
    width: 800,      // window width
    height: 600,     // window height

    // webPreferences control what happens inside the window.
    webPreferences: {
      // preload.js runs *before* any website code.
      // It safely connects your front-end (renderer) to this main process.
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load your app’s HTML (the “front-end” part).
  // This file runs in the renderer process (like a webpage).
  win.loadFile('index.html');
}


// -------------------------------------------------------------
// 📂 2. HANDLE "OPEN FILE" REQUESTS FROM THE FRONT-END
// -------------------------------------------------------------
// When the renderer process calls ipcRenderer.invoke('dialog:openFile'),
// this handler runs in the main process.
ipcMain.handle('dialog:openFile', async () => {
  // Open a native file picker dialog.
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
  });

  // If the user picked a file, read it and send the contents back.
  if (!canceled && filePaths.length > 0) {
    // fs.readFileSync reads the file directly from disk.
    return fs.readFileSync(filePaths[0], 'utf-8');
  }

  // If user canceled, return nothing (undefined).
});


// -------------------------------------------------------------
// 💾 3. HANDLE "SAVE FILE" REQUESTS FROM THE FRONT-END
// -------------------------------------------------------------
// Similar to openFile, but for saving new content to disk.
ipcMain.handle('dialog:saveFile', async (event, content) => {
  // Open a native "Save As" dialog.
  const { canceled, filePath } = await dialog.showSaveDialog({});

  // If the user selected a location, write the content there.
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});


// -------------------------------------------------------------
// 🚀 4. START THE APP
// -------------------------------------------------------------
// Electron's app object emits 'ready' when initialization finishes.
// Then we create the first window.
app.whenReady().then(createWindow);
