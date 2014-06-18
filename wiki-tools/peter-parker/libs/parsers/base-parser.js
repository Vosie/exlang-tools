(function(exports) {
  'use strict';

  function BaseParser() {
    this._DEBUG = false;
  }

  var proto = BaseParser.prototype;

  proto._debug = function pp__debug(msg) {
    if (!this._DEBUG) {
      return;
    }
    this._info(msg);
  };

  proto._info = function pp__info(msg) {
    console.log(this.getClassName() + ' - [' + (new Date()) + '] ' + msg);
  };

  proto.getClassName = function() {
     var funcNameRegex = /function (.{1,})\(/;
     var results = (funcNameRegex).exec((this).constructor.toString());
     return (results && results.length > 1) ? results[1] : "";
  };

  proto.canHandle = function bc_canHandle(type) {
    return this._supportedTypes.indexOf(type) > -1;
  };

  proto.handle = function($, context, cmd) {
    this._$ = $;
    return this._handle(context, cmd);
  };

  proto._getIndex = function pp__getIndex(query, args, index) {
    var got = this[query].apply(this, args);
    if (got && index < got.length && index > -1) {
      return got[index];
    } else {
      return null;
    }
  };


  exports.BaseParser = BaseParser;
})(exports || window);
