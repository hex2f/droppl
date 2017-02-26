var {ipcRenderer, remote, clipboard} = require('electron');
var main = remote.require('./src/index.js');
var anime = require('animejs');
var $ = require('jQuery');

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
/*
{
  filename: 'AReallYCoolFile.txt',
  filesize: '246 mb',
  progress: '78%',
  speed: '2.5 mb/s',
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
ipc.on('playaudio' , function(event , data){ soundPlayer.src = data.source; soundPlayer.volume = data.volume; soundPlayer.play(); console.log(data) });
ipc.on('torrentAdded' , function(event , data){
  torrentApp.torrents.push({
    filename: data.name,
    filesize: (data.length/1024/1024).toString().split(".")[0] + '.' + (data.length/1024/1024).toString().split(".")[1].substring(0,2),
    progress: 0,
    speed: (data.length/1024/1024).toString().split(".")[0] + '.' + (data.length/1024/1024).toString().split(".")[1].substring(0,2)
    peers: data._peersLength,
    color: '#'+data.infoHash.substring(0,6)
  })
  console.log(data)
});

main.addTorrent('magnet:?xt=urn:btih:a649447e3b15ce2d5e6cfc3a53a00274393a3933&dn=Lennar+Digital+Sylenth1+v.2.21+x64+x32&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969');

$("body").on("paste", function(event) {
    event.preventDefault();
    event.stopPropagation();
    if(clipboard.readText().length > 2) {
      console.log(clipboard.readText());
    }
});

$("#drop").on("drop", function(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log(event);
    console.log(event.dataTransfer);
});

main.stopInitTimer()
