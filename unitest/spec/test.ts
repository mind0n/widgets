/// <reference path="../typings/index.d.ts" />
import ajax from "../src/src.ts";

describe("Unit test demo", function(){
    it("jQuery should exist", function(){
        expect($).toBeTruthy();
    });
    it("ajax util should exist", function(){
        expect(ajax).toBeTruthy();
    });    
});