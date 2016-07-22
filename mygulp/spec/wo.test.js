var fs = require("fs");
var code = fs.readFileSync("./dist/scripts/wo.js", "utf-8");
//eval(code);

describe("wo.js test suite", function(){
    it("Sample assertion", function(){
        expect(code).toBeTruthy();
    })
});