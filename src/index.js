console.time('init')

const {app, BrowserWindow, dialog, Menu, Tray, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
var WebTorrent = require('webtorrent')
var client = new WebTorrent()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win_upload
let win_main
let win_dom
let tray

require('electron-reload')(__dirname);

function createWindow () {
  win_main = new BrowserWindow({width: 1200, height: 800, icon: __dirname + '/img/dropplLogo.png', backgroundColor: '#363742'})
  win_main.loadURL(path.join(__dirname, '/views/main.html'))

  win_main.on('beforeunload', (event) => {
    //event.preventDefault();
    win_main.hide();
    event.returnValue = false;
  })
  win_main.on('close', (event) => {
    event.preventDefault();
  })
  setTimeout(()=>{
    win_main.webContents.send('playaudio' , {source:__dirname + '/audio/success.wav', volume: 1});
  },2000)
}

app.on('ready', ()=>{
  tray = new Tray(__dirname + '/img/dropplLogo.ico')
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Open'},
    {label: 'Quit'},
  ])
  tray.setToolTip('Droppl')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    win_main.show();
  })

  createWindow()
})

app.on('window-all-closed', (event) => {
  event.preventDefault();
  /*if (process.platform !== 'darwin') {
    app.quit()
  }*/
})

app.on('activate', () => {
  if (win_upload === null) {
    createWindow()
  }
})

exports.addTorrent = (magnet) => {
  if(client.get(magnet) == null) {
    client.add(magnet, {path: app.getPath('downloads')}, (torrent)=>{
      win_main.webContents.send('torrentAdded' , torrent);
      torrent.on('done', function () {
        win_main.webContents.send('torrentDone' , torrent);
      })
    });
  } else {
    win_main.webContents.send('torrentAdded' , client.get(magnet));
  }
}

exports.webtorrent = client;

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

exports.stopInitTimer = () => {
  console.timeEnd('init')
}

exports.closedomainwindow = () => {
  win_dom.close();
}

exports.openuploadwindow = () => {
  // Create the browser window.
  win_upload = new BrowserWindow({width: 800, height: 600})
  //win_upload.setMenu(null);

  // and load the index.html of the app.
  win_upload.loadURL(url.format({
    pathname: path.join(__dirname, '/views/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  /*win_upload.on('closed', () => {
    win_upload = null
  })*/

  win_upload.on('close', (e) => {
    e.preventDefault();
    dialog.showMessageBox({
      type: "question",
      message: "The server is caching your torrent. If you close this window before it is done, no one will be able to download your file :(   Are you sure you want to cancel the upload?",
      buttons: ["Wait until done", "Cancel Upload"]
    }, (resp) => {
      if(resp == 1) {
        win_upload.hide();
        win_upload = null
      } else {

      }
    });
  })
}

exports.closeuploadwindow = () => {
  win_upload.close();
}
