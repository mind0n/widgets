/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var webuser_tsx_1 = __webpack_require__(1);
	var webuser_tsx_2 = __webpack_require__(1);
	var user = new webuser_tsx_2._WebUser("Ed", "James");
	var user2 = new webuser_tsx_1.WebUser("Ed", "James");


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	var WebUser = (function () {
	    function WebUser(userId, pwd) {
	        this.UserId = userId;
	        this.Pwd = pwd;
	    }
	    return WebUser;
	}());
	exports.WebUser = WebUser;
	exports._WebUser = WebUser;


/***/ }
/******/ ]);
//# sourceMappingURL=basic.bundle.js.map