var {ipcRenderer, remote} = require('electron');
var main = remote.require('./src/index.js');

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
