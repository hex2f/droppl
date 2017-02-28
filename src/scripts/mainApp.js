var {ipcRenderer, remote, clipboard} = require('electron');
var main = remote.require('./src/index.js');
var anime = require('animejs');
var $ = require('jQuery');
var c2c = require('colorcolor');
var dragDrop = require('drag-drop');
const {shell} = require('electron')

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

var torrentApp = new Vue({
  el: '#torrents',
  data: {
    torrents: [
    ],
    doneTorrents: [
    ]
  },
  methods: {
    openFile: function (path) {
      shell.openItem(path);
    },
    toggleDropdown: function (torrent) {
      var dti = torrentApp.doneTorrents.indexOf(torrent);
      var nti = torrentApp.torrents.indexOf(torrent);
      console.log(dti)
      if(dti != -1) {
        console.log(torrentApp.doneTorrents[dti].dropdown)
        if(torrentApp.doneTorrents[dti].dropdown == "0px")
          Vue.set(torrentApp.doneTorrents[dti], "dropdown", "116px");
        else if(torrentApp.doneTorrents[dti].dropdown == "116px")
          Vue.set(torrentApp.doneTorrents[dti], "dropdown", "0px");
      }
    }
  }
})

if(localStorage.getItem('doneTorrents') != null) {
  torrentApp.doneTorrents = JSON.parse(localStorage.getItem('doneTorrents'));
}

function msToTime(duration) {
    var seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds
}

// FIXME: why are you requiring ipc renderer each time even after you already stored a reference in "var ipc"?
// FIXME: never assigned soundPlayer...
var ipc = require('electron').ipcRenderer;
require('electron').ipcRenderer.on('playaudio' , function(event , data){ soundPlayer.src = data.source; soundPlayer.volume = data.volume; soundPlayer.play(); console.log(data) });
require('electron').ipcRenderer.on('torrentAdded' , function(event , data){
  console.log('torrentAdded', data);
  notification("Processing Torrent", false);
  soundPlayer.src = "../audio/notification.wav"; soundPlayer.volume = 1; soundPlayer.play();
  isDownloading = true;
  checkTorrents()
});
require('electron').ipcRenderer.on('torrentError' , function(event , data){
  console.log('torrentError', data);
  notification("Error Processing Torrent", false);
  soundPlayer.src = "../audio/notification.wav"; soundPlayer.volume = 1; soundPlayer.play();
  setTimeout(()=>{notification("Processing Torrent", true)},500);
});

require('electron').ipcRenderer.on('torrentDone' , function(event , data){
  checkTorrents();
  console.log('torrentDone', data);
  notification("Torrent Downloaded", true);
  soundPlayer.src = "../audio/success.wav"; soundPlayer.volume = 1; soundPlayer.play();
  torrentApp.doneTorrents.push({
    filename: data.name,
    filesize: Math.round(data.length/1024/1024*100)/100,
    path: data.path.replace("/", "\\")+"\\"+data.name,
    progress: Math.floor(data.progress*100)+"%",
    color: c2c('#'+data.infoHash.substring(0,6), 'hsl').split("(")[1].split(",")[0],
    canStream: true,
    paused: data.paused,
    dropdown: "0px"
  })
  localStorage.setItem("doneTorrents", JSON.stringify(torrentApp.doneTorrents));
  setTimeout(()=>{notification("Torrent Downloaded", false)},2500);
});

function checkTorrents() {
  var torrents = main.webtorrent.torrents;
  var temparr = [];
  for (var i = 0; i < torrents.length; i++) {
    var data = torrents[i]
    temparr.push({
      filename: data.name,
      received: Math.round(data.received/1024/1024*100)/100,
      filesize: Math.round(data.length/1024/1024*100)/100,
      progress: Math.floor(data.progress*100)+"%",
      eta: msToTime(data.timeRemaining),
      speed: Math.round(data.downloadSpeed/1024/1024*100)/100,
      peers: data._peersLength,
      color: c2c('#'+data.infoHash.substring(0,6), 'hsl').split("(")[1].split(",")[0],
      canStream: false,
      paused: data.paused,
      dropdown: "0px"
    })
  }
  torrentApp.torrents = temparr;
}

var isDownloading = false;

setInterval(()=>{
  if(isDownloading) {
    checkTorrents();
  }
},250);
setInterval(()=>{
  if(main.webtorrent.progress != 0) {
    isDownloading = true;
  } else {
    isDownloading = false;
    checkTorrents();
  }
},1000);
/*
magnet:?xt=urn:btih:58e92626e811b9338745c98116dcedf7e7093ee8&dn=Sylenth1.2.1&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969
*/


$("body").on("paste", function(event) {
    event.preventDefault();
    event.stopPropagation();
    if(clipboard.readText().length > 2) {
      main.addTorrent(clipboard.readText());
      console.log(clipboard.readText())
      notification("Processing Torrent", true);
    }
});

dragDrop('#drop', function (files) {
  main.addTorrent(files[0].path);
  notification("Processing Torrent", true);
});

main.stopInitTimer()
