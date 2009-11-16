(function($) {
  $.extend(Coolerator, {
    Filters : {
      count : function count() {
        return __count__;
      },

      clear : function clear() {
        __database__ = {};
        __count__    = 0;
      },

      prepare : function prepare() {
        if(2 !== arguments.length) {
          throw("InvalidArgumentException");
        }

        var view  = arguments[0];
        var scope = arguments[1];

        if('object' !== typeof view || 'string' !== typeof scope) {
          throw("InvalidArgumentException");
        }

        $.each(view, function prepare_views(name, content) {
          view[name] = $(content);
        });

        var filters = retrieve(scope);
        function before() {
          $.each(filters, function(i, filter) {
            filter.before(view);
          });

          return { after : after };
        }

        function after() {
          $.each(filters, function(i, filter) {
            filter.after(view);
          });

          return { before : before };
        }

        return {
          filters : filters, // TODO: see about removing this... it's currently only need for the specs.
          before  : before,
          after   : after
        };
      }
    },

    Filter : function Filter() {
      var scopes = arguments.length ? arguments : ['*'];
      var filter = {
        before : no_op,
        after  : no_op
      }

      $.each(scopes, function(i, scope) {
        store(scope, filter);
      });

      function before(fn) {
        filter.before = fn;
        return { after : after };
      }

      function after(fn) {
        filter.after = fn;
        return { before : before };
      }

      return {
        before : before,
        after  : after
      };
    }
  });


  // private...................................................................

  var __count__    = 0;
  var __database__ = {};

  function no_op() {}

  function store(scope, filter) {
    if('object' === typeof scope) {
      filter = scope;
      scope  = '*';
    }

    __database__[scope] = __database__[scope] || [];
    __database__[scope].push(filter);
    __count__ += 1;
  }

  function retrieve(scope) {
    if('*' === scope) {
      return __database__['*'] || [];
    }

    return $.merge($.merge([], __database__['*'] || []), __database__[scope] || []);
  }
})(jQuery);
