//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.View", function() {
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.View).to(equal, 'function');
    });
  });
}});
