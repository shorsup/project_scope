// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer, shell} = require('electron')
const fs = require('fs')

// PDF Download
const printPDFBtn = document.getElementById('js-pdf')

printPDFBtn.addEventListener('click', function (event) {
  ipcRenderer.send('print-to-pdf')
})

ipcRenderer.on('wrote-pdf', function (event, path) {
  const message = `Wrote PDF to: ${path}`
  document.getElementById('output').innerHTML = message
})

// External Links
const exLinksBtn = document.getElementById('repoLink')

exLinksBtn.addEventListener('click', function (event) {
  shell.openExternal('https://github.com/NetoECommerce/design-resources/blob/master/Project%20Scopes/Tweak-Prices.md')
})

// Opening Files
const openScopeTrigger = document.getElementById('js-open-scope')
const openNotesTrigger = document.getElementById('js-open-notes')

openScopeTrigger.addEventListener('click', function (event) {
  ipcRenderer.send('open-file-dialog', 'editor')
})

openNotesTrigger.addEventListener('click', function (event) {
  ipcRenderer.send('open-file-dialog', 'notesEditor')
})

ipcRenderer.on('selected-directory', function (event, path, args) {
  fs.readFile(path.toString(), (err, data) => {
    if(err){
      alert("An error ocurred reading the file :" + err.message);
      return;
    }
    ace.edit(args).setValue(data.toString());
  });
})