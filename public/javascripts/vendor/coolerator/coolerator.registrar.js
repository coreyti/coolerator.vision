(function($) {
  $.extend(Coolerator, {
    Registrar : {
      subscriptions : {},

      subscribe : function subscribe(listener, fn) {
        var self = this;

        function register(event_type, subscription) {
          if(subscription.selector.jquery) {
            subscription.selector.bind(event_type, function(e) {
              subscription.handler.call(e.target, $.extend(e, { listener : listener }));
            });
          }
          else {
            $(subscription.selector).live(event_type, function(e) {
              if(e.button && e.button !== 0) {
                return; // primary button click only
              }

              var target = $(e.target);
              var actual = subscription.selector === 'body' ? target : target.closest(subscription.selector);
              var result = subscription.handler.call(actual, $.extend(e, { listener : listener }));

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
        }

        function subscription() {
          var result = {
            on : function on(event_type, selector) {
              var selector = selector || 'body';

              function use(handler) {
                if($.isArray(selector)) {
                  $.each(selector, function each_selector() {
                    register(event_type, { selector: this, handler: handler });
                  });
                }
                else {
                  register(event_type, { selector: selector, handler: handler });
                }

                return this;
              }

              return {
                use : use
              };
            },

            use : function use(handler) {
              function on(event_type, selector) {
                var selector = selector || 'body';

                register(event_type, { selector: selector, handler: handler });
                return this;
              }

              return {
                on : on
              };
            }
          };

          return result;
        }

        if($.isReady) {
          fn.call(listener, subscription());
        }
        else {
          __ready__.push(function() {
            fn.call(listener, subscription());
          });
        }

        $(function() {
          while(__ready__.length) {
            var ready_fn = __ready__.shift();
            ready_fn();
          }

          if(__after__ && __after__()) {
            delete __after__;
          }
        });
      },

      // NOTE: *for now*, this will only fire after the *initial* ready.
      after_ready : function after_ready(fn) {
        __after__ = fn;
      }
    }
  });


  // private...................................................................

  var __after__;
  var __ready__ = [];
})(jQuery);
