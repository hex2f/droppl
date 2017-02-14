const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win_upload
let win_main
let win_dom

require('electron-reload')(__dirname);

function createWindow () {
  // Create the browser window.
  win_upload = new BrowserWindow({width: 600, height: 800,icon: __dirname + '/img/dropplLogo.png'})
  //win_upload.setMenu(null);
  // and load the index.html of the app.
  win_upload.loadURL(url.format({
    pathname: path.join(__dirname, '/views/main.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  win_upload.on('closed', () => {
    win_upload = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win_upload === null) {
    createWindow()
  }
})


exports.opendomainwindow = () => {
  // Create the browser window.
  win_dom = new BrowserWindow({width: 400, height: 400})
  win_dom.setMenu(null);

  // and load the index.html of the app.
  win_dom.loadURL(url.format({
    pathname: path.join(__dirname, '/views/domconnect.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  win_dom.on('closed', () => {
    win_dom = null
  })
}

exports.closedomainwindow = () => {
  win_dom.close();
}

exports.openuploadwindow = () => {
  // Create the browser window.
  win_upload = new BrowserWindow({width: 400, height: 400})
  win_upload.setMenu(null);

  // and load the index.html of the app.
  win_upload.loadURL(url.format({
    pathname: path.join(__dirname, '/views/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  win_upload.on('closed', () => {
    win_upload = null
  })
}

exports.closeuploadwindow = () => {
  win_upload.close();
}
