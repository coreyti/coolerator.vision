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
            self.response.success.call(self, source, response, status, options);
          },
          complete : function complete(request, status) {
            self.response.complete.call(self, source, request, status);
          }
        });
      },

      post : function post() {

      },

      put : function put() {

      },

      delete : function delete() {

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
          Coolerator.Filter({
            before : function before(view) {
              $.each(view, function(name, partial) {
                var match = partial.match_for(selectors.form);

                if(match) {
                  match.bind('submit', function(e) {
                    return self.form.handle.call($.extend({}, this, self), e);
                  });
                }
              });
            }
          });
        }

        function subscribe() {
          Coolerator.Registrar.subscribe(self, function(registrar) {
            with(registrar) {
              on('click', selectors.link)
                .use(function(e) {
                  return self.link.handle.call($.extend({}, this, self), e);
                });

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
        handle : function handle(e) {
          var self      = this;
          var link      = this;

          function send() {
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
                self.response.success.call(self, link, response, status);
              },
              complete : function complete(request, status) {
                self.response.complete.call(self, link, request, status);
              }
            });

            return false;
          }

          return send();
        }
      },

      form : {
        handle : function handle(e) {
          var self = this;
          var form = self.closest('form');

          function send() {
            var type = (form.attr('data-remote') || form.attr('method')).toUpperCase();
                type = (type === 'TRUE') ? 'GET' : type;
            var data = form.serialize();
            var mime = form.attr('data-mimetype') || 'json';

            $.ajax({
              type     : type,
              url      : form.attr('action'),
              data     : data,
              dataType : mime,
              success  : function success(response, status) {
                self.response.success.call(self, form, response, status, e.data);
              },
              complete : function complete(request, status) {
                self.response.complete.call(self, form, request, status);
              }
            });

            return false;
          }

          return send();
        },

        on_click : function on_click(e) {
          this.closest('form').submit();
          return false;
        }
      },

      response : {
        success : function success(source, response, status, options) {
          this.filters.prepare(response);
          this.filters.before (response);

          var e = $.extend($.Event(response.fire), {
            data    : response.data,
            view    : response.view,
            options : options,
            status  : status
          });

          source.trigger(e);
          options && options.success && options.success.apply(source, [response, status]);

          this.filters.after(response);
        },

        complete : function complete(source, request, status) {
          console.info('TODO: response.complete', source, request, status);
        }
      },

      filters : {
        prepare : function prepare(response) {
          $.each(response.view, function prepare_views(name, content) {
            response.view[name] = $(content);
            response.filters    = Coolerator.Filters.get(response.fire);
          });
        },

        before : function before(response) {
          $.each(response.filters, function(i, filter) {
            filter.before(response.view);
          });
        },

        after : function after(response) {
          $.each(response.filters, function(i, filter) {
            filter.after(response.view);
          });
        }
      }
    }
  });
})(jQuery);
