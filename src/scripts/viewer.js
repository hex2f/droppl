/*Not needed yet.
var Vue = require('../vue.dev.js');*/
var $ = require('jquery');
var WebTorrent = require('webtorrent');
var client = new WebTorrent();

var {remote} = require('electron');
var main = remote.require('./src/index.js');

var ipc = require('electron').ipcRenderer;
var file;

console.log(file);

ipc.on('openFile' , function(event , magnet){
	console.log(magnet);
	client.add(magnet, {path: main.app.getPath('downloads') + "/droppl"}, (torrent)=>{
		console.log(torrent);
		for (var i = 0; i < torrent.files.length; i++) {
			var fileSplit = torrent.files[i].name.split(".");
			if(main.mediaFiles.includes(fileSplit[fileSplit.length-1].toLowerCase())) {
				$('#player').get(0).innerHTML = "";
				torrent.files[i].appendTo('#player');
			}
		}
	});
});
