var {ipcRenderer, remote, clipboard} = require('electron');
var main = remote.require('./src/index.js');
var anime = require('animejs');
var $ = require('jQuery');
var c2c = require('colorcolor');

document.addEventListener('drop', function(e) {
  e.preventDefault();
  e.stopPropagation();
});
document.addEventListener('dragover', function(e) {
  e.preventDefault();
  e.stopPropagation();
});

remote.getCurrentWindow().on('close', function(event) {
  event.preventDefault();
  remote.getCurrentWindow().hide();
});

function notification(message, state) {
  var notif = $('#notification').get(0);
  if(state == true) {
    notif.style.top = "20px";
    notif.style.opacity = 1;
    notif.innerHTML = `<p>${message}</p>`
  } else {
    notif.style.top = "-100px";
    notif.style.opacity = 0;
  }
}
/*
{
  filename: 'AReallYCoolFile.txt',
  filesize: '246',
  progress: '78%',
  speed: '2.5',
  peers: 21,
  color: Math.floor(Math.random()*360)
},
*/
var torrentApp = new Vue({
  el: '#torrents',
  data: {
    torrents: [
    ]
  }
})

var ipc = require('electron').ipcRenderer;
require('electron').ipcRenderer.on('playaudio' , function(event , data){ soundPlayer.src = data.source; soundPlayer.volume = data.volume; soundPlayer.play(); console.log(data) });
require('electron').ipcRenderer.on('torrentAdded' , function(event , data){
  notification("Processing Torrent", false);
  isDownloading = true;
  checkTorrents()
});
require('electron').ipcRenderer.on('torrentError' , function(event , data){
  notification("Error Processing Torrent", false);
  setTimeout(()=>{notification("Processing Torrent", false)},500);
});

function checkTorrents() {
  var torrents = main.webtorrent.torrents;
  var temparr = [];
  for (var i = 0; i < torrents.length; i++) {
    var data = torrents[i]
    temparr.push({
      filename: data.name,
      filesize: Math.round(data.info.length/1024/1024*100)/100,
      progress: Math.floor(data.progress*100)+"%",
      speed: Math.round(data.downloadSpeed/1024/1024*100)/100,
      peers: data._peersLength,
      color: c2c('#'+data.infoHash.substring(0,6), 'hsl').split("(")[1].split(",")[0]
    })
  }
  torrentApp.torrents = temparr;
}

var isDownloading = false;

setInterval(()=>{
  if(isDownloading)
    checkTorrents();
},250);
setInterval(()=>{
  if(main.webtorrent.progress == 10) {
    isDownloading = false;
    checkTorrents();
  } else {
    isDownloading = true;
  }
},1000);

//main.addTorrent('magnet:?xt=urn:btih:58e92626e811b9338745c98116dcedf7e7093ee8&dn=Sylenth1.2.1&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969');
setTimeout(()=>{
  main.addTorrent('magnet:?xt=urn:btih:a649447e3b15ce2d5e6cfc3a53a00274393a3933&dn=Lennar+Digital+Sylenth1+v.2.21+x64+x32&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969');
}, 3500)


$("body").on("paste", function(event) {
    event.preventDefault();
    event.stopPropagation();
    if(clipboard.readText().length > 2) {
      main.addTorrent(clipboard.readText());
      console.log(clipboard.readText())
      notification("Processing Torrent", true);
    }
});

$("#drop").on("drop", function(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log(event);
    console.log(event.dataTransfer);
});

main.stopInitTimer()
