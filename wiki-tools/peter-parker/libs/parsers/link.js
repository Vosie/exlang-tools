(function(exports) {
  'use strict';

  var a = require('./attribute.js');
  function LinkParser() {
    this._supportedTypes = ['link', 'links'];
  }

  var proto = LinkParser.prototype = new a.AttributeParser();

  proto.constructor = LinkParser;

  proto._handle = function lp__handle(context, cmd) {
    switch (cmd.type) {
      case 'link':
        return this.queryAttr(context, cmd.selector, 'href',
                              cmd.position || 0);
      case 'links':
        return this.queryAttrs(context, cmd.selector, 'href');
    }
    return;
  };

  exports.LinkParser = LinkParser;
  exports._class = LinkParser;
})(exports || window);
