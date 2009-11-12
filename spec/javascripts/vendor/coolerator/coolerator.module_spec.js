//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.Module", function() {
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Module).to(equal, 'function');
    });
  });
}});
