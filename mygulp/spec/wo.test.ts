/// <reference path="../typings/index.d.ts" />


describe("wo.js test suite", function(){
    it("wo should exist", function(){
        expect(wo).toBeTruthy();
        expect(wo.use).toBeTruthy();
    });
    it("UiCreator should exist", function(){
        let creator = new wo.UiCreator();
        expect(creator).toBeTruthy();
    });
    // it("Ut example should exist", function(){
    //     //let rlt = testfunc();
    // });
});