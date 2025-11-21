// -------------------------------------------------------------
// 🖥️ RENDERER PROCESS — The UI Layer (like a web app running in a tab)
// -------------------------------------------------------------
// This script runs inside index.html.
// It handles user interaction (typing, clicking toolbar buttons, etc.)
// and communicates with the main process through window.electronAPI
// (which was safely exposed by preload.js).


// -------------------------------------------------------------
// 🎛️ 1. GRAB REFERENCES TO UI ELEMENTS
// -------------------------------------------------------------
const newBtn = document.getElementById('newBtn');           // "New File" button
const openBtn = document.getElementById('openBtn');         // "Open File" button
const saveBtn = document.getElementById('saveBtn');         // "Save File" button
const editor = document.getElementById('editor');           // The editable text area
const toolbarButtons = document.querySelectorAll('.tool-btn'); // Bold / Italic / Align, etc.


// -------------------------------------------------------------
// 💬 2. HANDLE PLACEHOLDER VISIBILITY ("Start typing here...")
// -------------------------------------------------------------
// The editor starts empty, showing a placeholder message.
// As soon as the user types something, the placeholder disappears.
// When the editor is cleared, the placeholder reappears.

function checkEditorContent() {
  const isEmpty = editor.textContent.trim() === "";
  if (isEmpty) {
    // When empty, add a class that makes the placeholder visible
    editor.classList.add("empty");
  } else {
    // When text exists, hide the placeholder
    editor.classList.remove("empty");
  }
}

// Update placeholder visibility on input/focus/blur
editor.addEventListener("input", checkEditorContent);
editor.addEventListener("focus", checkEditorContent);
editor.addEventListener("blur", checkEditorContent);

// Run once on startup so placeholder appears if the editor starts empty
checkEditorContent();


// -------------------------------------------------------------
// 📝 3. TRACK UNSAVED CHANGES
// -------------------------------------------------------------
// We’ll use this to warn the user before overwriting their work.
let isEdited = false;

editor.addEventListener('input', () => {
  isEdited = true;
});


// -------------------------------------------------------------
// 🆕 4. CREATE A NEW FILE
// -------------------------------------------------------------
// If the user clicks “New” but hasn’t saved their current text,
// show a confirmation before clearing.
newBtn.addEventListener('click', async () => {
  if (isEdited && editor.innerHTML.trim() !== '') {
    const confirmNew = confirm("You have unsaved changes. Create a new file anyway?");
    if (!confirmNew) return; // Stop if user cancels
  }

  // Reset editor content and mark as unedited
  editor.innerHTML = '<p></p>';
  isEdited = false;
  checkEditorContent();
});


// -------------------------------------------------------------
// 📂 5. OPEN AN EXISTING FILE
// -------------------------------------------------------------
// This calls the main process (via preload) to show the OS file picker.
// The main process reads the file and sends the contents back.
openBtn.addEventListener('click', async () => {
  const text = await window.electronAPI.openFile(); // async call to main
  if (text !== undefined) {
    editor.innerHTML = text; // Replace editor content with file text
    isEdited = false;
    checkEditorContent();
  }
});


// -------------------------------------------------------------
// 💾 6. SAVE THE CURRENT FILE
// -------------------------------------------------------------
// Sends the editor content to the main process, which shows the OS
// "Save File" dialog and writes the text to disk.
saveBtn.addEventListener('click', async () => {
  await window.electronAPI.saveFile(editor.innerHTML);
  isEdited = false;
});


// -------------------------------------------------------------
// ✍️ 7. TOOLBAR BUTTONS (BOLD, ITALIC, ALIGNMENT, ETC.)
// -------------------------------------------------------------
// Each toolbar button uses a data-command attribute (like "bold" or "justifyCenter").
// document.execCommand(command) tells the browser to apply that formatting
// to the selected text inside the contenteditable area.
toolbarButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const command = btn.getAttribute('data-command');
    document.execCommand(command, false, null);
    isEdited = true;
  });
});

// -------------------------------------------------------------
// ⌨️ KEYBOARD SHORTCUTS
// -------------------------------------------------------------
// Supports:
//   ⌘N / Ctrl+N → New File
//   ⌘O / Ctrl+O → Open File
//   ⌘S / Ctrl+S → Save File
//   ⌘Q / Ctrl+Q → Quit App
// -------------------------------------------------------------

document.addEventListener("keydown", async (event) => {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const cmd = isMac ? event.metaKey : event.ctrlKey;

  if (!cmd) return;

  switch (event.key.toLowerCase()) {
    case "n": // NEW
      event.preventDefault();
      newBtn.click();
      break;

    case "o": // OPEN
      event.preventDefault();
      openBtn.click();
      break;

    case "s": // SAVE
      event.preventDefault();
      saveBtn.click();
      break;

    case "q": // QUIT
      event.preventDefault();
      // You might want to warn about unsaved changes here:
      if (isEdited) {
        const confirmQuit = confirm("You have unsaved changes. Quit anyway?");
        if (!confirmQuit) return;
      }
      window.electronAPI.quitApp();
      break;
  }
});
