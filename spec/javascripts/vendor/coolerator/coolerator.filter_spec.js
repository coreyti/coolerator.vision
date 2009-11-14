//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.Filters", function() {
    after(function() {
      Coolerator.Filters.reset();
    });

    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Filters).to(equal, 'object');
    });

    describe("methods", function() {
      describe(".count", function() {
        before(function() {
          Coolerator.Filters.add({});
          Coolerator.Filters.add('scope 1', {});
          Coolerator.Filters.add('scope 1', {});
          Coolerator.Filters.add('scope 2', {});
        });

        it("returns the count of filters, regardless of scope", function() {
          expect(Coolerator.Filters.count()).to(equal, 4);
        });
      });

      describe(".add", function() {
        context("with 'scope' as defined", function() {
          it("increments the count", function() {
            Coolerator.Filters.add('scope', {});
            expect(Coolerator.Filters.count()).to(equal, 1);
          });

          it("adds a scoped filter", function() {
            Coolerator.Filters.add('scope', { label : 'scoped' });
            expect(Coolerator.Filters.get('scope')[0].label).to(equal, 'scoped'); // TODO: switch this to use .get once that's implemented.
          });
        });

        context("with 'scope' as undefined", function() {
          it("increments the count", function() {
            Coolerator.Filters.add({});
            expect(Coolerator.Filters.count()).to(equal, 1);
          });

          it("adds a global filter", function() {
            Coolerator.Filters.add({ label : 'global' });
            expect(Coolerator.Filters.get('anything')[0].label).to(equal, 'global'); // TODO: switch this to use .get once that's implemented.
          });
        });
      });

      describe(".get", function() {
        var fn;

        before(function() {
          fn = function fn(scope) {
            return Coolerator.Filters.get(scope);
          }
        });

        context("with 'scope' as defined", function() {
          context("when there are matches", function() {
            before(function() {
              Coolerator.Filters.add({ label : 'global' });
              Coolerator.Filters.add('uno', { label : 'one' });
              Coolerator.Filters.add('dos', { label : 'two'});
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

        context("with 'scope' as undefined", function() {
          it("throws an exception", function() {
            expect(fn).to(throw_exception);
          });
        });
      });

      describe(".reset", function() {
        before(function() {
          Coolerator.Filters.add('scope', { label : 'reset' });
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
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Filter).to(equal, 'function');
    });

    context("when created with a configuration object", function() {
      context("when the configuration :label exists", function() {
        var filter = new Coolerator.Filter({
          label : 'so cool!',
          scope : 'everywhere'
        });

        it("is created with a label", function() {
          expect(Coolerator.Filters.get('everywhere')[0].label).to(equal, 'so cool!');
        });
      });
    });
  });
}});
