(function(exports) {
  exports.clone = function clone(source, target) {
    if (null == source || "object" != typeof source) {
      return source;
    }
    for (var attr in source) {
      if (source.hasOwnProperty(attr)) {
        target[attr] = source[attr];
      }
    }
  };

  exports.query = function query($, context, selectors) {
    if ((typeof selectors) === 'string') {
      return $(selectors, context);
    } else if (selectors.base && selectors.filter) {
      // make the query
      var result = $(selectors.base, context);
      // apply the function call to result
      return result[selectors.filter](selectors.subSelector);
    }
  };
})(exports || window);
