// -------------------------------------------------------------
// 🧩 PRELOAD PROCESS — The "bridge" between the UI and main process.
// -------------------------------------------------------------
// It runs in an isolated world. That means the renderer (your HTML/JS)
// cannot directly use Node APIs (for security reasons).
// So preload.js safely exposes limited features to the renderer.

const { contextBridge, ipcRenderer } = require('electron');

// -------------------------------------------------------------
// 🛠️ Expose Safe APIs to the Renderer
// -------------------------------------------------------------
// contextBridge.exposeInMainWorld(name, apiObject)
//   → This makes selected methods available in window.<name>
//     inside the renderer (e.g., window.electronAPI.openFile()).
//
// ipcRenderer.invoke(channel, data)
//   → Sends a one-time request to the main process and
//     waits for a result (Promise-based).
contextBridge.exposeInMainWorld('electronAPI', {
  // Opens the native "Open File" dialog in the main process.
  openFile: () => ipcRenderer.invoke('dialog:openFile'),

  // Opens the native "Save File" dialog and passes the text content.
  saveFile: (content) => ipcRenderer.invoke('dialog:saveFile', content),
});
