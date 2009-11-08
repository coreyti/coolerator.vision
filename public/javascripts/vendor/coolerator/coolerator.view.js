(function($) {
  $.extend(Coolerator, {
    View : function View(key) {
      this.key = key;
    }
  });

  $.extend(Coolerator.View.prototype, {
    extend : function extend(extension) {
      // NOTE: if we have a matching method herein, rewrite the incoming
      //       to wrap it with 'super' ... with({ super : function() {} })...
      var self = this;

      $.each(extension.instance.methods, function(name, fn) {
        if(self.instance.methods[name]) {
          var super = {
            super : self.instance.methods[name]
          }

          var child = fn;
              child = child.toString().match(Coolerator.REGEX.FUNCTION_BODY)[1];
              child = new Function('super', 'with(super) { ' + child + ' }');

          extension.instance.methods[name] = function() {
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

    build : function build(attributes) {
      var result = Prez.build(this.instance, attributes || {});

      // TODO: consider making a call to view.subscribe
      function subscribe(callback) {
        callback = callback.toString().match(Coolerator.REGEX.FUNCTION_BODY)[1];
        callback = new Function('registrar', 'with(registrar) { ' + callback + ' } ;');
        Coolerator.Registrar.subscribe(result, callback);
      }

      subscribe(result.subscribe);
      return result;
    },

    instance : {
      methods : {
        initialize : function initialize() {
          console.info('super#initialize');
        },

        expand : function expand(selector) {
          return '#' + this.id + ' ' + selector;
        }
      }
    }
  });
})(jQuery);
