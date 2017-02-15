var {ipcRenderer, remote} = require('electron');
var main = remote.require('./src/index.js');
var anime = require('animejs');

if(localStorage.getItem('domainHost') == null) {
  notJoinedCard.style.display = "block"
}

function domainConnect() {
  main.opendomainwindow();
  var domcheck = setInterval(()=>{
    if(localStorage.getItem('domainHost') != null) {
      window.location.reload()
    }
  },500);
}

function openMenu() {
  var menu_bar = document.getElementById('menu_bar');
  if(menu_bar.style.height < 75 || menu_bar.style.height == "0px") {
    anime({
      targets: '#menu_bar',
      height: 175,
      duration: 500,
      easing: 'easeInOutCubic'
    });
  } else {
    anime({
      targets: '#menu_bar',
      height: 0,
      duration: 500,
      easing: 'easeInOutCubic'
    });
  }
}
