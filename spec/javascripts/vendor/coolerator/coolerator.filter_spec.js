//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  after(function() {
    Coolerator.Filters.reset();
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

      describe(".get", function() {
        context("with 'scope' defined", function() {
          context("when there are matches", function() {
            before(function() {
              Coolerator.Filter({ label : 'global' });
              Coolerator.Filter({ label : 'one', scope : 'uno' });
              Coolerator.Filter({ label : 'two', scope : 'dos' });
            });

            it("returns an array which contains all global filters", function() {
              expect(Coolerator.Filters.get('uno')[0].label).to(equal, 'global');
            });

            it("returns an array which contains scope-matching filters", function() {
              expect(Coolerator.Filters.get('uno')[1].label).to(equal, 'one');
            });

            it("returns an array which does not contain scope-mismatching filters", function() {
              expect(Coolerator.Filters.get('uno')).to(have_length, 2);
            });

            it("handles a passed scope of '*', returning 'global' filters", function() {
              var result = Coolerator.Filters.get('*');

              expect(result         ).to(have_length, 1);
              expect(result[0].label).to(equal,       'global');
            });
          });

          context("when there are no matches", function() {
            it("returns an empty array", function() {
              expect(Coolerator.Filters.get('nothing')).to(have_length, 0);
            });
          });
        });

        context("with 'scope' undefined", function() {
          it("throws an exception", function() {
            expect(Coolerator.Filters.get).to(throw_exception);
          });
        });
      });

      describe(".reset", function() {
        before(function() {
          Coolerator.Filter({ label : 'reset' });
        });

        it("sets 'count' to 0", function() {
          expect(Coolerator.Filters.count()).to(equal, 1);

          Coolerator.Filters.reset();
          expect(Coolerator.Filters.count()).to(equal, 0);
        });

        it("clears the existing filters", function() {
          expect(Coolerator.Filters.get('scope')).to(have_length, 1);

          Coolerator.Filters.reset();
          expect(Coolerator.Filters.get('scope')).to(have_length, 0);
        });
      });
    });
  });

  describe("Coolerator.Filter", function() {
    var filter;

    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Filter).to(equal, 'function');
    });

    it("returns the filter", function() {
      expect(Coolerator.Filter({})).to_not(be_undefined);
    });

    context("called with no scope", function() {
      before(function() {
        filter = Coolerator.Filter({ label : 'global' });
      });

      it("adds the filter to the 'global' scope", function() {
        expect(Coolerator.Filters.get('*')[0].label).to(equal, 'global');
      });
    });

    context("called with a single scope", function() {
      before(function() {
        filter = Coolerator.Filter({ scope : 'one', label : 'single' });
      });

      it("adds the filter to that scope", function() {
        expect(Coolerator.Filters.get('*')).to(be_empty);
        expect(Coolerator.Filters.get('one')[0].label).to(equal, 'single');
      });
    });

    context("called with multiple scopes", function() {
      before(function() {
        filter = Coolerator.Filter({ scope : ['one', 'two'], label : 'double' });
      });

      it("adds the filter to each scope", function() {
        expect(Coolerator.Filters.get('*')).to(be_empty);
        expect(Coolerator.Filters.get('one')[0].label).to(equal, 'double');
        expect(Coolerator.Filters.get('two')[0].label).to(equal, 'double');
      });
    });

    describe("the filter", function() {
      it("defines :label", function() {
        var filter = Coolerator.Filter({ label : 'label' });
        expect(filter.label).to(equal, 'label');
      });

      it("defines :before", function() {
        function before() {};
        var filter = Coolerator.Filter({ before : before });

        expect(filter.before).to(equal, before);
      });

      it("defines :after", function() {
        function after() {};
        var filter = Coolerator.Filter({ after : after });

        expect(filter.after).to(equal, after);
      });

      it("does not include other definitions", function() {
        var filter = Coolerator.Filter({ scope : 'scope' });
        expect(filter.scope).to(be_undefined);
      });
    });
  });
}});
