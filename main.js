// Modules to control application life and create native browser window
const {app, BrowserWindow, shell, ipcMain, dialog} = require('electron')

const fs = require('fs')
const os = require('os')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1280, height: 1440})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Printing to PDF

ipcMain.on('print-to-pdf', function (event) {
  const pdfPath = path.join(os.homedir(), 'Project Scope.pdf')
  const win = BrowserWindow.fromWebContents(event.sender)
  // Use default printing options
  win.webContents.printToPDF({printBackground: true}, function (error, data) {
    if (error) throw error
    fs.writeFile(pdfPath, data, function (error) {
      if (error) {
        throw error
      }
      shell.openExternal('file://' + pdfPath)
      event.sender.send('wrote-pdf', pdfPath)
    })
  })
})

// Opening Files
ipcMain.on('open-file-dialog', function (event, args) {
  let type = args;

  dialog.showOpenDialog({
    properties: [
      'openFile', 'multiSelections', (fileNames) => {
        event.sender.send('selected-directory', fileNames, args)
      }
    ]
  }, function (files) {
    if (files) {
      event.sender.send('selected-directory', files, type)
    }
  })
})