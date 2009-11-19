//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.Registrar", function() {
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Registrar).to(equal, 'object');
    });

    describe(".subscribe", function() {
      context("pre-document 'ready'", function() {
        before(function() {
          $.isReady = false;
          mock($.fn, 'ready', function(fn) {
            $.readyList = $.readyList || [];
            $.readyList.push(fn);
          });
        });

        after(function() {
          $.isReady   = true;
          $.readyList = null;
          $.fn.ready  = $.fn.ready.original_function;
        });

        it("adds an array of callbacks to jQuery's readyList", function() {
          Coolerator.Registrar.subscribe(this, function() {});
          Coolerator.Registrar.subscribe(this, function() {});
          Coolerator.Registrar.subscribe(this, function() {});

          expect($.readyList).to(have_length, 3);
        });
      });

      context("post-document 'ready", function() {
        var called;

        before(function() {
          called = false;
        });

        it("fires the callback immediately", function() {
          Coolerator.Registrar.subscribe(this, function() {
            called = true;
          });
          expect(called).to(be_true);
        });
      });
    });
  });
}});
