//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  after(function() {
    Coolerator.Filters.clear();
  });

  describe("an example", function() {
    before(function() {
      Coolerator.Filter('scope/one', 'scope/two')
        .before(function(view) {
          $.each(view, function(key, partial) {
            partial.css('border', 'yellow');
          });
        })
        .after(function(view) {
          $.each(view, function(key, partial) {
            partial.css('border', 'green');
          });
        });
    });

    it("behaves", function() {
      var templates = { show : '<div>content</div>' };
      var filters   = Coolerator.Filters.prepare(templates, 'scope/one');
      expect(templates.show.jquery).to_not(be_undefined);

      filters.before();
      expect(templates.show.css('border')).to(match, 'yellow');

      filters.after();
      expect(templates.show.css('border')).to(match, 'green');
    });
  });

  describe("Coolerator.Filters", function() {
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Filters).to(equal, 'object');
    });

    describe("methods", function() {
      describe(".count", function() {
        before(function() {
          Coolerator.Filter({});
          Coolerator.Filter({ scope : 'scope 1' });
          Coolerator.Filter({ scope : 'scope 1' });
          Coolerator.Filter({ scope : 'scope 2' });
        });

        it("returns the count of filters, regardless of scope", function() {
          expect(Coolerator.Filters.count()).to(equal, 4);
        });
      });

      describe(".clear", function() {
        before(function() {
          Coolerator.Filter({ label : 'clear' });
        });

        it("sets 'count' to 0", function() {
          expect(Coolerator.Filters.count()).to(equal, 1);

          Coolerator.Filters.clear();
          expect(Coolerator.Filters.count()).to(equal, 0);
        });
      });

      describe(".prepare", function() {
        var view;

        before(function() {
          view = { show : '<div>content</div>' };
        });

        describe("argument handling", function() {
          var filters;

          before(function() {
            Coolerator.Filter()
              .before(function() {})
              .after (function() {});

            Coolerator.Filter('scoped')
              .before(function() {})
              .after (function() {});
          });

          context("with appropriate arguments (with global)", function() {
            before(function() {
              filters = Coolerator.Filters.prepare(view, '*');
            });

            it("converts the view 'partials' to jQuery objects", function() {
              expect(view.show.jquery).to_not(be_undefined);
            });

            describe("the returned filters", function() {
              it("are limited to global", function() {
                expect(filters.filters).to(have_length, 1);
              });

              it("defines #before", function() {
                expect(filters.before).to_not(throw_exception);
              });

              it("defines #after", function() {
                expect(filters.after).to_not(throw_exception);
              });
            });
          });

          context("with appropriate arguments (with scoped)", function() {
            it("does not increase the length upon multiple calls", function() {
              Coolerator.Filters.prepare(view, 'scoped');
              Coolerator.Filters.prepare(view, 'scoped');
              filters = Coolerator.Filters.prepare(view, 'scoped');

              expect(filters.filters).to(have_length, 2);
            });
          });

          context("with fewer than two", function() {
            before(function() {
              fn = function fn() {
                Coolerator.Filters.prepare({});
              };
            });

            it("throws an exception", function() {
              expect(fn).to(throw_exception);
            });
          });

          context("with more than two", function() {
            before(function() {
              fn = function fn() {
                Coolerator.Filters.prepare({}, 'scope', 'something else');
              };
            });

            it("throws an exception", function() {
              expect(fn).to(throw_exception);
            });
          });

          context("with an undefined 'view'", function() {
            before(function() {
              fn = function fn() {
                Coolerator.Filters.prepare(undefined, 'scope');
              };
            });

            it("throws an exception", function() {
              expect(fn).to(throw_exception);
            });
          });

          context("with an undefined 'scope'", function() {
            before(function() {
              fn = function fn() {
                Coolerator.Filters.prepare({ show : '<div>content</div>' }, undefined);
              };
            });

            it("throws an exception", function() {
              expect(fn).to(throw_exception);
            });
          });
        });
      });
    });
  });

  describe("Coolerator.Filter", function() {
    var filter;

    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Filter).to(equal, 'function');
    });

    describe("the returned object", function() {
      before(function() {
        filter = Coolerator.Filter();
      });

      it("is defined", function() {
        expect(filter).to_not(be_undefined);
      });

      it("defines #before", function() {
        expect(filter.before).to_not(be_undefined);
      });

      it("defines #after", function() {
        expect(filter.after).to_not(be_undefined);
      });
    });

    describe("argument handling", function() {
      var called;

      before(function() {
        called = {
          before : false,
          after  : false
        }
      });

      context("called with no scope", function() {
        before(function() {
          Coolerator.Filter()
            .before(function(view) {
              called.before = true;
            })
            .after(function(view) {
              called.after = true;
            });
        });

        it("adds the filter to the 'global' scope", function() {
          Coolerator.Filters.prepare({}, '*')
            .before()
            .after();

          expect(called.before).to(be_true);
          expect(called.after ).to(be_true);
        });
      });

      context("called with a single scope", function() {
        before(function() {
          Coolerator.Filter('one')
            .before(function(view) {
              called.before = true;
            })
            .after(function(view) {
              called.after = true;
            });
        });

        it("adds the filter to the provided scope", function() {
          Coolerator.Filters.prepare({}, 'one')
            .before()
            .after();

          expect(called.before).to(be_true);
          expect(called.after ).to(be_true);
        });

        it("does not add the filter to the global scope", function() {
          Coolerator.Filters.prepare({}, '*')
            .before()
            .after();

          expect(called.before).to(be_false);
          expect(called.after ).to(be_false);
        });
      });

      context("called with multiple scopes", function() {
        before(function() {
          Coolerator.Filter('one', 'two')
            .before(function(view) {
              called.before = true;
            })
            .after(function(view) {
              called.after = true;
            });
        });

        it("adds the filter to the first provided scope", function() {
          Coolerator.Filters.prepare({}, 'one')
            .before()
            .after();

          expect(called.before).to(be_true);
          expect(called.after ).to(be_true);
        });

        it("adds the filter to the first provided scope", function() {
          Coolerator.Filters.prepare({}, 'two')
            .before()
            .after();

          expect(called.before).to(be_true);
          expect(called.after ).to(be_true);
        });

        it("does not add the filter to the global scope", function() {
          Coolerator.Filters.prepare({}, '*')
            .before()
            .after();

          expect(called.before).to(be_false);
          expect(called.after ).to(be_false);
        });
      });
    });
  });
}});
