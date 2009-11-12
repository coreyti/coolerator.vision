(function($) {
  $.extend(Coolerator, {
    Filters : {
      global : [],
      scoped : {},

      get : function get(scope) {
        return $.merge(this.global, this.scoped[scope] || []);
      }
    },

    Filter : function Filter() {
      var config = $.merge(arguments, ['*'])[0];

      if('object' === typeof(config)) {
        var scope  = config.scope || '*';
        var filter = {
          before : (config.before || function no_op() {}),
          after  : (config.after  || function no_op() {})
        };
      }
      else {
        var scope  = config;
        var filter = this;
      }

      if(scope === '*') {
        Coolerator.Filters.global.push(filter);
      }
      else {
        Coolerator.Filters.scoped[scope] = $.merge(Coolerator.Filters.scoped[scope] || [], [filter]);
      }
    }
  });

  $.extend(Coolerator.Filter.prototype, {
    before : function before(fn) {
      if('function' == typeof fn) {
        this.before = fn;
      }
    },

    after : function after(fn) {
      if('function' == typeof fn) {
        this.after = fn;
      }
    }
  });
})(jQuery);
