(function($) {
  var __database__ = {
    collections : {},
    instances   : {}
  };

  $.extend(Coolerator, {
    Views : {
      get : function get(classifier) {
        if( ! classifier || /\s+/.test(classifier)) {
          throw("InvalidArgumentException");
        }

        return __database__.collections[classifier];
      }
    },

    View : function View(classifier) {
      if( ! classifier || /\s+/.test(classifier)) {
        throw("InvalidArgumentException");
      }

      this.classifier = classifier;

      __database__.collections[this.classifier] = this;
      __database__.instances  [this.classifier] = {
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
      };
    }
  });

  $.extend(Coolerator.View.prototype, {
    subscribe : function subscribe(fn) {
      Coolerator.Registrar.subscribe(this, fn);
    },

    extend : function extend(extension) {
      var instance = extension.instance || {};
      var existing = __database__.instances[this.classifier];
      delete extension.instance;

      $.each(instance.methods || {}, function(name, fn) {
        var superb = existing.methods[name];

        if(superb) {
          function sup() {
            var args = $.makeArray(arguments);
            superb.apply(args.shift(), args);
          }

          $.extend(fn, { 'super' : sup });
        }
      });

      $.extend(true, __database__.instances[this.classifier], instance);
      $.extend(true, this, extension);
    },

    build : function build(attributes) {
      // TODO: provide a template cacheing mechanism.

      var instance = __database__.instances[this.classifier];
      var result   = Prez.build(instance, $.extend({ classifier : this.classifier }, (attributes || {})));

      if(result.subscribe) {
        Coolerator.Registrar.subscribe(result, result.subscribe);
      }

      return result;
    }
  });
})(jQuery);
