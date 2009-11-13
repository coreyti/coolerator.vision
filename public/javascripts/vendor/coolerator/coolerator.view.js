(function($) {
  $.extend(Coolerator, {
    Views : {},

    View : function View(classifier) {
      this.classifier = classifier;

      $.extend(this, {
        instance : {
          content : function content(builder, attributes) {
            var html_attributes = attributes.classifier ? { 'class' : attributes.classifier } : {};

            with(builder) {
              div(html_attributes);
            }
          },

          methods : {
            initialize : function initialize() {
              if(this.content) {
                this.html(this.content);
              }
            }
          }
        }
      });

      Coolerator.Views[classifier] = this;
    }
  });

  $.extend(Coolerator.View.prototype, {
    cache : {},

    extend : function extend(extension) {
      var self = this;

      $.each(extension.instance.methods, function(name, fn) {
        if(self.instance.methods[name]) {
          var superb = self.instance.methods[name];
          function super() {
            var args = $.makeArray(arguments);
            superb.apply(args.shift(), args);
          }
          $.extend(fn, { super : super });
        }
      });

      $.extend(true, this.instance, extension.instance);
      if(extension.collection) {
        $.extend(true, this, extension.collection.methods, extension.collection.configuration);
      }
    },

    subscribe : function subscribe(callback) {
      var self = this;
      callback = callback.toString().match(Coolerator.REGEX.FUNCTION_BODY)[1];
      callback = new Function('registrar', 'with(registrar) { ' + callback + ' } ;');

      Coolerator.Registrar.subscribe(self, callback);
    },

    build : function build(attributes) {
      if(this.cache.instance) {
        return this.cache.instance;
      }

      var result = Prez.build(this.instance, $.extend({ collection: this, classifier : this.classifier }, (attributes || {})));

      // TODO: consider making a call to view.subscribe
      function subscribe(callback) {
        if(callback) {
          callback = callback.toString().match(Coolerator.REGEX.FUNCTION_BODY)[1];
          callback = new Function('registrar', 'with(registrar) { ' + callback + ' } ;');
          Coolerator.Registrar.subscribe(result, callback);
        }
      }

      subscribe(result.subscribe);

      if(this.singleton) {
        this.cache.instance = result;
      }

      return result;
    }
  });
})(jQuery);
