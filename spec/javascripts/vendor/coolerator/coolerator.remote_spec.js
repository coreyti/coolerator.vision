//= require <support/spec_helper>

Screw.Unit(function(c) { with(c) {
  describe("Coolerator.Remote", function() {
    it("is added to the Coolerator namespace", function() {
      expect(typeof Coolerator.Remote).to(equal, 'object');
    });
  });
}});
