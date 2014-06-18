(function(exports) {
  'use strict';
  var b = require('./base-parser.js');
  var utils = require('../utils.js');

  function AttributeParser() {
    this._supportedTypes = ['attr', 'attrs'];
  }

  var proto = AttributeParser.prototype = new b.BaseParser();

  proto.constructor = AttributeParser;

  proto.queryAttrs = function ap_queryAttrs(context, selectors, attr) {
    var queryResult = utils.query(this._$, context, selectors);
    this._debug('query result: ' + queryResult.length);
    if (queryResult.length) {
      var ret = [];
      queryResult.each((function(idx, item) {
        if (item[attr]) {
          ret[ret.length] = item[attr];
        } else if (item.hasAttribute(attr)) {
          ret[ret.length] = item.getAttribute(attr).nodeValue;
        }
      }).bind(this));
      return ret;
    } else {
      return null;
    }
  };

  proto.queryAttr = function ap_queryAttr(context, selectors, attr, index) {
    return this._getIndex('queryAttrs', [context, selectors, attr], index);
  };

  proto._handle = function ap__handle(context, cmd) {
    switch (cmd.type) {
      case 'attr':
        return this.queryAttr(context, cmd.selector, cmd.attr,
                              cmd.position || 0);
      case 'attrs':
        return this.queryAttrs(context, cmd.selector, cmd.attr);
    }
    return;
  };

  exports.AttributeParser = AttributeParser;
  exports._class = AttributeParser;
})(exports || window);
