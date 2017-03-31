console.time('init');

console.log(process.platform);

var isWin = /^win/.test(process.platform);
var isLin = /^linux/.test(process.platform);

const {app, BrowserWindow, dialog, Menu, Tray} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./localStorage');

var WebTorrent = require('webtorrent');
var client = new WebTorrent();
var port = 21342;

var dlpath = app.getPath('downloads') + "/droppl";

if(localStorage.getItem('dlpath') != null)
  dlpath = localStorage.getItem('dlpath');

exports.getDownloadPath = dlpath;
exports.setDownloadPath = (p) => {
  dlpath = p;
  console.log('New Download Path: '+p);
  localStorage.setItem('dlpath', p);
  exports.getDownloadPath = dlpath;
};

console.log('Download Path: '+dlpath);

var shouldQuit = app.makeSingleInstance(function() {
  if (win_main) {
    win_main.show();
    win_main.focus();
  }
  return true;
});

if (shouldQuit) {
  app.quit();
  return;
}

let win_upload;
let win_settings;
let win_main;
let win_dom;
let win_viewer;
let tray;

// this package is only needed during development
if(process.env.NODE_ENV == 'development') {
  require('electron-reload')(__dirname);
}

if(fs.exists(dlpath) == false) {
  console.log(dlpath + 'does not exist. Creating.');
  fs.mkdirSync(dlpath);
}

function createWindow () {
  win_main = new BrowserWindow({width: 560, height: 750, icon: __dirname + '/img/dropplLogo.ico', backgroundColor: '#363742'});

  win_main.loadURL(url.format({
    pathname: path.join(__dirname, '/views/main.html'),
    protocol: 'file:',
    slashes: true
  }));

  if(isWin || isLin) {
    win_main.on('beforeunload', (event) => {
      win_main.hide();
      event.returnValue = false;
    });
  }
  win_main.on('close', (event) => {
    if(isWin || isLin) {
      event.preventDefault();
    } else {
      win_main = null;
    }
  });

  exports.win_main = win_main;
}

app.on('ready', ()=>{
  var icon = __dirname + '/img/dropplLogo.ico';
  if(isLin) {
    icon = __dirname + '/img/dropplLogo.png'
  }
  if(isWin || isLin) {
    tray = new Tray(icon);
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
  if(magnet != "" && client.get(magnet) == null) {
    if(fs.exists(dlpath) == false) {
      console.log(dlpath + 'does not exist. Creating.');
      fs.mkdirSync(dlpath);
    }

    console.log('New torrent');
    client.add(magnet, {path: dlpath}, (torrent)=>{
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

exports.stopInitTimer = () => console.timeEnd('init');
exports.closedomainwindow = () => win_dom.close();

var mediaFiles = [
	'mp4',
	'webm',
	'ogg',
	'flac',
	'mse',
	'aac',
	'mp3',
	'wav'
];

exports.mediaFiles = mediaFiles;

exports.win_viewer = win_viewer;
exports.openViewerTools = () => win_viewer.toggleDevTools();

exports.openviewer = (magnet) => {
  if(win_viewer == null) {
    var torrent = client.get(magnet);
    var fileIndex = 0;
    torrent.files.forEach((file)=>{
      var fileSplit = file.name.split(".");
			if(mediaFiles.includes(fileSplit[fileSplit.length-1].toLowerCase())) {
        fileIndex = torrent.files.indexOf(file);
			}
    });
    exports.currentViewerFile = fileIndex;

    var server = torrent.createServer();
    server.listen(port);
    win_viewer = new BrowserWindow({width: 1280, height: 720, icon: __dirname + '/img/dropplLogo.ico', backgroundColor: '#000'});
    win_viewer.setMenu(null);
    win_viewer.loadURL(url.format({
      pathname: path.join(__dirname, '/views/viewer.html'),
      protocol: 'file:',
      slashes: true
    }));

    win_viewer.webContents.on('dom-ready', () => {

    });


    win_viewer.on('close', () => {
      server.close();
      win_viewer = null;
    });
  } else {
    win_viewer.focus();
  }
  exports.win_viewer = win_viewer;
};

exports.rezisePlayer = (h, w) => win_viewer.setSize(w, h);
exports.fullscreenPlayer = () => win_viewer.setFullScreen(!win_viewer.isFullScreen());

exports.openSettings = () => {
  win_settings = new BrowserWindow({width: 360, height: 360, icon: __dirname + '/img/dropplLogo.ico', backgroundColor: '#363742', resizable: false});
  win_settings.loadURL(url.format({
    pathname: path.join(__dirname, '/views/settings.html'),
    protocol: 'file:',
    slashes: true
  }));

  win_settings.setMenu(null);

  win_settings.on('close', () => {
    win_settings = null;
  });
  exports.settingsWindow = win_settings;
};

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

exports.requestUpdatePermission = () => {
  return new Promise(function(resolve, reject){
    dialog.showMessageBox({
      type: "question",
      message: "There is a new version available. Would you like to update?",
      buttons: ["Yes, Download in background", "No, Remind me later"]
    }, (resp) => {
      if(resp == 0) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  });
};

exports.closeuploadwindow = () => {
  win_upload.close();
};

require('./otau.js');
