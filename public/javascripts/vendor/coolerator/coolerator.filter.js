(function($) {
  var __count__    = 0;
  var __database__ = {};

  $.extend(Coolerator, {
    Filters : {
      count : function count() {
        return __count__;
      },

      add : function add(scope, filter) {
        if('object' === typeof scope) {
          filter = scope;
          scope  = '*';
        }

        __database__[scope] = __database__[scope] || [];
        __database__[scope].push(filter);
        __count__ += 1;
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

    Filter : function Filter() {
  //     var scope  = ['*'];
  //     var filter = this;
  //
  //     if(arguments.length) {
  //       var first = arguments[0];
  //
  //       if('object' === typeof first) {
  //         scope  = $.isArray(first.scope) ? first.scope : [first.scope || '*'];
  //
  //         filter = {
  //           label  : first.label,
  //           before : (first.before || function no_op() {}),
  //           after  : (first.after  || function no_op() {})
  //         };
  //       }
  //       else {
  //         scope = arguments;
  //       }
  //     }
  //
  //     $.each(scope, function(i, selector) {
  //       if(selector === '*') {
  //         Coolerator.Filters.global.push(filter);
  //       }
  //       else {
  //         Coolerator.Filters.scoped[selector || '*'] = $.merge(Coolerator.Filters.scoped[selector || '*'] || [], [filter]);
  //       }
  //     });
    }
  });

  // $.extend(Coolerator.Filter.prototype, {
  //   before : function before(fn) {
  //     if('function' == typeof fn) {
  //       this.before = fn;
  //     }
  //   },
  //
  //   after : function after(fn) {
  //     if('function' == typeof fn) {
  //       this.after = fn;
  //     }
  //   }
  // });
})(jQuery);
