(function(exports) {
  'use strict';
  var b = require('./base-parser.js');

  function ArgumentParser() {
    this._supportedTypes = ['argv'];
  }

  var proto = ArgumentParser.prototype = new b.BaseParser();

  proto.constructor = ArgumentParser;

  proto._handle = function ap__handle(context, cmd) {
    return process.argv[cmd.index];
  };

  exports.ArgumentParser = ArgumentParser;
  exports._class = ArgumentParser;
})(exports || window);
