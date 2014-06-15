(function(exports) {
  'use strict';
  var jsdom = require('jsdom');
  var evts = require('events');

  function PeterParker() {
  }

  var proto = PeterParker.prototype;
  proto.__proto__ = evts.EventEmitter.prototype;

  proto._DEBUG = false;

  proto._debug = function pp__debug(msg) {
    if (!this._DEBUG) {
      return;
    }
    console.log('[' + (new Date()) + '] ' + msg);
  };

  proto.init = function pp_init(url) {
    var self = this;
    jsdom.env({
      url: url,
      scripts: ["http://code.jquery.com/jquery.js"], // load jquery to help us.
      done: function jsdom_init_done(errors, window) {
        if (errors instanceof Error) {
          self.emit('error', errors);
        } else {
          self._window = window;
          self._$ = window.$;
          self.emit('ready');
        }
      }
    });
  };

  proto.queryLinks = function pp_queryLinks(context, selectors) {
    var ret = [];
    this._query(context, selectors).each(function(idx, item) {
      if (item.href) {
        ret[ret.length] = item.href;
      }
    });
    return ret;
  };

  proto.queryLink = function pp_queryLink(context, selectors, index) {
    return this._getIndex('queryLinks', [context, selectors], index);
  };

  proto.queryAttrs = function pp_queryAttrs(context, selectors, attr) {
    var ret = [];
    var queryResult = this._query(context, selectors);
    this._debug('query result: ' + queryResult.length);
    queryResult.each((function(idx, item) {
      if (item[attr]) {
        ret[ret.length] = item[attr];
      } else if (item.hasAttribute(attr)) {
        ret[ret.length] = item.getAttribute(attr).nodeValue;
      }
    }).bind(this));
    return ret;
  };

  proto.queryAttr = function pp_queryAttr(context, selectors, attr, index) {
    return this._getIndex('queryAttrs', [context, selectors, attr], index);
  };

  proto._getIndex = function pp__getIndex(query, args, index) {
    var got = this[query].apply(this, args);
    if (index < got.length && index > -1) {
      return got[index];
    } else {
      return null;
    }
  };

  proto._query = function pp__query(context, selectors) {
    return this._$(selectors, context);
  };

  proto._parseSingle = function pp__parseSingle(context, config) {
    var ret = {};
    for(var key in config) {
      this._debug('build field: ' + key);
      ret[key] = this.execute(context, config[key]);
      this._debug('field value: ' + ret[key]);
    }
    return ret;
  };

  proto.parse = function pp_parse(context, config) {
    if (!context) {
      return this._parseSingle(context, config);
    }
    this._debug('parse, context length: ' + context.length);
    var ret = [];
    context.each((function(index, item) {
      ret[ret.length] = this._parseSingle(item, config);
    }).bind(this));
    return ret;
  };

  proto.execute = function pp_execute(context, cmd) {
    switch(cmd.type) {
      case 'link':
        this._debug('query link: ' + context + ' ' + cmd.selector);
        return this.queryLink(context, cmd.selector, cmd.position || 0);
      case 'attr':
        this._debug('query attr: ' + context + ' ' + cmd.selector +
                    ', attr: ' + cmd.attr);
        return this.queryAttr(context, cmd.selector, cmd.attr, cmd.position || 0);
      case 'json-parser':
        this._debug('nested parser: ' + context + ' ' + cmd.selector);
        return this.parse(this._query(context, cmd.selector), cmd.config);
    }
  }

  exports.PeterParker = PeterParker;
}) (exports || window);



