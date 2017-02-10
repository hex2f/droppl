var dev = true;

if(dev) {
  require('./src/index.js');
} else {
  require('./build/index.js');
}
