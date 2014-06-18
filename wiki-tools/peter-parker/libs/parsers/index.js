(function(exports) {
  'use strict';
  var argv = require('./argument.js');
  var attr = require('./attribute.js');
  var link = require('./link.js');

  var parsers = [new attr._class(),
                     new link._class(),
                     new argv._class()];
  exports.getParser = function getParser(type) {
    for (var i = 0; i < parsers.length; i++) {
      if (parsers[i].canHandle(type)) {
        return parsers[i];
      }
    }
    // return undefined when we don't find proper parser.
  };
})(exports || window);
