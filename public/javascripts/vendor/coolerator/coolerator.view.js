(function($) {
  $.extend(Coolerator, {
    // hmm, may not need to store Views.
    Views : {},

    View : function View(key) {
      this.key = key;
      var view = this;

      $(function() {
        view = $.fn.extend(Prez.build(view, {}), view);
      });

      Coolerator.Views[key] = view;
      return view;
    }
  });

  $.extend(Coolerator.View.prototype, {
    scooby : 1,
    extend : function extend(extension) {
      // NOTE: if we have a matching method herein, rewrite the incoming
      //       to wrap it with 'super' ... with({ super : function() {} })...
      var self = this;

      $.each(extension.methods, function(name, fn) {
        if(self.methods[name]) {
          var super = {
            super : self.methods[name]
          }

          var child = fn;
              child = child.toString().match(Coolerator.REGEX.FUNCTION_BODY)[1];
              child = new Function('super', 'with(super) { ' + child + ' }');

          extension.methods[name] = function() {
            var self = this;
            child.call(self, super);
          }
        }
      });

      $.extend(true, this, extension);
    },

    subscribe : function subscribe(callback) {
      var self = this;
      callback = callback.toString().match(Coolerator.REGEX.FUNCTION_BODY)[1];
      callback = new Function('registrar', 'with(registrar) { ' + callback + ' } ;');

      Coolerator.Registrar.subscribe(self, callback);
    },

    methods : {
      initialize : function initialize() {
        console.info('super#initialize');
      },

      foo : function foo() {
        console.info('super#foo');
      },

      build : function build(attributes) {
        var result = Prez.build(this, attributes);

        function subscribe(callback) {
          callback = callback.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
          callback = new Function('registrar', 'with(registrar) { ' + callback + ' } ;');
          Coolerator.Registrar.subscribe(result, callback);
        }

        subscribe(result.subscribe);
        return result;
      },

      expand : function expand(selector) {
        return '#' + this.id + ' ' + selector;
      }
    }
  });
})(jQuery);

// toString : function toString() {
//   return "<Coolerator.View key='" + this.key + "'>"
// }