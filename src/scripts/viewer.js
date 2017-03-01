/*Not needed yet.
var Vue = require('../vue.dev.js');*/
var $ = require('jQuery');

var {remote} = require('electron');
var main = remote.require('./src/index.js');

var ipc = require('electron').ipcRenderer;
var file;

console.log(file);

ipc.on('openFile' , function(event , magnet){
	console.log(magnet);
	var torrent = main.webtorrent.get(magnet);
	console.log(torrent);
	file = torrent.files[0];
	file.renderTo('#player')
});
