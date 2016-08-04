(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../typings/index.d.ts" />
"use strict";
var greet_ts_1 = require("../src/component/greet.ts");
var greet_ts_2 = require("../src/component/greet.ts");
describe("Unit test suite", function () {
    it("sayHello & showHello should exist", function () {
        expect(greet_ts_1.sayHello).toBeTruthy();
        expect(greet_ts_2.showHello).toBeTruthy();
    });
    it("showHello should work", function () {
        var id = "helloDiv";
        var div = document.createElement('div');
        div.id = id;
        div.style.display = 'none';
        document.body.appendChild(div);
        var content = "Unit Test";
        greet_ts_2.showHello(id, content);
        expect(div.innerHTML).toBeTruthy();
    });
});
},{"../src/component/greet.ts":3}],2:[function(require,module,exports){
/// <reference path="../typings/index.d.ts" />
// import {sayHello} from "../src/component/greet.ts";
// import {showHello} from "../src/component/greet.ts";
angular.module('app', [])
    .controller('PasswordController', function PasswordController($scope) {
    $scope.password = '';
    $scope.grade = function () {
        var size = $scope.password.length;
        if (size > 8) {
            $scope.strength = 'strong';
        }
        else if (size > 3) {
            $scope.strength = 'medium';
        }
        else {
            $scope.strength = 'weak';
        }
    };
});
describe("Angular Unit Test", function () {
    it("angular should exist", function () {
        expect(angular).toBeTruthy();
    });
    it("angular module should exist", function () {
        expect(angular.module).toBeTruthy();
    });
    beforeEach(angular.mock.module('app'));
    var $controller;
    beforeEach(inject(function (_$controller_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));
    it("Password should be strong", function () {
        var $scope = {};
        var controller = $controller('PasswordController', { $scope: $scope });
        $scope.password = 'longerthaneightchars';
        $scope.grade();
        expect($scope.strength).toEqual('strong');
    });
});
},{}],3:[function(require,module,exports){
"use strict";
function sayHello(name) {
    return "Hello from " + name;
}
exports.sayHello = sayHello;
function showHello(divName, name) {
    var elt = document.getElementById(divName);
    elt.innerText = sayHello(name);
}
exports.showHello = showHello;
},{}]},{},[1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdkYy5XZWIuU1BBLlRlc3Qvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImdkYy53ZWIuc3BhLnRlc3RcXHNwZWNcXEdkYy5XZWIuU1BBLlRlc3RcXHNwZWNcXDFzdC50ZXN0cy50cyIsImdkYy53ZWIuc3BhLnRlc3RcXHNwZWNcXEdkYy5XZWIuU1BBLlRlc3RcXHNwZWNcXDJuZC50ZXN0cy50cyIsImdkYy53ZWIuc3BhLnRlc3RcXHNyY1xcY29tcG9uZW50XFxHZGMuV2ViLlNQQS5UZXN0XFxzcmNcXGNvbXBvbmVudFxcZ3JlZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSw4Q0FBOEM7O0FBRTlDLHlCQUF1QiwyQkFBMkIsQ0FBQyxDQUFBO0FBQ25ELHlCQUF3QiwyQkFBMkIsQ0FBQyxDQUFBO0FBRXBELFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtJQUN4QixFQUFFLENBQUMsbUNBQW1DLEVBQUU7UUFDcEMsTUFBTSxDQUFDLG1CQUFRLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM5QixNQUFNLENBQUMsb0JBQVMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ0gsRUFBRSxDQUFDLHVCQUF1QixFQUFFO1FBQ3hCLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUNwQixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ1osR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQzNCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQztRQUMxQixvQkFBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUM7O0FDcEJILDhDQUE4QztBQUU5QyxzREFBc0Q7QUFDdEQsdURBQXVEO0FBRXZELE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztLQUN4QixVQUFVLENBQUMsb0JBQW9CLEVBQUUsNEJBQTRCLE1BQU07SUFDbEUsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDckIsTUFBTSxDQUFDLEtBQUssR0FBRztRQUNiLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUM3QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztRQUMzQixDQUFDO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsbUJBQW1CLEVBQUU7SUFDMUIsRUFBRSxDQUFDLHNCQUFzQixFQUFFO1FBQ3ZCLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRTtRQUM5QixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3hDLENBQUMsQ0FBQyxDQUFDO0lBRUgsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkMsSUFBSSxXQUFlLENBQUM7SUFDcEIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFTLGFBQWE7UUFDcEMseUZBQXlGO1FBQ3pGLFdBQVcsR0FBRyxhQUFhLENBQUM7SUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVKLEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtRQUM5QixJQUFJLE1BQU0sR0FBTyxFQUFFLENBQUM7UUFDcEIsSUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDdkUsTUFBTSxDQUFDLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQztRQUN6QyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDOzs7QUMxQ0gsa0JBQXlCLElBQVk7SUFDakMsTUFBTSxDQUFDLGdCQUFjLElBQU0sQ0FBQztBQUNoQyxDQUFDO0FBRmUsZ0JBQVEsV0FFdkIsQ0FBQTtBQUVELG1CQUEwQixPQUFlLEVBQUUsSUFBWTtJQUNuRCxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFIZSxpQkFBUyxZQUd4QixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2luZGV4LmQudHNcIiAvPlxyXG5cclxuaW1wb3J0IHtzYXlIZWxsb30gZnJvbSBcIi4uL3NyYy9jb21wb25lbnQvZ3JlZXQudHNcIjtcclxuaW1wb3J0IHtzaG93SGVsbG99IGZyb20gXCIuLi9zcmMvY29tcG9uZW50L2dyZWV0LnRzXCI7XHJcblxyXG5kZXNjcmliZShcIlVuaXQgdGVzdCBzdWl0ZVwiLCBmdW5jdGlvbigpe1xyXG4gICAgaXQoXCJzYXlIZWxsbyAmIHNob3dIZWxsbyBzaG91bGQgZXhpc3RcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBleHBlY3Qoc2F5SGVsbG8pLnRvQmVUcnV0aHkoKTtcclxuICAgICAgICBleHBlY3Qoc2hvd0hlbGxvKS50b0JlVHJ1dGh5KCk7XHJcbiAgICB9KTtcclxuICAgIGl0KFwic2hvd0hlbGxvIHNob3VsZCB3b3JrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IGlkID0gXCJoZWxsb0RpdlwiO1xyXG4gICAgICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBkaXYuaWQgPSBpZDtcclxuICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XHJcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBcIlVuaXQgVGVzdFwiO1xyXG4gICAgICAgIHNob3dIZWxsbyhpZCwgY29udGVudCk7XHJcbiAgICAgICAgZXhwZWN0KGRpdi5pbm5lckhUTUwpLnRvQmVUcnV0aHkoKTtcclxuICAgIH0pO1xyXG59KTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9pbmRleC5kLnRzXCIgLz5cclxuXHJcbi8vIGltcG9ydCB7c2F5SGVsbG99IGZyb20gXCIuLi9zcmMvY29tcG9uZW50L2dyZWV0LnRzXCI7XHJcbi8vIGltcG9ydCB7c2hvd0hlbGxvfSBmcm9tIFwiLi4vc3JjL2NvbXBvbmVudC9ncmVldC50c1wiO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtdKVxyXG4uY29udHJvbGxlcignUGFzc3dvcmRDb250cm9sbGVyJywgZnVuY3Rpb24gUGFzc3dvcmRDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICRzY29wZS5wYXNzd29yZCA9ICcnO1xyXG4gICRzY29wZS5ncmFkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNpemUgPSAkc2NvcGUucGFzc3dvcmQubGVuZ3RoO1xyXG4gICAgaWYgKHNpemUgPiA4KSB7XHJcbiAgICAgICRzY29wZS5zdHJlbmd0aCA9ICdzdHJvbmcnO1xyXG4gICAgfSBlbHNlIGlmIChzaXplID4gMykge1xyXG4gICAgICAkc2NvcGUuc3RyZW5ndGggPSAnbWVkaXVtJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRzY29wZS5zdHJlbmd0aCA9ICd3ZWFrJztcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKFwiQW5ndWxhciBVbml0IFRlc3RcIiwgZnVuY3Rpb24oKXtcclxuICAgIGl0KFwiYW5ndWxhciBzaG91bGQgZXhpc3RcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBleHBlY3QoYW5ndWxhcikudG9CZVRydXRoeSgpOyAgICBcclxuICAgIH0pO1xyXG4gICAgaXQoXCJhbmd1bGFyIG1vZHVsZSBzaG91bGQgZXhpc3RcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBleHBlY3QoYW5ndWxhci5tb2R1bGUpLnRvQmVUcnV0aHkoKTsgICAgXHJcbiAgICB9KTtcclxuXHJcbiAgICBiZWZvcmVFYWNoKGFuZ3VsYXIubW9jay5tb2R1bGUoJ2FwcCcpKTtcclxuICAgIGxldCAkY29udHJvbGxlcjphbnk7XHJcbiAgICBiZWZvcmVFYWNoKGluamVjdChmdW5jdGlvbihfJGNvbnRyb2xsZXJfKXtcclxuICAgICAgICAvLyBUaGUgaW5qZWN0b3IgdW53cmFwcyB0aGUgdW5kZXJzY29yZXMgKF8pIGZyb20gYXJvdW5kIHRoZSBwYXJhbWV0ZXIgbmFtZXMgd2hlbiBtYXRjaGluZ1xyXG4gICAgICAgICRjb250cm9sbGVyID0gXyRjb250cm9sbGVyXztcclxuICAgIH0pKTtcclxuXHJcbiAgICBpdChcIlBhc3N3b3JkIHNob3VsZCBiZSBzdHJvbmdcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgbGV0ICRzY29wZTphbnkgPSB7fTtcclxuICAgICAgdmFyIGNvbnRyb2xsZXIgPSAkY29udHJvbGxlcignUGFzc3dvcmRDb250cm9sbGVyJywgeyAkc2NvcGU6ICRzY29wZSB9KTtcclxuICAgICAgJHNjb3BlLnBhc3N3b3JkID0gJ2xvbmdlcnRoYW5laWdodGNoYXJzJztcclxuICAgICAgJHNjb3BlLmdyYWRlKCk7XHJcbiAgICAgIGV4cGVjdCgkc2NvcGUuc3RyZW5ndGgpLnRvRXF1YWwoJ3N0cm9uZycpOyAgICBcclxuICAgIH0pO1xyXG59KTsiLCJleHBvcnQgZnVuY3Rpb24gc2F5SGVsbG8obmFtZTogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gYEhlbGxvIGZyb20gJHtuYW1lfWA7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93SGVsbG8oZGl2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcclxuICAgIGxldCBlbHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcclxuICAgIGVsdC5pbm5lclRleHQgPSBzYXlIZWxsbyhuYW1lKTtcclxufSJdfQ==
