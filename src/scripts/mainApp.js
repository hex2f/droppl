var {remote, clipboard} = require('electron');
var main = remote.require('./src/index.js');
var $ = require('jquery');
var Vue = require('../vue.dev.js');
var c2c = require('colorcolor');
var dragDrop = require('drag-drop');
const {shell} = require('electron');

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
    notif.innerHTML = `<p>${message}</p>`;
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
    removeTorrent: function (type, torrent) {
      if(type == 0) {
        main.webtorrent.remove(torrent, ()=>{
          notification("Torrent Removed", true);
          setTimeout(()=>{notification("Torrent Removed", false);});
        });
      } else {
        torrentApp.doneTorrents.splice(torrentApp.torrents.indexOf(torrent), 1);
        localStorage.setItem("doneTorrents", JSON.stringify(torrentApp.doneTorrents));
      }
    },
    openstream: function (magnet) {
      console.log(magnet);
      main.openviewer(magnet);
    },
    toggleDropdown: function (torrent) {
      var dti = torrentApp.doneTorrents.indexOf(torrent);
      var nti = torrentApp.torrents.indexOf(torrent);
      if(dti != -1) {
        if(torrentApp.doneTorrents[dti].dropdown == "0px")
          Vue.set(torrentApp.doneTorrents[dti], "dropdown", "116px");
        else if(torrentApp.doneTorrents[dti].dropdown == "116px")
          Vue.set(torrentApp.doneTorrents[dti], "dropdown", "0px");
      } else if(nti != -1) {
        if(torrentApp.torrents[nti].dropdown == "0px")
          Vue.set(torrentApp.torrents[nti], "dropdown", "116px");
        else if(torrentApp.torrents[nti].dropdown == "116px")
          Vue.set(torrentApp.torrents[nti], "dropdown", "0px");
      }
    }
  }
});

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

    return hours + ":" + minutes + ":" + seconds;
}

var ipc = require('electron').ipcRenderer;
var soundPlayer = $('#soundPlayer').get(0);

ipc.on('playaudio' , function(event , data){ soundPlayer.src = data.source; soundPlayer.volume = data.volume; soundPlayer.play(); });
ipc.on('torrentAdded' , function(event , data){
  console.log('torrentAdded', data);
  notification("Processing Torrent", false);
  soundPlayer.src = "../audio/notification.wav"; soundPlayer.volume = 1; soundPlayer.play();
  isDownloading = true;
  checkTorrents();
});
ipc.on('torrentError' , function(event , data){
  console.log('torrentError', data);
  notification("Error Processing Torrent", false);
  soundPlayer.src = "../audio/notification.wav"; soundPlayer.volume = 1; soundPlayer.play();
  setTimeout(()=>{notification("Processing Torrent", true);},500);
});

ipc.on('torrentDone' , function(event , data){
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
    dropdown: "0px",
    magnet: data.magnetURI
  });
  localStorage.setItem("doneTorrents", JSON.stringify(torrentApp.doneTorrents));
  setTimeout(()=>{notification("Torrent Downloaded", false);},2500);
});

function checkTorrents() {
  var torrents = main.webtorrent.torrents;
  var temparr = [];
  for (var i = 0; i < torrents.length; i++) {
    var data = torrents[i];
    var dropdown = "0px";
    var canStream = false;
    if(torrentApp.torrents[i] != null) {dropdown = torrentApp.torrents[i].dropdown;}
    for (var j = 0; j < data.files.length; j++) {
			var fileSplit = data.files[j].name.split(".");
			if(main.mediaFiles.includes(fileSplit[fileSplit.length-1].toLowerCase())) {
				canStream = true;
			}
		}
    temparr.push({
      filename: data.name,
      received: Math.round(data.received/1024/1024*100)/100,
      filesize: Math.round(data.length/1024/1024*100)/100,
      progress: Math.floor(data.progress*100)+"%",
      eta: msToTime(data.timeRemaining),
      speed: Math.round(data.downloadSpeed/1024/1024*100)/100,
      peers: data._peersLength,
      color: c2c('#'+data.infoHash.substring(0,6), 'hsl').split("(")[1].split(",")[0],
      canStream: canStream,
      paused: data.paused,
      dropdown: dropdown,
      magnet: data.magnetURI
    });
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

$("body").on("paste", function(event) {
    event.preventDefault();
    event.stopPropagation();
    if(clipboard.readText().length > 2) {
      main.addTorrent(clipboard.readText());
      notification("Processing Torrent", true);
    }
});

dragDrop('#drop', function (files) {
  main.addTorrent(files[0].path);
  notification("Processing Torrent", true);
});

main.stopInitTimer();
