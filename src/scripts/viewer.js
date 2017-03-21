var $ = require('jquery');

var {remote} = require('electron');
var main = remote.require('./src/index.js');

var file;

console.log(file);

//Change to false in production
if(process.env.NODE_ENV == 'development') {
	$(document).keypress(function (e) {
		switch(e.keyCode) {
			case 18:
				window.location.reload();
				break;
			case 9:
				main.openViewerTools();
		}
	});
}
$(function() {
	$('#playpause').get(0).onclick = () => {
		if($('video').get(0).paused) {
			$('video').get(0).play();
			$('#playpause').get(0).innerHTML = '<i class="fa fa-fw fa-pause" aria-hidden="true"></i>';
		} else {
			$('video').get(0).pause();
			$('#playpause').get(0).innerHTML = '<i class="fa fa-fw fa-play" aria-hidden="true"></i>';
		}
	};

	var thread;
	$( "body" ).mousemove(function( e ) {
		$('#controls').get(0).style.opacity = "1";
		clearTimeout(thread);
		thread = setTimeout(()=>{
			if(e.pageY < window.innerHeight - 40) {
				$('#controls').get(0).style.opacity = "0";
			}
		}, 500);
	});
	$('#fullscreen').get(0).onclick = () => { main.fullscreenPlayer(); };
	var vid = $('video').get(0);
	var vs = $('#vidseek').get(0);
	var vl = $('#volume').get(0);
	vid.controls = false;
	vid.src = "http://localhost:21342/"+main.currentViewerFile;
	vid.ontimeupdate = () => { vs.value = parseInt(vid.currentTime*10); };
	vs.oninput = () => { vid.currentTime = vs.value/10; };
	vl.oninput = () => {
		vid.volume = vl.value/100;
		if(vl.value > 50) {
			$('#volumeIcon').get(0).innerHTML = '<i class="fa fa-fw fa-volume-up" aria-hidden="true"></i>';
		}
		if(vl.value < 50) {
			$('#volumeIcon').get(0).innerHTML = '<i class="fa fa-fw fa-volume-down" aria-hidden="true"></i>';
		}
		if(vl.value == 0) {
			$('#volumeIcon').get(0).innerHTML = '<i class="fa fa-fw fa-volume-off" aria-hidden="true"></i>';
		}
	};
	vid.oncanplay = ()=>{
		vs.setAttribute("max", parseInt(vid.duration*10));
		main.rezisePlayer(vid.videoHeight, vid.videoWidth);
		console.log(vid.videoWidth, vid.videoHeight);
		vid.play();
	};
});

/*ipc.on('openFile' , function(event , magnet){
	console.log(magnet);
	client.add(magnet, {path: main.app.getPath('downloads') + "/droppl"}, (torrent)=>{
		console.log(torrent);
		for (var i = 0; i < torrent.files.length; i++) {
			var fileSplit = torrent.files[i].name.split(".");
			if(main.mediaFiles.includes(fileSplit[fileSplit.length-1].toLowerCase())) {

			}
		}
	});
});*/
