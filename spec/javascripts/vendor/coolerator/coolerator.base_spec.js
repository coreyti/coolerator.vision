//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.Base", function() {
    it("creates the Coolerator namespace", function() {
      expect(typeof Coolerator).to(equal, 'object');
    });
  });
}});
