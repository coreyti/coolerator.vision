(function($) {
  $.extend(Coolerator, {
    Filters : {
      global : [],
      scoped : {},

      get : function get(scope) {
        return $.merge($.makeArray(this.global), $.makeArray(this.scoped[scope]));
      }
    },

    Filter : function Filter() {
      var scope  = ['*'];
      var filter = this;

      if(arguments.length) {
        var first = arguments[0];

        if('object' === typeof first) {
          scope  = $.isArray(first.scope) ? first.scope : [first.scope || '*'];

          filter = {
            label  : first.label,
            before : (first.before || function no_op() {}),
            after  : (first.after  || function no_op() {})
          };
        }
        else {
          scope = arguments;
        }
      }

      $.each(scope, function(i, selector) {
        if(selector === '*') {
          Coolerator.Filters.global.push(filter);
        }
        else {
          Coolerator.Filters.scoped[selector || '*'] = $.merge(Coolerator.Filters.scoped[selector || '*'] || [], [filter]);
        }
      });
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
