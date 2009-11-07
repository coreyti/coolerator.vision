(function($) {
  $(function() {
    var self     = Coolerator.Remote;
    var selector = 'form[data-remote]:not([data-remote=false])';

    Coolerator.Filter({
      before : function before(view) {
        $.each(view, function(name, partial) {
          var match = partial.match_for(selector);

          if(match) {
            match.bind('submit', function(e) {
              return self.form.handle.call($.extend({}, $(e.target), self), e);
            });
          }
        });
      }
    });

    Coolerator.Registrar.subscribe(self, function(registrar) {
      with(registrar) {
        on('click', selector + ' input[type=submit]').use(this.form.on_click);
      }
    });
  });

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

      link : {

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
