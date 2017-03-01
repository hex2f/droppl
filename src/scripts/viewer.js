/*Not needed yet.
var Vue = require('../vue.dev.js');
var $ = require('jQuery');*/

var {remote} = require('electron');
var main = remote.require('./src/index.js');

var ipc = require('electron').ipcRenderer;

ipc.on('openFile' , function(event , magnet){
	console.log(magnet);

	main.webtorrent.get(magnet, (torrent) => {
		var file = torrent.files[0];
		console.log(file);
		file.appendTo('body');
	});
});
