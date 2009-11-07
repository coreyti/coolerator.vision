(function($) {
  $.extend(Coolerator, {
    Registrar : {
      subscriptions : {},

      subscribe : function subscribe(listener, fn) {
        var self = this;

        function register(event, subscription) {
          $(subscription.selector).live(event, function(e) {
            var target = $(e.target);
            var actual = subscription.selector === 'body' ? target : target.closest(subscription.selector);
            var result = subscription.handler.call(actual, e);

            if(false === result) {
              e.preventDefault();
              e.stopImmediatePropagation();
              // return false;
            }
            else if('object' === typeof result) {
              // TODO: allow the chain to be broken (and the bubble as well);
              result.before && result.before.call(actual, e);
              result.render && result.render.call(actual, e);
              result.after  && result.after .call(actual, e);
            }
          });
        }

        function subscription(callback) {
          var result = {
            on : function on(event, selector) {
              var selector = selector || 'body';

              function use(handler) {
                if($.isArray(selector)) {
                  $.each(selector, function each_selector() {
                    callback(event, { selector: this, handler: handler });
                  });
                }
                else {
                  callback(event, { selector: selector, handler: handler });
                }

                return this;
              }

              return {
                use : use
              };
            },

            use : function use(handler) {
              function on(event, selector) {
                var selector = selector || 'body';

                callback(event, { selector: selector, handler: handler });
                return this;
              }

              return {
                on : on
              };
            }
          };

          return result;
        }

        $(function ready() {
          fn.call(listener, subscription(register));
        });
      }
    }
  });
})(jQuery);
