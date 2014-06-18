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
      if (!result.length) {
        // if no length, we just return it.
        return result;
      } else {
        var filtered;
        if (selectors.filter) {
          // we may meet more than one result which may make tree traversal
          // broken.
          filtered = result.first()[selectors.filter](selectors.subSelector);
        } else {
          // apply the function call to result
          filtered = result[selectors.filter](selectors.subSelector);
        }
        return selectors.reverse ? $(filtered.get().reverse()) : filtered;
      } 
    }
  };
})(exports || window);
