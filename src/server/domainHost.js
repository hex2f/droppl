if(process.argv[2] == null) {
  console.log('Usage: node domainHost.js <*PORT> <PASSWORD>');
} else {
  var JsonDB = require('node-json-db');
  var db = new JsonDB("torrents", true, false);

  function gentoken(len) {
    var pos = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var tok = '';
    for (var i = 0; i < len; i++) {
      tok+=pos.charAt(Math.floor(Math.random()*pos.length));
    }
    return tok;
  }

  var password;
  var token = gentoken(128);

  if(process.argv[3] != null) {
    password = process.argv[3];
  }

  var io = require('socket.io')();
  io.on('connection', function(socket){
    socket.on('register', function (data) {
      console.log('Register from '+socket.id);
      if(password != '') {
        if(data == password) {
          socket.emit('regreturn', token);
          console.log('Granted access for '+socket.id);
        } else {
          socket.emit('regfail');
          console.log('Denied access for '+socket.id);
        }
      } else {
        socket.emit('regreturn', token);
        console.log('Granted access for '+socket.id);
      }
    });

    socket.on('uploadmagnet', function (data) {
      if(password != '') {
        if(data[1] == password) {
          socket.emit
        } else {
          socket.disconnect();
        }
      }
    });
  });
  io.listen(process.argv[2]);
  console.log(`Established IO server on port ${process.argv[2]}`);
}
