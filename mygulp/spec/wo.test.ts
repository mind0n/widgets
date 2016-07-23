/// <reference path="../typings/index.d.ts" />

// describe('1st tests', () => {
//   it('true is true', () => expect(true).toEqual(true));
// });

describe("wo.js test suite", function(){
    it("wo should exist", function(){
        expect(wo).toBeTruthy();
        expect(wo.use).toBeTruthy();
    });
    it("Widget card should exist", function(){
        var cd = wo.use({ui:"card"});
        expect(cd).toBeTruthy();
    });    
});