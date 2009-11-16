(function($) {
  $.extend(Coolerator, {
    Remote : {
      // $c.get(...) ???  - or -  $c8r.get(...) ???
      get : function get(options) {
        var self   = this;
        var data   = options.data || [];
        var source = $(options.source); // defaults to Document

        $.ajax({
          type     : 'GET',
          url      : options.url,
          data     : data,
          dataType : options.dataType || 'json',
          success  : function success(response, status) {
            self.responder.success.call(self, source, response, status, options);
          },
          complete : function complete(request, status) {
            self.responder.complete.call(self, source, request, status);
          }
        });
      },

      post : function post() {

      },

      put : function put() {

      },

      del : function del() {

      },

      // TODO: consider allowing for an optional scope argument.
      capture : function capture() {
        var self      = this;
        // TODO: consider binding even if the value is false, but
        //       only handling if the value is truthy.  this would
        //       allow the behavior to be changed on the fly.
        var attribute = '[data-remote]:not([data-remote=false])';
        var selectors = {
          form : 'form' + attribute,
          link : 'a'    + attribute
        };

        function filter() {
          function attach(form) {
            form.bind('submit', function(e) {
              return self.form.handle.call(e.target, $.extend(e, { listener : self }));
            });
          }

          Coolerator.Filter()
            .before(function(view) {
              $.each(view, function(name, partial) {
                var match = partial.match_for(selectors.form);

                if(match) {
                  attach(match);
                }
              });
            });

          $(function() {
            attach($(selectors.form));
          });
        }

        function subscribe() {
          Coolerator.Registrar.subscribe(self, function(registrar) {
            with(registrar) {
              on('click', selectors.link)
                .use(this.link.handle);

              on('click', selectors.form + ' input[type=submit]')
                .use(this.form.on_click);

              on('keypress', selectors.form + ' :input')
                .use(this.form.on_keypress);
            }
          });
        }

        filter()
        subscribe();
      },

      link : {
        exceptions : [],

        handle : function handle(e) {
          var self = e.listener;
          var link = $(this);

          // TODO: consider filters
          function trigger() {
            link.trigger('remote/request');
          }

          function send() {
            trigger();

            var type = link.attr('data-remote').toUpperCase();
                type = (type === 'TRUE'  ) ? 'GET'                  : type;
            var data = (type === 'DELETE') ? { _method : 'delete' } : {};
            var mime = link.attr('data-mimetype') || 'json';

            $.ajax({
              type     : type,
              url      : link.attr('href'),
              data     : data,
              dataType : mime,
              success  : function success(response, status) {
                self.responder.success.call(self, link, response, status);
              },
              complete : function complete(request, status) {
                self.responder.complete.call(self, link, request, status);
              }
            });

            return false;
          }

          $.each(self.link.exceptions, function(i, selector) {
            if(link.is(selector)) {
              send = function send() {};
            }
          });

          return send();
        },

        except : function except(selector) {
          this.exceptions.push(selector);
        }
      },

      form : {
        handle : function handle(e) {
          var self = e.listener;
          var form = $(this).closest('form');

          function send() {
            var type = (form.attr('data-remote') || form.attr('method')).toUpperCase();
                type = (type === 'TRUE') ? 'POST' : type;
            var data = form.serialize();
            var mime = form.attr('data-mimetype') || 'json';

            $.ajax({
              type     : type,
              url      : form.attr('action'),
              data     : data,
              dataType : mime,
              success  : function success(response, status) {
                // this     : jQuery XHR (?)
                // self     : Coolerator.Remote
                // form     : jQuery form instance
                // e        : submit event
                // response : response from server
                self.responder.success.call(self, form, response, status);
              },
              complete : function complete(request, status) {
                self.responder.complete.call(self, form, request, status);
              }
            });

            return false;
          }

          return send();
        },

        on_click : function on_click(e) {
          this.closest('form').submit();
          return false;
        },

        on_keypress : function on_keypress(e) {
          // TODO: if the field is a textarea, only submit with a modifier key.
          if(e.which === 13) {
            this.closest('form').submit();
            return false;
          }
        }
      },

      responder : {
        success : function success(source, response, status, options) {
          var filters = Coolerator.Filters.prepare(response.templates, response.trigger);

          filters.before();

          var e = $.extend($.Event(response.trigger), {
            presenter : response.presenter,
            templates : response.templates,
            options   : options,
            status    : status
          });

          source.trigger(e);
          options && options.success && options.success.apply(source, [response, status]);

          filters.after();
        },

        complete : function complete(source, request, status) {
          // TODO
        }
      }
    }
  });
})(jQuery);
