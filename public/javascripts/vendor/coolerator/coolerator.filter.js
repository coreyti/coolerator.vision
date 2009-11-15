(function($) {
  var __count__    = 0;
  var __database__ = {};

  function no_op() {};

  function store(scope, filter) {
    if('object' === typeof scope) {
      filter = scope;
      scope  = '*';
    }

    __database__[scope] = __database__[scope] || [];
    __database__[scope].push(filter);
    __count__ += 1;
  };

  $.extend(Coolerator, {
    Filters : {
      count : function count() {
        return __count__;
      },

      get : function get(scope) {
        if(scope === undefined) {
          throw("InvalidArgumentException");
        }

        if(scope === '*') {
          return __database__['*'] || [];
        }

        return $.merge(__database__['*'] || [], __database__[scope] || []);
      },

      reset : function reset() {
        __database__ = {};
        __count__    = 0;
      }
    },

    Filter : function Filter(configuration) {
      var scope  = $.isArray(configuration.scope) ? configuration.scope : [configuration.scope || '*'];
      var filter = {
        label  : configuration.label,
        before : configuration.before || no_op,
        after  : configuration.after  || no_op
      };

      $.each(scope, function(i, selector) {
        store(selector, filter);
      });

      return filter;
    }
  });
})(jQuery);
