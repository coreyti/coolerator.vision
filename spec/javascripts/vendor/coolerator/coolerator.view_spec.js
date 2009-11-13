//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.Views", function() {
    it("is added to the Coolerator namespace", function() {
      expect(Coolerator.Views).to_not(be_undefined);
    });

    describe("when creating a Coolerator.View", function() {
      it("the View is added to the collection", function() {
        var view = new Coolerator.View('oh, behave!');
        expect(Coolerator.Views['oh, behave!']).to(equal, view);
      });
    });
  });

  describe("Coolerator.View", function() {
    it("is added to the Coolerator namespace", function() {
      expect(Coolerator.View).to_not(be_undefined);
    });

    describe("collection", function() {
      it("is optional", function() {
        var fn = function() {
          var view = new Coolerator.View('one');

          view.extend({
            instance : {
              methods : {}
            }
          });
        };

        expect(fn).to_not(throw_exception);
      });
    });

    describe("instance", function() {
      describe("methods which are implemented in super and child objects", function() {
        var view, other;

        before(function() {
          other = new Coolerator.View('other');
          view  = new Coolerator.View('child');

          view.extend({
            instance : {
              methods : {
                initialize : function initialize() {}
              }
            }
          })
        });

        it("provides a mechanism for calling #super", function() {
          var instance = view.build();
          expect(instance.initialize.super).to(equal, other.instance.methods.initialize);
        });
      });

      describe("when two or more Views implement the same method", function() {
        var instance1, instance2;

        before(function() {
          view1 = new Coolerator.View('one');

          view1.extend({
            instance : {
              methods : {
                foo : function foo() {
                  return "foo an instance of view1";
                }
              }
            }
          });

          view2 = new Coolerator.View('two');

           view2.extend({
             instance : {
               methods : {
                 foo : function foo() {
                   return "foo an instance of view2";
                 }
               }
             }
           });

           instance1 = view1.build();
           instance2 = view2.build();
        });

        it("allows them to coexist", function() {
          expect(instance1.foo()).to(equal, "foo an instance of view1");
          expect(instance2.foo()).to(equal, "foo an instance of view2");
        });
      });
    });
  });
}});
