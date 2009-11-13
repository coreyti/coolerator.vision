//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.Filter", function() {
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Filter).to(equal, 'function');
    });

    context("when created with a configuration object", function() {
      context("when the configuration contains a :label", function() {
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
