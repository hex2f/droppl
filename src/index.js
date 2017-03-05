console.time('init');

var isWin = /^win/.test(process.platform);

const {app, BrowserWindow, dialog, Menu, Tray} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
var WebTorrent = require('webtorrent');
var client = new WebTorrent();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win_upload;
let win_main;
let win_dom;
let win_viewer;
let tray;

// this package is only needed during development
if(process.env.NODE_ENV == 'development') {
  require('electron-reload')(__dirname);
}

function createWindow () {
  win_main = new BrowserWindow({width: 560, height: 750, icon: __dirname + '/img/dropplLogo.ico', backgroundColor: '#363742'});

  win_main.loadURL(url.format({
    pathname: path.join(__dirname, '/views/main.html'),
    protocol: 'file:',
    slashes: true
  }));

  if(isWin) {
    win_main.on('beforeunload', (event) => {
      win_main.hide();
      event.returnValue = false;
    });
  }
  win_main.on('close', (event) => {
    if(isWin) {
      event.preventDefault();
    } else {
      win_main = null;
    }
  });
}

app.on('ready', ()=>{
  if(isWin) {
    tray = new Tray(__dirname + '/img/dropplLogo.ico');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open',
        click: function() {
          win_main.show();
        }
      },
      {
        label: 'Toggle DevTools',
        click: function() {
          win_main.toggleDevTools();
          this.checked = !this.checked;
        }
      },
      {
        label: 'Quit',
        click: function() {
          win_main.removeAllListeners('close');
          win_main.close();
          app.quit();
        }
      },
    ]);
    tray.setToolTip('Droppl');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      win_main.show();
    });
  }

  createWindow();
});


app.on('activate', () => {
  if (win_main === null) {
    createWindow();
  }
});

exports.app = app;

exports.addTorrent = (magnet) => {
  if(client.get(magnet) == null) {
    console.log('New torrent');
    client.add(magnet, {path: app.getPath('downloads') + "/droppl"}, (torrent)=>{
      win_main.webContents.send('torrentAdded' , torrent);
      torrent.on('error', function () {
        win_main.webContents.send('torrentError' , torrent);
      });
      torrent.on('done', function () {
        win_main.webContents.send('torrentDone' , torrent);
        torrent.destroy();
      });
    });
  } else {
    win_main.webContents.send('torrentAdded' , client.get(magnet));
  }
};

exports.webtorrent = client;

exports.opendomainwindow = () => {
  win_dom = new BrowserWindow({width: 400, height: 400});
  win_dom.setMenu(null);

  win_dom.loadURL(url.format({
    pathname: path.join(__dirname, '/views/domconnect.html'),
    protocol: 'file:',
    slashes: true
  }));

  win_dom.on('closed', () => {
    win_dom = null;
  });
};

exports.stopInitTimer = () => {
  console.timeEnd('init');
};

exports.closedomainwindow = () => {
  win_dom.close();
};

exports.mediaFiles = [
	'mp4',
	'webm',
	'ogg',
	'flac',
	'mse',
	'aac',
	'mp3',
	'wav'
];

exports.win_viewer = win_viewer;

exports.openviewer = (magnet) => {
  if(client.get(magnet) != null) client.get(magnet).destroy();
  win_viewer = new BrowserWindow({width: 1280, height: 720, icon: __dirname + '/img/dropplLogo.ico', backgroundColor: '#000'});
  win_viewer.setMenu(null);
  win_viewer.loadURL(url.format({
    pathname: path.join(__dirname, '/views/viewer.html'),
    protocol: 'file:',
    slashes: true
  }));

  win_viewer.webContents.on('dom-ready', () => {
    win_viewer.webContents.send('openFile' , magnet);
  });


  win_viewer.on('close', () => {
    win_viewer = null;
  });
  exports.win_viewer = win_viewer;
};

exports.rezisePlayer = (h, w) => win_viewer.setSize(w, h);
exports.fullscreenPlayer = () => win_viewer.setFullScreen(!win_viewer.isFullScreen());

exports.openuploadwindow = () => {
  win_upload = new BrowserWindow({width: 800, height: 600});

  win_upload.loadURL(url.format({
    pathname: path.join(__dirname, '/views/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win_upload.on('close', (e) => {
    e.preventDefault();
    dialog.showMessageBox({
      type: "question",
      message: "The server is caching your torrent. If you close this window before it is done, no one will be able to download your file :(   Are you sure you want to cancel the upload?",
      buttons: ["Wait until done", "Cancel Upload"]
    }, (resp) => {
      if(resp == 1) {
        win_upload.hide();
        win_upload = null;
      }
    });
  });
};

exports.closeuploadwindow = () => {
  win_upload.close();
};
