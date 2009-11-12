//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.Filter", function() {
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Filter).to(equal, 'function');
    });
  });
}});
