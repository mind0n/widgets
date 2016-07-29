describe("wo.js test suite", function () {
    it("wo should exist", function () {
        expect(wo).toBeTruthy();
        expect(wo.use).toBeTruthy();
    });
    it("UiCreator should exist", function () {
        var creator = new wo.UiCreator();
        expect(creator).toBeTruthy();
    });
});
