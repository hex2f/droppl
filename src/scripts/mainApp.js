var {ipcRenderer, remote} = require('electron');
var main = remote.require('./src/index.js');
var anime = require('animejs');

var torrentApp = new Vue({
  el: '#torrents',
  data: {
    torrents: []
  }
})

var socket;

if(localStorage.getItem('domainHost') == null) {
  //notJoinedCard.style.display = "block"
} else {
  socket = require('socket.io-client')(localStorage.getItem('domainHost'));
  socket.on('connect', () => {
    socket.emit('getallmagnets');
  });
  socket.on('allmagnets', (data) => {
    torrentApp.torrents = data;
    console.log(data)
  })
}

function domainConnect() {
  if(localStorage.getItem('domainHost') == null) {
    main.opendomainwindow();
    var domcheck = setInterval(()=>{
      if(localStorage.getItem('domainHost') != null) {
        window.location.reload()
      }
    },500);
  }
}

function openMenu() {
  var menu_bar = document.getElementById('menu_bar');
  if(menu_bar.style.height < 75 || menu_bar.style.height == "0px") {
    anime({
      targets: '#menu_bar',
      height: 175,
      duration: 650,
      easing: 'easeInOutCubic'
    });
    anime({
      targets: '.menu_item',
      marginTop: [-50, 0],
      duration: 450,
      easing: 'easeInOutCubic'
    });
  } else {
    anime({
      targets: '#menu_bar',
      height: 0,
      duration: 650,
      easing: 'easeInOutCubic'
    });
    anime({
      targets: '.menu_item',
      marginTop: [0, -50],
      duration: 500,
      easing: 'easeInOutCubic'
    });
  }
}
