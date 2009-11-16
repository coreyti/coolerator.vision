//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.Views", function() {
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Views).to(equal, 'object');
    });

    describe("methods", function() {
      describe(".get", function() {
        context("with 'classifier' defined appropriately", function() {
          context("when there is a match", function() {
            it("returns the view", function() {
              var view = new Coolerator.View('defined');
              expect(Coolerator.Views.get('defined')).to(equal, view);
            });
          });

          context("when there is no match", function() {
            it("returns undefined", function() {
              expect(Coolerator.Views.get('undefined')).to(be_undefined);
            });
          });
        });

        context("with 'classifier' as falsy", function() {
          var fn;

          it("throws an exception (with undefined)", function() {
            fn = function fn() {
              Coolerator.Views.get();
            }
            expect(fn).to(throw_exception);
          });

          it("throws an exception (with null)", function() {
            fn = function fn() {
              Coolerator.Views.get(null);
            }
            expect(fn).to(throw_exception);
          });

          it("throws an exception (with empty string)", function() {
            fn = function fn() {
              Coolerator.Views.get('');
            }
            expect(fn).to(throw_exception);
          });

          it("throws an exception (with 0)", function() {
            fn = function fn() {
              Coolerator.Views.get(0);
            }
            expect(fn).to(throw_exception);
          });
        });
      });
    });
  });

  describe("Coolerator.View", function() {
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.View).to(equal, 'function');
    });

    describe("constructor", function() {
      var fn;

      context("with 'classifier' defined appropriately", function() {
        var view;

        before(function() {
          view = new Coolerator.View('valid');
        });

        describe("the returned object", function() {
          it("is a Coolerator.View instance", function() {
            expect(view.constructor.name).to(equal, 'View');
          });

          it("defines 'classifier' as an attribute", function() {
            expect(view.classifier).to(equal, 'valid');
          });
        });

        describe("updates to Coolerator.Views", function() {
          it("stores the new view", function() {
            expect(Coolerator.Views.get('valid')).to(equal, view);
          });

          it("overwrites an existing view of the same classifier", function() {
            var over = new Coolerator.View('valid');

            expect(Coolerator.Views.get('valid') == over).to(be_true);
            expect(Coolerator.Views.get('valid') == view).to(be_false);
          });
        });
      });

      context("with 'classifier' defined with space(s)", function() {
        before(function() {
          fn = function fn() {
            return new Coolerator.View('with spaces');
          }
        });

        it("throws an exception", function() {
          expect(fn).to(throw_exception);
        });
      });

      context("with 'classifier' defined as falsy", function() {
        it("throws an exception (with undefined)", function() {
          fn = function fn() {
            return new Coolerator.View();
          }
          expect(fn).to(throw_exception);
        });

        it("throws an exception (with null)", function() {
          fn = function fn() {
            return new Coolerator.View(null);
          }
          expect(fn).to(throw_exception);
        });

        it("throws an exception (with empty string)", function() {
          fn = function fn() {
            return new Coolerator.View('');
          }
          expect(fn).to(throw_exception);
        });

        it("throws an exception (with 0)", function() {
          fn = function fn() {
            return new Coolerator.View(0);
          }
          expect(fn).to(throw_exception);
        });
      });
    });

    describe("methods", function() {
      var view;

      before(function() {
        view = new Coolerator.View('subscript');
      });

      describe("#subscribe", function() {
        context("given a function", function() {
          it("executes the function with 'this' as the view", function() {
            view.subscribe(function() {
              expect(this).to(equal, view);
            });
          });

          it("executes the function with a Coolerator.Registar subscription", function() {
            view.subscribe(function(subscription) { with(subscription) {
              expect(on ).to_not(be_undefined);
              expect(use).to_not(be_undefined);
            }});
          });

          it("[PENDING] executes the function after executing #extend, so other fields are available", function() {
            // this does work, but it relies on jQuery's document ready event which makes it hard to test here.
          });
        });
      });

      describe("#extend", function() {
        context("given an extension with non-instance arguments", function() {
          it("extends the 'collection' object (the view)", function() {
            function func() {};

            view.extend({
              conf : 'config',
              func : func
            });

            expect(view.conf).to(equal, 'config');
            expect(view.func).to(equal, func);
          });

          it("does not 'step on' other views", function() {
            var view1 = new Coolerator.View('one');
            var view2 = new Coolerator.View('two');

            view1.extend({
              foo : function foo() {
                return 'foo on view one';
              }
            });

            view2.extend({
              foo : function foo() {
                return 'foo on view two';
              }
            });

            expect(view1.foo()).to(equal, 'foo on view one');
            expect(view2.foo()).to(equal, 'foo on view two');
          });
        });

        context("given an extension with an instance argument", function() {
          it("does not extend the 'collection' object", function() {
            view.extend({
              instance : {
                methods : {}
              }
            });

            expect(view.instance).to(be_undefined);
          });

          it("extends built instances", function() {
            view.extend({
              instance : {
                content : function content(builder) {
                  builder.div('content');
                },

                methods : {
                  label : function label() {
                    return 'an instance';
                  }
                }
              }
            });

            expect(view.build().label()).to(equal, 'an instance');
          });

          it("does not 'step on' other views", function() {
            var view1 = new Coolerator.View('one');
            var view2 = new Coolerator.View('two');

            view1.extend({
              instance : {
                methods : {
                  foo : function foo() {
                    return 'foo on view one';
                  }
                }
              }
            });

            view2.extend({
              instance : {
                methods : {
                  foo : function foo() {
                    return 'foo on view two';
                  }
                }
              }
            });

            expect(view1.build().foo()).to(equal, 'foo on view one');
            expect(view2.build().foo()).to(equal, 'foo on view two');
          });

          describe("content (for the builder)", function() {
            it("is defaulted to a simple <div />", function() {
              view.extend({
                instance : {}
              });

              var wrapper = $('<div></div>');
                  wrapper.html(view.build());
              expect(wrapper.html()).to(equal, '<div class="subscript"></div>');
            });

            describe("overwriting", function() {
              it("is allowed", function() {
                view.extend({
                  instance : {
                    content : function content(builder) {
                      with(builder) {
                        div({ id : 'custom' });
                      }
                    }
                  }
                });

                var wrapper = $('<div></div>');
                    wrapper.html(view.build());
                expect(wrapper.html()).to(equal, '<div id="custom"></div>');
              });
            });
          });

          describe("methods", function() {
            describe("#initialize", function() {
              it("is called automatically", function() {
                var called = false;

                view.extend({
                  instance : {
                    methods : {
                      initialize : function initialize() {
                        called = true;
                      }
                    }
                  }
                });

                view.build();
                expect(called).to(be_true);
              });

              it("is defaulted to (optionally) write provided content to the instance", function() {
                view.extend({
                  instance : {}
                });

                expect(view.build().html()).to(equal, '');
                expect(view.build({ content : 'hello there' }).html()).to(equal, 'hello there');
              });

              describe("overwriting", function() {
                before(function() {
                  view.extend({
                    instance : {
                      methods : {
                        initialize : function initialize() {
                          this.html('overwritten');
                        }
                      }
                    }
                  });
                });

                it("is allowed", function() {
                  var instance = view.build();
                  expect(instance.html()).to(equal, 'overwritten');
                });

                it("provides a mechanism for calling #super", function() {
                  var instance = view.build();
                  expect(typeof instance.initialize.super).to(equal, 'function');
                });
              });
            });

            describe("#subscribe", function() {
              it("is called automatically, with 'this' as the instance and a Coolerator.Registar subscription as an argument", function() {
                var called = false;
                var callee = null;

                view.extend({
                  instance : {
                    methods : {
                      subscribe : function subscribe(subscription) {
                        called = true;
                        callee = this;

                        with(subscription) {
                          expect(on ).to_not(be_undefined);
                          expect(use).to_not(be_undefined);
                        }
                      }
                    }
                  }
                });

                var instance = view.build();
                expect(called).to(be_true);
                expect(callee).to(equal, instance);
              });
            });
          });
        });
      });

      describe("#build", function() {
        it("returns an 'instance' of the view", function() {
          view.extend({
            instance : {
              content : function content(builder) {
                builder.div('content');
              },

              methods : {
                label : function label() {
                  return 'an instance';
                }
              }
            }
          });

          expect(view.build().label()).to(equal, 'an instance');
        });
      });
    });
  });
}});
