if (process.argv.length < 4) {
  console.log('please give us a url and config file which is a json file');
  process.exit(-1);
  return;
}

var config = require(process.argv[3]);

if (!config) {
  console.log('please give us a valid config file');
  process.exit(-2);
  return;
}

var fs = require('fs');
var pp = require('./libs/peter-parker.js');

var peter = new pp.PeterParker();
var parsed = null;

peter.on('ready', function() {
  parsed = peter.parse('', config);
});

peter.on('error', function(e) {
  console.error('error: ', e);
  process.exit(-3);
});

peter.on('done', function() {
  if (process.argv[4]) {
    fs.writeFile(process.argv[4], JSON.stringify(parsed));
  } else {
    console.log(JSON.stringify(parsed));
  }
  peter.free();
});

peter.init(process.argv[2]);
