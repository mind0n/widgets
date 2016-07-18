/// <reference path="../../../typings/globals/jquery/index.d.ts" />
var test = $("div");

Array.prototype.add = function (item) {
    this[this.length] = item;
};
Array.prototype.clear = function (keepalive) {
    var n = this.length;
    for (var i = n - 1; i >= 0; i--) {
        //delete this[i];
        var tmp = this.pop();
        tmp = null;
    }
};

/// <reference path="definitions.ts" />
var MobileDevice = (function () {
    function MobileDevice() {
    }
    Object.defineProperty(MobileDevice, "Android", {
        get: function () {
            var r = navigator.userAgent.match(/Android/i);
            if (r) {
                console.log('match Android');
            }
            return r != null && r.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MobileDevice, "BlackBerry", {
        get: function () {
            var r = navigator.userAgent.match(/BlackBerry/i);
            if (r) {
                console.log('match Android');
            }
            return r != null && r.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MobileDevice, "iOS", {
        get: function () {
            var r = navigator.userAgent.match(/iPhone|iPad|iPod/i);
            if (r) {
                console.log('match Android');
            }
            return r != null && r.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MobileDevice, "Opera", {
        get: function () {
            var r = navigator.userAgent.match(/Opera Mini/i);
            if (r) {
                console.log('match Android');
            }
            return r != null && r.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MobileDevice, "Windows", {
        get: function () {
            var r = navigator.userAgent.match(/IEMobile/i);
            if (r) {
                console.log('match Android');
            }
            return r != null && r.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MobileDevice, "any", {
        get: function () {
            return (MobileDevice.Android || MobileDevice.BlackBerry || MobileDevice.iOS || MobileDevice.Opera || MobileDevice.Windows);
        },
        enumerable: true,
        configurable: true
    });
    return MobileDevice;
}());
var Browser = (function () {
    function Browser() {
    }
    Object.defineProperty(Browser, "isOpera", {
        // Opera 8.0+
        get: function () {
            return (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isFirefox", {
        // Firefox 1.0+
        get: function () {
            return typeof window.InstallTrigger !== 'undefined';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isSafari", {
        // At least Safari 3+: "[object HTMLElementConstructor]"
        get: function () {
            return Object.prototype.toString.call(HTMLElement).indexOf('Constructor') > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isIE", {
        // Internet Explorer 6-11
        get: function () {
            return false || !!document.documentMode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isEdge", {
        // Edge 20+
        get: function () {
            return !Browser.isIE && !!window.StyleMedia;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isChrome", {
        // Chrome 1+
        get: function () {
            return !!window.chrome && !!window.chrome.webstore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isBlink", {
        // Blink engine detection
        get: function () {
            return (Browser.isChrome || Browser.isOpera) && !!window.CSS;
        },
        enumerable: true,
        configurable: true
    });
    return Browser;
}());

/// <reference path="definitions.ts" />
Element.prototype.astyle = function actualStyle(props) {
    var el = this;
    var compStyle = window.getComputedStyle(el, null);
    for (var i = 0; i < props.length; i++) {
        var style = compStyle.getPropertyValue(props[i]);
        if (style != null) {
            return style;
        }
    }
    return null;
};
var wo;
(function (wo) {
    var Destroyer = (function () {
        function Destroyer() {
        }
        Destroyer.destroy = function (target) {
            if (!target.destroyStatus) {
                target.destroyStatus = new Destroyer();
            }
            if (target.dispose && !target.destroyStatus.disposing) {
                target.destroyStatus.disposing = true;
                target.dispose();
            }
            if (!target.destroyStatus.destroying) {
                target.destroyStatus.destroying = true;
                Destroyer.container.appendChild(target);
                for (var i in target) {
                    if (i.indexOf('$') == 0) {
                        var tmp = target[i];
                        if (tmp instanceof HTMLElement) {
                            target[i] = null;
                            tmp = null;
                        }
                        else {
                            delete target[i];
                        }
                    }
                }
                Destroyer.container.innerHTML = '';
            }
        };
        Destroyer.container = document.createElement("div");
        return Destroyer;
    }());
    function destroy(target) {
        if (target.length > 0 || target instanceof Array) {
            for (var _i = 0, target_1 = target; _i < target_1.length; _i++) {
                var i = target_1[_i];
                Destroyer.destroy(i);
            }
        }
        else if (target instanceof Element) {
            Destroyer.destroy(target);
        }
    }
    wo.destroy = destroy;
    function centerScreen(target) {
        var rect = target.getBoundingClientRect();
        target.style.position = "fixed";
        target.style.left = "50%";
        target.style.top = "50%";
        target.style.marginTop = -rect.height / 2 + "px";
        target.style.marginLeft = -rect.width / 2 + "px";
    }
    wo.centerScreen = centerScreen;
})(wo || (wo = {}));

String.prototype.startsWith = function (str) {
    return this.indexOf(str) == 0;
};
String.prototype.format = function () {
    var args = arguments;
    var s = this;
    if (!args || args.length < 1) {
        return s;
    }
    var r = s;
    for (var i = 0; i < args.length; i++) {
        var reg = new RegExp('\\{' + i + '\\}');
        r = r.replace(reg, args[i]);
    }
    return r;
};

/// <reference path="../foundation/string.ts" />
var wo;
(function (wo) {
    /// Contains creator instance object
    wo.Creators = [];
    function get(selector) {
        var rlt = [];
        if (selector) {
            try {
                rlt = document.querySelectorAll(selector);
            }
            catch (e) {
                console.log(e);
            }
        }
        return rlt;
    }
    var Cursor = (function () {
        function Cursor() {
        }
        return Cursor;
    }());
    wo.Cursor = Cursor;
    var Creator = (function () {
        function Creator() {
        }
        Object.defineProperty(Creator.prototype, "Id", {
            get: function () {
                return this.id;
            },
            enumerable: true,
            configurable: true
        });
        Creator.prototype.Create = function (json, cs) {
            if (!json) {
                return null;
            }
            var o = this.create(json);
            if (!cs) {
                cs = new Cursor();
                cs.root = o;
                cs.parent = null;
                cs.border = o;
                cs.curt = o;
                o.cursor = cs;
            }
            else {
                var ncs = new Cursor();
                ncs.root = cs.root;
                ncs.parent = cs.curt;
                ncs.border = cs.border;
                ncs.curt = o;
                o.cursor = ncs;
                cs = ncs;
            }
            if (json.alias) {
                var n = json.alias;
                if (json.alias.startsWith("$")) {
                    n = json.alias.substr(1, json.alias.length - 1);
                }
                //console.log(cs.border, n);
                cs.border["$" + n] = o;
                if (json.alias.startsWith("$")) {
                    cs.border = o;
                }
            }
            delete json[this.Id];
            this.extend(o, json);
            if (json.made) {
                json.made.call(o);
            }
            o.$root = cs.root;
            o.$border = cs.border;
            return o;
        };
        return Creator;
    }());
    wo.Creator = Creator;
    function append(el, child) {
        if (el.append && typeof (el.append) == 'function') {
            el.append(child);
        }
        else {
            el.appendChild(child);
        }
    }
    wo.append = append;
    function use(json, cs) {
        var rlt = null;
        if (!json) {
            return rlt;
        }
        var container = null;
        if (json.$container$) {
            container = json.$container$;
            delete json.$container$;
        }
        if (typeof (json) == 'string') {
            rlt = get(json);
        }
        for (var _i = 0, Creators_1 = wo.Creators; _i < Creators_1.length; _i++) {
            var i = Creators_1[_i];
            if (json[i.Id]) {
                rlt = i.Create(json, cs);
                break;
            }
        }
        if (container) {
            container.appendChild(rlt);
        }
        return rlt;
    }
    wo.use = use;
    function objextend(o, json) {
        for (var i in json) {
            if (o[i] && typeof (o[i]) == 'object') {
                objextend(o[i], json[i]);
            }
            else {
                o[i] = json[i];
            }
        }
    }
    wo.objextend = objextend;
})(wo || (wo = {}));

/// <reference path="../foundation/definitions.ts" />
/// <reference path="./use.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var wo;
(function (wo) {
    var DomCreator = (function (_super) {
        __extends(DomCreator, _super);
        function DomCreator() {
            _super.call(this);
            this.id = "tag";
        }
        DomCreator.prototype.create = function (json) {
            if (json == null) {
                return null;
            }
            var tag = json[this.id];
            var el;
            if (tag == '#text') {
                el = document.createTextNode(tag);
            }
            else {
                el = document.createElement(tag);
            }
            return el;
        };
        DomCreator.prototype.extend = function (o, json) {
            if (json instanceof Node || json instanceof Element) {
                debugger;
                return;
            }
            if (o instanceof HTMLElement) {
                domextend(o, json);
            }
            else if (json.$ && o instanceof Node) {
                o.nodeValue = json.$;
            }
            else if (o.extend) {
                o.extend(json);
            }
        };
        return DomCreator;
    }(wo.Creator));
    wo.DomCreator = DomCreator;
    function domextend(el, json) {
        var cs = el.cursor;
        for (var i in json) {
            if (i.startsWith("$$")) {
                var target = el[i];
                var type_1 = typeof target;
                if (type_1 == 'object') {
                    var vtype = typeof json[i];
                    if (vtype == 'object') {
                        domextend(target, json[i]);
                    }
                    else {
                        el[i] = json[i];
                    }
                }
                else {
                    el[i] = json[i];
                }
            }
            else if (i == "$") {
                var type_2 = typeof json[i];
                if (json[i] instanceof Array) {
                    for (var _i = 0, _a = json[i]; _i < _a.length; _i++) {
                        var j = _a[_i];
                        var child = wo.use(j, cs);
                        if (child != null) {
                            wo.append(el, child);
                        }
                    }
                }
                else if (type_2 == 'object') {
                    var child = wo.use(json[i], cs);
                    if (child != null) {
                        //el.appendChild(child);
                        wo.append(el, child);
                    }
                    else {
                        debugger;
                    }
                }
                else {
                    el.innerHTML = json[i];
                }
            }
            else if (i.startsWith("$")) {
                el[i] = json[i];
            }
            else {
                var type = typeof json[i];
                if (type == "function") {
                    el[i] = json[i];
                }
                else {
                    if (el[i] && typeof (el[i]) == 'object') {
                        wo.objextend(el[i], json[i]);
                    }
                    else {
                        el.setAttribute(i, json[i]);
                    }
                }
            }
        }
    }
    wo.domextend = domextend;
})(wo || (wo = {}));

/// <reference path="../foundation/definitions.ts" />
/// <reference path="./use.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var wo;
(function (wo) {
    var SvgCreator = (function (_super) {
        __extends(SvgCreator, _super);
        function SvgCreator() {
            _super.call(this);
            this.id = "sg";
        }
        SvgCreator.prototype.create = function (json) {
            if (json == null) {
                return null;
            }
            var tag = json[this.id];
            var el;
            if (tag == "svg") {
                el = document.createElementNS("http://www.w3.org/2000/svg", tag);
            }
            else {
                el = document.createElementNS("http://www.w3.org/2000/svg", tag);
            }
            return el;
        };
        SvgCreator.prototype.extend = function (o, json) {
            if (json instanceof Node || json instanceof Element) {
                debugger;
                return;
            }
            if (o instanceof SVGElement) {
                svgextend(o, json);
            }
            else if (json.$ && o instanceof Node) {
                o.nodeValue = json.$;
            }
            else if (o.extend) {
                o.extend(json);
            }
        };
        return SvgCreator;
    }(wo.Creator));
    wo.SvgCreator = SvgCreator;
    function svgextend(el, json) {
        var cs = el.cursor;
        for (var i in json) {
            if (i.startsWith("$$")) {
                var target = el[i];
                var type_1 = typeof target;
                if (type_1 == 'object') {
                    var vtype = typeof json[i];
                    if (vtype == 'object') {
                        svgextend(target, json[i]);
                    }
                    else {
                        el[i] = json[i];
                    }
                }
                else {
                    el[i] = json[i];
                }
            }
            else if (i == "$") {
                var type_2 = typeof json[i];
                if (json[i] instanceof Array) {
                    for (var _i = 0, _a = json[i]; _i < _a.length; _i++) {
                        var j = _a[_i];
                        var child = wo.use(j, cs);
                        if (child != null) {
                            wo.append(el, child);
                        }
                    }
                }
                else if (type_2 == 'object') {
                    var child = wo.use(json[i], cs);
                    if (child != null) {
                        wo.append(el, child);
                    }
                    else {
                        debugger;
                    }
                }
                else {
                    el.innerHTML = json[i];
                }
            }
            else if (i.startsWith("$")) {
                el[i] = json[i];
            }
            else {
                var type = typeof json[i];
                if (type == "function") {
                    el[i] = json[i];
                }
                else {
                    if (el[i] && typeof (el[i]) == 'object') {
                        wo.objextend(el[i], json[i]);
                    }
                    else {
                        el.setAttributeNS(null, i, json[i]);
                    }
                }
            }
        }
    }
})(wo || (wo = {}));

/// <reference path="../foundation/definitions.ts" />
/// <reference path="./use.ts" />
/// <reference path="./domcreator.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var wo;
(function (wo) {
    wo.Widgets = {};
    var UiCreator = (function (_super) {
        __extends(UiCreator, _super);
        function UiCreator() {
            _super.call(this);
            this.id = "ui";
        }
        UiCreator.prototype.create = function (json) {
            if (json == null) {
                return null;
            }
            var wg = json[this.id];
            if (!wo.Widgets[wg]) {
                return null;
            }
            var el = wo.use(wo.Widgets[wg]());
            return el;
        };
        UiCreator.prototype.extend = function (o, json) {
            if (json instanceof Node || json instanceof Element) {
                debugger;
                return;
            }
            if (o instanceof HTMLElement) {
                domapply(o, json);
            }
            else if (json.$ && o instanceof Node) {
                o.nodeValue = json.$;
            }
            else if (o.extend) {
                o.extend(json);
            }
        };
        return UiCreator;
    }(wo.Creator));
    wo.UiCreator = UiCreator;
    function domapply(el, json) {
        var cs = el.cursor;
        for (var i in json) {
            if (i.startsWith("$$")) {
                var target = el[i];
                var type_1 = typeof target;
                if (type_1 == 'object') {
                    var vtype = typeof json[i];
                    if (vtype == 'object') {
                        domapply(target, json[i]);
                    }
                    else {
                        el[i] = json[i];
                    }
                }
                else {
                    el[i] = json[i];
                }
            }
            else if (i == "$") {
                var type_2 = typeof json[i];
                var ji = json[i];
                if (type_2 == 'object') {
                    ji = [ji];
                }
                if (ji instanceof Array) {
                    var nodes = el.childNodes;
                    for (var j = 0; j < ji.length; j++) {
                        var item = ji[j];
                        if (j < nodes.length) {
                            domapply(nodes[j], item);
                        }
                        else {
                            var child = wo.use(item, cs);
                            if (child != null) {
                                wo.append(el, child);
                            }
                        }
                    }
                }
                else {
                    el.innerHTML = json[i];
                }
            }
            else if (i.startsWith("$")) {
                el[i] = json[i];
            }
            else if (i == "style") {
                wo.objextend(el[i], json[i]);
            }
            else {
                var type = typeof json[i];
                if (type == "function") {
                    el[i] = json[i];
                }
                else {
                    if (el[i] && typeof (el[i]) == 'object') {
                        wo.objextend(el[i], json[i]);
                    }
                    else {
                        el.setAttribute(i, json[i]);
                    }
                }
            }
        }
    }
    wo.domapply = domapply;
})(wo || (wo = {}));

var fingers;
(function (fingers) {
    fingers.Patterns = {};
    var TouchedPattern = (function () {
        function TouchedPattern() {
        }
        TouchedPattern.prototype.verify = function (acts, queue, outq) {
            var rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0;
            return rlt;
        };
        TouchedPattern.prototype.recognize = function (queue, outq) {
            var prev = queue[1];
            //debugger;
            if (prev && prev.length == 1) {
                var act = prev[0];
                var drag = false;
                if (outq != null && outq.length > 0) {
                    var pact = outq[0];
                    if (pact && (pact.act == "dragging" || pact.act == "dragstart")) {
                        drag = true;
                    }
                }
                if (!drag) {
                    for (var i = 0; i < 3; i++) {
                        var q = queue[i];
                        if (q[0].act == "touchstart") {
                            return {
                                act: "touched",
                                cpos: [act.cpos[0], act.cpos[1]],
                                time: act.time
                            };
                        }
                    }
                }
            }
            return null;
        };
        return TouchedPattern;
    }());
    var DraggingPattern = (function () {
        function DraggingPattern() {
        }
        DraggingPattern.prototype.verify = function (acts, queue) {
            var rlt = acts.length == 1
                && acts[0].act == "touchmove"
                && queue.length > 2;
            if (rlt) {
                rlt = false;
                var s1 = queue[2];
                var s2 = queue[1];
                if (s1.length == 1 && s2.length == 1) {
                    var a1 = s1[0];
                    var a2 = s2[0];
                    if (a1.act == "touchstart") {
                    }
                    if (a1.act == "touchstart" && a2.act == "touchmove") {
                        rlt = true;
                    }
                    else if (a1.act == "touchmove" && a2.act == "touchmove") {
                        rlt = true;
                    }
                }
            }
            return rlt;
        };
        DraggingPattern.prototype.recognize = function (queue, outq) {
            var prev = queue[2];
            if (prev.length == 1) {
                var act = prev[0];
                if (act.act == "touchstart") {
                    return {
                        act: "dragstart",
                        cpos: [act.cpos[0], act.cpos[1]],
                        time: act.time
                    };
                }
                else if (act.act == "touchmove" && outq.length > 0) {
                    var ract = outq[0];
                    if (ract.act == "dragstart" || ract.act == "dragging") {
                        return {
                            act: "dragging",
                            cpos: [act.cpos[0], act.cpos[1]],
                            time: act.time
                        };
                    }
                }
            }
            return null;
        };
        return DraggingPattern;
    }());
    var DropPattern = (function () {
        function DropPattern() {
        }
        DropPattern.prototype.verify = function (acts, queue, outq) {
            var rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0 && outq.length > 0;
            return rlt;
        };
        DropPattern.prototype.recognize = function (queue, outq) {
            //let prev = queue[1];
            var act = outq[0];
            if (act.act == "dragging" || act.act == "dragstart") {
                return {
                    act: "dropped",
                    cpos: [act.cpos[0], act.cpos[1]],
                    time: act.time
                };
            }
            return null;
        };
        return DropPattern;
    }());
    var DblTouchedPattern = (function () {
        function DblTouchedPattern() {
        }
        DblTouchedPattern.prototype.verify = function (acts, queue) {
            var rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0;
            return rlt;
        };
        DblTouchedPattern.prototype.recognize = function (queue, outq) {
            var prev = queue[1];
            if (prev && prev.length == 1) {
                var act = prev[0];
                if (outq != null && outq.length > 0) {
                    var pact = outq[0];
                    if (pact && pact.act == "touched") {
                        if (act.act == "touchstart" || act.act == "touchmove") {
                            if (act.time - pact.time < 500) {
                                return {
                                    act: "dbltouched",
                                    cpos: [act.cpos[0], act.cpos[1]],
                                    time: act.time
                                };
                            }
                            else {
                                return {
                                    act: "touched",
                                    cpos: [act.cpos[0], act.cpos[1]],
                                    time: act.time
                                };
                            }
                        }
                    }
                }
            }
            return null;
        };
        return DblTouchedPattern;
    }());
    function calcAngle(a, b, len) {
        var ag = Math.acos((b.cpos[0] - a.cpos[0]) / len) / Math.PI * 180;
        if (b.cpos[1] < a.cpos[1]) {
            ag *= -1;
        }
        return ag;
    }
    var ZoomStartPattern = (function () {
        function ZoomStartPattern() {
        }
        ZoomStartPattern.prototype.verify = function (acts, queue, outq) {
            var rlt = acts.length == 2
                && ((acts[0].act == "touchstart" || acts[1].act == "touchstart")
                    || (outq.length > 0
                        && acts[0].act == "touchmove"
                        && acts[1].act == "touchmove"
                        && outq[0].act != "zooming"
                        && outq[0].act != "zoomstart"));
            return rlt;
        };
        ZoomStartPattern.prototype.recognize = function (queue, outq) {
            var acts = queue[0];
            var a = acts[0];
            var b = acts[1];
            var len = Math.sqrt((b.cpos[0] - a.cpos[0]) * (b.cpos[0] - a.cpos[0]) + (b.cpos[1] - a.cpos[1]) * (b.cpos[1] - a.cpos[1]));
            var owidth = Math.abs(b.cpos[0] - a.cpos[0]);
            var oheight = Math.abs(b.cpos[1] - a.cpos[1]);
            var ag = calcAngle(a, b, len); //Math.acos((b.cpos[0] - a.cpos[0])/len) / Math.PI * 180;
            var r = {
                act: "zoomstart",
                cpos: [(a.cpos[0] + b.cpos[0]) / 2, (a.cpos[1] + b.cpos[1]) / 2],
                len: len,
                angle: ag,
                owidth: owidth,
                oheight: oheight,
                time: a.time
            };
            return r;
        };
        return ZoomStartPattern;
    }());
    var ZoomPattern = (function () {
        function ZoomPattern() {
        }
        ZoomPattern.prototype.verify = function (acts, queue, outq) {
            var rlt = acts.length == 2
                && (acts[0].act != "touchend" && acts[1].act != "touchend")
                && (acts[0].act == "touchmove" || acts[1].act == "touchmove")
                && outq.length > 0
                && (outq[0].act == "zoomstart" || outq[0].act == "zooming");
            return rlt;
        };
        ZoomPattern.prototype.recognize = function (queue, outq) {
            var acts = queue[0];
            var a = acts[0];
            var b = acts[1];
            var len = Math.sqrt((b.cpos[0] - a.cpos[0]) * (b.cpos[0] - a.cpos[0]) + (b.cpos[1] - a.cpos[1]) * (b.cpos[1] - a.cpos[1]));
            var ag = calcAngle(a, b, len); //Math.acos((b.cpos[0] - a.cpos[0])/len) / Math.PI * 180;
            var owidth = Math.abs(b.cpos[0] - a.cpos[0]);
            var oheight = Math.abs(b.cpos[1] - a.cpos[1]);
            var r = {
                act: "zooming",
                cpos: [(a.cpos[0] + b.cpos[0]) / 2, (a.cpos[1] + b.cpos[1]) / 2],
                len: len,
                angle: ag,
                owidth: owidth,
                oheight: oheight,
                time: a.time
            };
            return r;
        };
        return ZoomPattern;
    }());
    var ZoomEndPattern = (function () {
        function ZoomEndPattern() {
        }
        ZoomEndPattern.prototype.verify = function (acts, queue, outq) {
            var rlt = outq.length > 0
                && (outq[0].act == "zoomstart" || outq[0].act == "zooming")
                && acts.length <= 2;
            if (rlt) {
                //console.dir(acts);
                if (acts.length < 2) {
                    return true;
                }
                else {
                    for (var _i = 0, acts_1 = acts; _i < acts_1.length; _i++) {
                        var i = acts_1[_i];
                        if (i.act == "touchend") {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        ZoomEndPattern.prototype.recognize = function (queue, outq) {
            var r = {
                act: "zoomend",
                cpos: [0, 0],
                len: 0,
                angle: 0,
                owidth: 0,
                oheight: 0,
                time: new Date().getTime()
            };
            return r;
        };
        return ZoomEndPattern;
    }());
    fingers.Patterns.zoomend = new ZoomEndPattern();
    fingers.Patterns.zooming = new ZoomPattern();
    fingers.Patterns.zoomstart = new ZoomStartPattern();
    fingers.Patterns.dragging = new DraggingPattern();
    fingers.Patterns.dropped = new DropPattern();
    fingers.Patterns.touched = new TouchedPattern();
    fingers.Patterns.dbltouched = new DblTouchedPattern();
})(fingers || (fingers = {}));

/// <reference path="../wo/foundation/definitions.ts" />
/// <reference path="./patterns.ts" />
var fingers;
(function (fingers) {
    var Recognizer = (function () {
        function Recognizer(cfg) {
            this.inqueue = [];
            this.outqueue = [];
            this.patterns = [];
            var defpatterns = ["zoomend", "zoomstart", "zooming", "dbltouched", "touched", "dropped", "dragging"];
            if (!cfg) {
                cfg = { patterns: defpatterns };
            }
            if (!cfg.patterns) {
                cfg.patterns = defpatterns;
            }
            this.cfg = cfg;
            for (var _i = 0, _a = cfg.patterns; _i < _a.length; _i++) {
                var i = _a[_i];
                if (fingers.Patterns[i]) {
                    this.patterns.add(fingers.Patterns[i]);
                }
            }
        }
        Recognizer.prototype.parse = function (acts) {
            if (!this.cfg.qlen) {
                this.cfg.qlen = 12;
            }
            this.inqueue.splice(0, 0, acts);
            if (this.inqueue.length > this.cfg.qlen) {
                this.inqueue.splice(this.inqueue.length - 1, 1);
            }
            if (acts.length == 1 && acts[0].act == "touchstart" && this.cfg.on && this.cfg.on.tap) {
                this.cfg.on.tap(acts[0]);
            }
            for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
                var pattern = _a[_i];
                if (pattern.verify(acts, this.inqueue, this.outqueue)) {
                    var rlt = pattern.recognize(this.inqueue, this.outqueue);
                    if (rlt) {
                        this.outqueue.splice(0, 0, rlt);
                        if (this.outqueue.length > this.cfg.qlen) {
                            this.outqueue.splice(this.outqueue.length - 1, 1);
                        }
                        var q = this.inqueue;
                        this.inqueue = [];
                        q.clear();
                        if (this.cfg.on && this.cfg.on[rlt.act]) {
                            this.cfg.on[rlt.act](rlt);
                        }
                        if (this.cfg.onrecognized) {
                            this.cfg.onrecognized(rlt);
                        }
                        break;
                    }
                }
            }
        };
        return Recognizer;
    }());
    fingers.Recognizer = Recognizer;
})(fingers || (fingers = {}));

/// <reference path="recognizer.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fingers;
(function (fingers) {
    var inited = false;
    var zoomsim = (function () {
        function zoomsim() {
        }
        zoomsim.prototype.create = function (act) {
            var m = [document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2];
            this.oppo = { act: act.act, cpos: [2 * m[0] - act.cpos[0], 2 * m[1] - act.cpos[1]], time: act.time };
            //console.log(act.cpos[1], m[1], this.oppo.cpos[1]);
        };
        zoomsim.prototype.start = function (act) {
            this.create(act);
            return [act, this.oppo];
        };
        zoomsim.prototype.zoom = function (act) {
            this.create(act);
            return [act, this.oppo];
        };
        zoomsim.prototype.end = function (act) {
            this.create(act);
            return [act, this.oppo];
        };
        return zoomsim;
    }());
    var offsetsim = (function (_super) {
        __extends(offsetsim, _super);
        function offsetsim() {
            _super.apply(this, arguments);
        }
        offsetsim.prototype.create = function (act) {
            this.oppo = { act: act.act, cpos: [act.cpos[0] + 100, act.cpos[1] + 100], time: act.time };
        };
        return offsetsim;
    }(zoomsim));
    var zs = null;
    var os = null;
    function getouches(event, isend) {
        if (isend) {
            return event.changedTouches;
        }
        else {
            return event.touches;
        }
    }
    function touch(cfg) {
        var rg = new fingers.Recognizer(cfg);
        function createAct(name, x, y) {
            return { act: name, cpos: [x, y], time: new Date().getTime() };
        }
        function handle(cfg, acts) {
            if (!cfg || !cfg.enabled) {
                return;
            }
            if (cfg.onact) {
                cfg.onact(rg.inqueue);
            }
            rg.parse(acts);
        }
        if (!inited) {
            document.oncontextmenu = function () {
                return false;
            };
            if (!MobileDevice.any) {
                zs = new zoomsim();
                os = new offsetsim();
                document.addEventListener("mousedown", function (event) {
                    var act = createAct("touchstart", event.clientX, event.clientY);
                    if (event.button == 0) {
                        handle(cfg, [act]);
                    }
                    else if (event.button == 1) {
                        os.start(act);
                        handle(cfg, [act, os.oppo]);
                    }
                    else if (event.button == 2) {
                        zs.start(act);
                        handle(cfg, [act, zs.oppo]);
                    }
                }, true);
                document.addEventListener("mousemove", function (event) {
                    var act = createAct("touchmove", event.clientX, event.clientY);
                    if (event.button == 0) {
                        handle(cfg, [act]);
                    }
                    else if (event.button == 1) {
                        os.start(act);
                        handle(cfg, [act, os.oppo]);
                    }
                    else if (event.button == 2) {
                        zs.start(act);
                        handle(cfg, [act, zs.oppo]);
                    }
                }, true);
                document.addEventListener("mouseup", function (event) {
                    var act = createAct("touchend", event.clientX, event.clientY);
                    if (event.button == 0) {
                        handle(cfg, [act]);
                    }
                    else if (event.button == 1) {
                        os.start(act);
                        handle(cfg, [act, os.oppo]);
                    }
                    else if (event.button == 2) {
                        zs.start(act);
                        handle(cfg, [act, zs.oppo]);
                    }
                }, true);
            }
            else {
                document.addEventListener("touchstart", function (event) {
                    var acts = [];
                    var touches = getouches(event);
                    for (var i = 0; i < touches.length; i++) {
                        var item = event.changedTouches[i];
                        var act = createAct("touchstart", item.clientX, item.clientY);
                        acts.add(act);
                    }
                    handle(cfg, acts);
                    event.stopPropagation();
                }, true);
                document.addEventListener("touchmove", function (event) {
                    var acts = [];
                    var touches = getouches(event);
                    for (var i = 0; i < touches.length; i++) {
                        var item = event.changedTouches[i];
                        var act = createAct("touchmove", item.clientX, item.clientY);
                        acts.add(act);
                    }
                    handle(cfg, acts);
                    event.stopPropagation();
                    if (Browser.isSafari) {
                        event.preventDefault();
                    }
                }, true);
                document.addEventListener("touchend", function (event) {
                    var acts = [];
                    var touches = getouches(event, true);
                    for (var i = 0; i < touches.length; i++) {
                        var item = event.changedTouches[i];
                        var act = createAct("touchend", item.clientX, item.clientY);
                        acts.add(act);
                    }
                    handle(cfg, acts);
                    event.stopPropagation();
                }, true);
            }
            inited = true;
        }
        return cfg;
    }
    fingers.touch = touch;
})(fingers || (fingers = {}));
function simulate(element, eventName, pos) {
    function extend(destination, source) {
        for (var property in source)
            destination[property] = source[property];
        return destination;
    }
    var eventMatchers = {
        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
    };
    var defaultOptions = {
        pointerX: 100,
        pointerY: 100,
        button: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        bubbles: true,
        cancelable: true
    };
    if (pos) {
        defaultOptions.pointerX = pos[0];
        defaultOptions.pointerY = pos[1];
    }
    var options = extend(defaultOptions, arguments[3] || {});
    var oEvent, eventType = null;
    for (var name_1 in eventMatchers) {
        if (eventMatchers[name_1].test(eventName)) {
            eventType = name_1;
            break;
        }
    }
    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
    if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView, options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}
var touch = fingers.touch;

/// <reference path="recognizer.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fingers;
(function (fingers) {
    var Zoomer = (function () {
        function Zoomer(el) {
            el.$zoomer$ = this;
        }
        return Zoomer;
    }());
    fingers.Zoomer = Zoomer;
    var Zoom = (function (_super) {
        __extends(Zoom, _super);
        function Zoom(el) {
            _super.call(this, el);
            var zoomer = this;
            this.mapping = {
                zoomstart: function (act, el) {
                    zoomer.sact = act;
                    zoomer.pact = act;
                    zoomer.started = true;
                }, zooming: function (act, el) {
                    if (zoomer.started) {
                        var p = zoomer.sact;
                        var offset = [act.cpos[0] - p.cpos[0], act.cpos[1] - p.cpos[1]];
                        var rot = act.angle - p.angle;
                        var scale = act.len / p.len;
                        var delta = { offset: offset, angle: rot, scale: scale };
                        zoomer.pact = act;
                        console.dir(delta);
                    }
                }, zoomend: function (act, el) {
                    zoomer.started = false;
                }
            };
        }
        return Zoom;
    }(Zoomer));
    fingers.Zoom = Zoom;
    var Zsize = (function (_super) {
        __extends(Zsize, _super);
        function Zsize(el) {
            _super.call(this, el);
            var zoomer = this;
            this.mapping = {
                zoomstart: function (act, el) {
                    zoomer.sact = act;
                    zoomer.pact = act;
                    zoomer.started = true;
                }, zooming: function (act, el) {
                    if (zoomer.started) {
                        var p = zoomer.pact;
                        var offset = [act.cpos[0] - p.cpos[0], act.cpos[1] - p.cpos[1]];
                        var resize = [act.owidth - p.owidth, act.oheight - p.oheight];
                        var delta = { offset: offset, resize: resize };
                        var w = el.astyle(["width"]);
                        var h = el.astyle(["height"]);
                        var l = el.astyle(["left"]);
                        var t = el.astyle(["top"]);
                        el.style.width = parseInt(w) + delta.resize[0] + "px";
                        el.style.height = parseInt(h) + delta.resize[1] + "px";
                        el.style.left = parseInt(l) + delta.offset[0] + "px";
                        el.style.top = parseInt(t) + delta.offset[1] + "px";
                        zoomer.pact = act;
                        console.log(delta.resize);
                    }
                }, zoomend: function (act, el) {
                    zoomer.started = false;
                }
            };
        }
        return Zsize;
    }(Zoomer));
    fingers.Zsize = Zsize;
})(fingers || (fingers = {}));

/// <reference path="touch.ts" />
/// <reference path="zoomer.ts" />
var fingers;
(function (fingers) {
    function elAtPos(pos) {
        var rlt = null;
        var cache = [];
        while (true) {
            var el = document.elementFromPoint(pos[0], pos[1]);
            if (el == document.body || el.tagName.toLowerCase() == "html" || el == window) {
                rlt = null;
                break;
            }
            else if (el.$evtrap$) {
                rlt = null;
                break;
            }
            else if (el.$touchable$) {
                rlt = el.getarget ? el.getarget() : el;
                rlt.$touchel$ = el;
                break;
            }
            else {
                el.style.display = "none";
                cache.add(el);
            }
        }
        for (var _i = 0, cache_1 = cache; _i < cache_1.length; _i++) {
            var i = cache_1[_i];
            i.style.display = "";
        }
        return rlt;
    }
    var activeEl;
    var cfg = fingers.touch({
        on: {
            tap: function (act) {
                activeEl = elAtPos(act.cpos);
            }
        }, onact: function (inq) {
        }, onrecognized: function (act) {
            console.log("Recognized:", act.act);
            if (activeEl && activeEl.$zoomer$) {
                var zm = activeEl.$zoomer$;
                if (zm.mapping[act.act]) {
                    zm.mapping[act.act](act, activeEl);
                }
            }
        }
    });
    cfg.enabled = true;
    function finger(el) {
        el.$touchable$ = true;
        return {
            zoomable: function () {
                var zoomer = new fingers.Zoom(el);
                return this;
            }, zsizable: function () {
                var zsize = new fingers.Zsize(el);
                return this;
            }
        };
    }
    fingers.finger = finger;
})(fingers || (fingers = {}));
var finger = fingers.finger;

/// <reference path="./foundation/definitions.ts" />
/// <reference path="./builder/use.ts" />
/// <reference path="./builder/domcreator.ts" />
/// <reference path="./builder/svgcreator.ts" />
/// <reference path="./builder/uicreator.ts" />
wo.Creators.add(new wo.DomCreator());
wo.Creators.add(new wo.SvgCreator());
wo.Creators.add(new wo.UiCreator());

/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />
var wo;
(function (wo) {
    wo.Widgets.cover = function () {
        return {
            tag: "div",
            class: "cover",
            style: { display: 'none' },
            show: function (callback) {
                this.style.display = '';
                if (this.$child) {
                    this.$child.style.display = "";
                }
                if (callback) {
                    callback(this);
                }
            }, hide: function () {
                if (this.$child) {
                    wo.destroy(this.$child);
                    delete this.$child;
                }
                this.style.display = 'none';
                if (this.onhide) {
                    this.onhide();
                }
            }, made: function () {
                var cv = document.body.$gcv$;
                if (cv) {
                    wo.destroy(cv);
                }
                document.body.appendChild(this);
                document.body.$gcv$ = this;
            }, onclick: function (event) {
                if (this.$$touchclose) {
                    this.hide();
                }
            }, append: function (child) {
                this.$child = child;
                document.body.appendChild(child);
            }
        };
    };
    function cover(json) {
        var cv = wo.use({
            ui: 'cover',
            $$touchclose: true,
            $: json
        });
        cv.show(function (el) {
            wo.centerScreen(el.$box || el.$child);
        });
        cv.onhide = json.onhide;
    }
    wo.cover = cover;
})(wo || (wo = {}));

/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />
var wo;
(function (wo) {
    wo.Widgets.card = function () {
        return {
            tag: "div",
            class: "card",
            setval: function (val) {
                for (var i in val) {
                    var v = val[i];
                    var t = this["$" + i];
                    if (t) {
                        if (typeof (v) == 'object') {
                            if (!v.mode || (v.mode == "prepend" && t.childNodes.length < 1)) {
                                v.mode = "append";
                            }
                            if (v.mode == "replace") {
                                t.innerHTML = "";
                                v.mode = "append";
                            }
                            if (v.mode == "prepend") {
                                t.insertBefore(v.target, t.childNodes[0]);
                            }
                            else {
                                t.appendChild(v.target);
                            }
                        }
                        else {
                            $(t).text(v);
                        }
                    }
                }
            },
            $: [
                { tag: "div", class: "title", $: [
                        { tag: "div", class: "txt", alias: "title" },
                        { tag: "div", class: "ctrls", $: [
                                { tag: "div", class: "wbtn", onclick: function (event) { wo.destroy(this.$border); }, $: "X" }
                            ] }
                    ] },
                { tag: "div", class: "body", alias: "body" }
            ]
        };
    };
})(wo || (wo = {}));

/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />
var wo;
(function (wo) {
    wo.Widgets.loading = function () {
        return {
            tag: "div",
            class: "loading",
            made: function () {
                var p1 = wo.use({ ui: "arc" });
                p1.setAttributeNS(null, "class", "arc p1");
                p1.update([16, 48], 16, 270);
                this.$sbox.appendChild(p1);
                var p2 = wo.use({ ui: "arc" });
                p2.setAttributeNS(null, "class", "arc p1");
                p2.update([16, 48], 16, 270);
                this.$sbox.appendChild(p2);
                //$element.velocity({ opacity: 1 }, { duration: 1000 });
                p1.style.transformOrigin = "32px 32px";
                p2.style.transformOrigin = "50% 50%";
                var t1 = 2000, t2 = 1400;
                $(p1).velocity({ rotateZ: "-=360deg" }, { duration: t1, easing: "linear" });
                this.$handle1 = window.setInterval(function () {
                    $(p1).velocity({ rotateZ: "-=360deg" }, { duration: t1, easing: "linear" });
                }, t1);
                $(p2).velocity({ rotateZ: "+=360deg" }, { duration: t2, easing: "linear", loop: true });
            }, $: {
                sg: "svg",
                alias: "sbox",
                style: {
                    width: 64,
                    height: 64
                }
            }
        };
    };
    wo.Widgets.arc = function () {
        return {
            sg: "path",
            update: function (center, radius, angle) {
                var pend = polarToCartesian(center[0], center[1], radius, angle);
                var pstart = [center[0] + radius, center[1]];
                var d = ["M" + pstart[0], pstart[1], "A" + radius, radius, "0 1 0", pend[0], pend[1]];
                this.setAttributeNS(null, "d", d.join(" "));
            }
        };
    };
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = angleInDegrees * Math.PI / 180.0;
        var x = centerX + radius * Math.cos(angleInRadians);
        var y = centerY + radius * Math.sin(angleInRadians);
        return [x, y];
    }
})(wo || (wo = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy93by90ZXN0cy90ZXN0LnRzIiwic3JjL3dvL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHMiLCJzcmMvd28vZm91bmRhdGlvbi9kZXZpY2UudHMiLCJzcmMvd28vZm91bmRhdGlvbi9lbGVtZW50cy50cyIsInNyYy93by9mb3VuZGF0aW9uL3N0cmluZy50cyIsInNyYy93by9idWlsZGVyL3VzZS50cyIsInNyYy93by9idWlsZGVyL2RvbWNyZWF0b3IudHMiLCJzcmMvd28vYnVpbGRlci9zdmdjcmVhdG9yLnRzIiwic3JjL3dvL2J1aWxkZXIvdWljcmVhdG9yLnRzIiwic3JjL2ZpbmdlcnMvcGF0dGVybnMudHMiLCJzcmMvZmluZ2Vycy9yZWNvZ25pemVyLnRzIiwic3JjL2ZpbmdlcnMvdG91Y2gudHMiLCJzcmMvZmluZ2Vycy96b29tZXIudHMiLCJzcmMvZmluZ2Vycy9maW5nZXIudHMiLCJzcmMvd28vd28udHMiLCJzcmMvd28vd2lkZ2V0cy9jb3Zlci9jb3Zlci50cyIsInNyYy93by93aWRnZXRzL2NhcmQvY2FyZC50cyIsInNyYy93by93aWRnZXRzL2xvYWRpbmcvbG9hZGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtRUFBbUU7QUFFbkUsSUFBSSxJQUFJLEdBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQ2dDdEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxJQUFRO0lBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzFCLENBQUMsQ0FBQTtBQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsU0FBa0I7SUFDbkQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNwQixHQUFHLENBQUEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVB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RSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBLENBQUM7d0JBQ2hCLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBQ3BCLElBQUksTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNoRSxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDOUQsSUFBSSxLQUFLLEdBQUcsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUMsQ0FBQzt3QkFFNUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQzdCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUU5QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDNUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBRTNCLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzt3QkFDdEQsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FB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QUFHLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hELENBQUM7U0FDSixDQUFDO0lBQ04sQ0FBQyxDQUFDO0lBQ0YsMEJBQTBCLE9BQWMsRUFBRSxPQUFjLEVBQUUsTUFBYSxFQUFFLGNBQXFCO1FBQzFGLElBQUksY0FBYyxHQUFHLGNBQWMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUN0RCxJQUFJLENBQUMsR0FBRyxPQUFPLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLEdBQUcsT0FBTyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixDQUFDO0FBQ0wsQ0FBQyxFQXJEUyxFQUFFLEtBQUYsRUFBRSxRQXFEWCIsImZpbGUiOiJ3by5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2dsb2JhbHMvanF1ZXJ5L2luZGV4LmQudHNcIiAvPlxyXG5cclxubGV0IHRlc3Q6YW55PSQoXCJkaXZcIik7IiwiaW50ZXJmYWNlIFdpbmRvd3tcclxuXHRvcHI6YW55O1xyXG5cdG9wZXJhOmFueTtcclxuXHRjaHJvbWU6YW55O1xyXG5cdFN0eWxlTWVkaWE6YW55O1xyXG5cdEluc3RhbGxUcmlnZ2VyOmFueTtcclxuXHRDU1M6YW55O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRG9jdW1lbnR7XHJcblx0ZG9jdW1lbnRNb2RlOmFueTtcclxufVxyXG5cclxuLy8gRWxlbWVudC50c1xyXG5pbnRlcmZhY2UgRWxlbWVudHtcclxuXHRbbmFtZTpzdHJpbmddOmFueTtcclxuXHRhc3R5bGUoc3R5bGVzOnN0cmluZ1tdKTpzdHJpbmc7XHJcblx0ZGVzdHJveVN0YXR1czphbnk7XHJcblx0ZGlzcG9zZSgpOmFueTtcclxufVxyXG5cclxuaW50ZXJmYWNlIE5vZGV7XHJcblx0Y3Vyc29yOmFueTtcclxufVxyXG5cclxuaW50ZXJmYWNlIFN0cmluZ3tcclxuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XHJcbn1cclxuXHJcbmludGVyZmFjZSBBcnJheTxUPntcclxuXHRhZGQoaXRlbTpUKTp2b2lkO1xyXG5cdGNsZWFyKGRlbD86Ym9vbGVhbik6dm9pZDtcclxufVxyXG5cclxuQXJyYXkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChpdGVtOmFueSkge1xyXG5cdHRoaXNbdGhpcy5sZW5ndGhdID0gaXRlbTtcclxufVxyXG5cclxuQXJyYXkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKGtlZXBhbGl2ZT86Ym9vbGVhbikge1xyXG5cdGxldCBuID0gdGhpcy5sZW5ndGg7XHJcblx0Zm9yKGxldCBpID0gbiAtIDE7IGkgPj0gMDsgaS0tKXtcclxuXHRcdC8vZGVsZXRlIHRoaXNbaV07XHJcblx0XHRsZXQgdG1wID0gdGhpcy5wb3AoKTtcclxuXHRcdHRtcCA9IG51bGw7XHJcblx0fVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy50c1wiIC8+XHJcbmNsYXNzIE1vYmlsZURldmljZXtcclxuXHRzdGF0aWMgZ2V0IEFuZHJvaWQgKCk6Ym9vbGVhbiB7XHJcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0FuZHJvaWQvaSk7XHJcblx0XHRpZiAocikge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHIhPSBudWxsICYmIHIubGVuZ3RoPjA7XHJcblx0fVxyXG5cdHN0YXRpYyBnZXQgQmxhY2tCZXJyeSgpOmJvb2xlYW4ge1xyXG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9CbGFja0JlcnJ5L2kpO1xyXG5cdFx0aWYgKHIpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByIT1udWxsICYmIHIubGVuZ3RoID4gMDtcclxuXHR9XHJcblx0c3RhdGljIGdldCBpT1MoKTpib29sZWFuIHtcclxuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVBob25lfGlQYWR8aVBvZC9pKTtcclxuXHRcdGlmIChyKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gciAhPSBudWxsICYmIHIubGVuZ3RoID4gMDtcclxuXHR9XHJcblx0c3RhdGljIGdldCBPcGVyYSgpOmJvb2xlYW4ge1xyXG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9PcGVyYSBNaW5pL2kpO1xyXG5cdFx0aWYgKHIpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByICE9IG51bGwgJiYgci5sZW5ndGggPiAwO1xyXG5cdH1cclxuXHRzdGF0aWMgZ2V0IFdpbmRvd3MoKTpib29sZWFuIHtcclxuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvSUVNb2JpbGUvaSk7XHJcblx0XHRpZiAocikge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHIhPSBudWxsICYmIHIubGVuZ3RoID4wO1xyXG5cdH1cclxuXHRzdGF0aWMgZ2V0IGFueSgpOmJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIChNb2JpbGVEZXZpY2UuQW5kcm9pZCB8fCBNb2JpbGVEZXZpY2UuQmxhY2tCZXJyeSB8fCBNb2JpbGVEZXZpY2UuaU9TIHx8IE1vYmlsZURldmljZS5PcGVyYSB8fCBNb2JpbGVEZXZpY2UuV2luZG93cyk7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBCcm93c2Vye1xyXG5cdC8vIE9wZXJhIDguMCtcclxuXHRzdGF0aWMgZ2V0IGlzT3BlcmEoKTpib29sZWFue1xyXG5cdFx0cmV0dXJuICghIXdpbmRvdy5vcHIgJiYgISF3aW5kb3cub3ByLmFkZG9ucykgfHwgISF3aW5kb3cub3BlcmEgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgT1BSLycpID49IDA7XHJcblx0fVxyXG5cdFxyXG5cdC8vIEZpcmVmb3ggMS4wK1xyXG5cdHN0YXRpYyBnZXQgaXNGaXJlZm94KCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiB0eXBlb2Ygd2luZG93Lkluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJztcclxuXHR9XHJcblx0Ly8gQXQgbGVhc3QgU2FmYXJpIDMrOiBcIltvYmplY3QgSFRNTEVsZW1lbnRDb25zdHJ1Y3Rvcl1cIlxyXG5cdHN0YXRpYyBnZXQgaXNTYWZhcmkoKTpib29sZWFue1xyXG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChIVE1MRWxlbWVudCkuaW5kZXhPZignQ29uc3RydWN0b3InKSA+IDA7XHJcblx0fSBcclxuXHQvLyBJbnRlcm5ldCBFeHBsb3JlciA2LTExXHJcblx0c3RhdGljIGdldCBpc0lFKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiAvKkBjY19vbiFAKi9mYWxzZSB8fCAhIWRvY3VtZW50LmRvY3VtZW50TW9kZTtcclxuXHR9XHJcblx0Ly8gRWRnZSAyMCtcclxuXHRzdGF0aWMgZ2V0IGlzRWRnZSgpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gIUJyb3dzZXIuaXNJRSAmJiAhIXdpbmRvdy5TdHlsZU1lZGlhO1xyXG5cdH1cclxuXHQvLyBDaHJvbWUgMStcclxuXHRzdGF0aWMgZ2V0IGlzQ2hyb21lKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiAhIXdpbmRvdy5jaHJvbWUgJiYgISF3aW5kb3cuY2hyb21lLndlYnN0b3JlO1xyXG5cdH1cclxuXHQvLyBCbGluayBlbmdpbmUgZGV0ZWN0aW9uXHJcblx0c3RhdGljIGdldCBpc0JsaW5rKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiAoQnJvd3Nlci5pc0Nocm9tZSB8fCBCcm93c2VyLmlzT3BlcmEpICYmICEhd2luZG93LkNTUztcclxuXHR9XHJcbn1cclxuXHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy50c1wiIC8+XHJcblxyXG5FbGVtZW50LnByb3RvdHlwZS5hc3R5bGUgPSBmdW5jdGlvbiBhY3R1YWxTdHlsZShwcm9wczpzdHJpbmdbXSkge1xyXG5cdGxldCBlbDpFbGVtZW50ID0gdGhpcztcclxuXHRsZXQgY29tcFN0eWxlOkNTU1N0eWxlRGVjbGFyYXRpb24gPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCk7XHJcblx0Zm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdGxldCBzdHlsZTpzdHJpbmcgPSBjb21wU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wc1tpXSk7XHJcblx0XHRpZiAoc3R5bGUgIT0gbnVsbCkge1xyXG5cdFx0XHRyZXR1cm4gc3R5bGU7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5cclxubmFtZXNwYWNlIHdve1xyXG5cdGNsYXNzIERlc3Ryb3llcntcclxuXHRcdGRpc3Bvc2luZzpib29sZWFuO1xyXG5cdFx0ZGVzdHJveWluZzpib29sZWFuO1xyXG5cdFx0c3RhdGljIGNvbnRhaW5lcjpIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblx0XHRzdGF0aWMgZGVzdHJveSh0YXJnZXQ6RWxlbWVudCl7XHJcblx0XHRcdGlmICghdGFyZ2V0LmRlc3Ryb3lTdGF0dXMpe1xyXG5cdFx0XHRcdHRhcmdldC5kZXN0cm95U3RhdHVzID0gbmV3IERlc3Ryb3llcigpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh0YXJnZXQuZGlzcG9zZSAmJiAhdGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGlzcG9zaW5nKXtcclxuXHRcdFx0XHR0YXJnZXQuZGVzdHJveVN0YXR1cy5kaXNwb3NpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdHRhcmdldC5kaXNwb3NlKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCF0YXJnZXQuZGVzdHJveVN0YXR1cy5kZXN0cm95aW5nKXtcclxuXHRcdFx0XHR0YXJnZXQuZGVzdHJveVN0YXR1cy5kZXN0cm95aW5nID0gdHJ1ZTtcclxuXHRcdFx0XHREZXN0cm95ZXIuY29udGFpbmVyLmFwcGVuZENoaWxkKHRhcmdldCk7XHJcblx0XHRcdFx0Zm9yKGxldCBpIGluIHRhcmdldCl7XHJcblx0XHRcdFx0XHRpZiAoaS5pbmRleE9mKCckJykgPT0gMCl7XHJcblx0XHRcdFx0XHRcdGxldCB0bXA6YW55ID0gdGFyZ2V0W2ldO1xyXG5cdFx0XHRcdFx0XHRpZiAodG1wIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xyXG5cdFx0XHRcdFx0XHRcdHRhcmdldFtpXSA9IG51bGw7XHJcblx0XHRcdFx0XHRcdFx0dG1wID0gbnVsbDtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIHRhcmdldFtpXTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHREZXN0cm95ZXIuY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRleHBvcnQgZnVuY3Rpb24gZGVzdHJveSh0YXJnZXQ6YW55KTp2b2lke1xyXG5cdFx0aWYgKHRhcmdldC5sZW5ndGggPiAwIHx8IHRhcmdldCBpbnN0YW5jZW9mIEFycmF5KXtcclxuXHRcdFx0Zm9yKGxldCBpIG9mIHRhcmdldCl7XHJcblx0XHRcdFx0RGVzdHJveWVyLmRlc3Ryb3koaSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCl7XHJcblx0XHRcdFx0RGVzdHJveWVyLmRlc3Ryb3kodGFyZ2V0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGV4cG9ydCBmdW5jdGlvbiBjZW50ZXJTY3JlZW4odGFyZ2V0OmFueSl7XHJcblx0XHRsZXQgcmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHRcdHRhcmdldC5zdHlsZS5wb3NpdGlvbiA9IFwiZml4ZWRcIjtcclxuXHRcdHRhcmdldC5zdHlsZS5sZWZ0ID0gXCI1MCVcIjtcclxuXHRcdHRhcmdldC5zdHlsZS50b3AgPSBcIjUwJVwiO1xyXG5cdFx0dGFyZ2V0LnN0eWxlLm1hcmdpblRvcCA9IC1yZWN0LmhlaWdodCAvIDIgKyBcInB4XCI7XHJcblx0XHR0YXJnZXQuc3R5bGUubWFyZ2luTGVmdCA9IC1yZWN0LndpZHRoIC8gMiArIFwicHhcIjtcclxuXHR9XHJcbn0iLCJpbnRlcmZhY2UgU3RyaW5ne1xyXG5cdHN0YXJ0c1dpdGgoc3RyOnN0cmluZyk6Ym9vbGVhbjtcclxuXHRmb3JtYXQoLi4ucmVzdEFyZ3M6YW55W10pOnN0cmluZztcclxufVxyXG5cclxuU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoID0gZnVuY3Rpb24oc3RyOnN0cmluZyk6Ym9vbGVhbntcclxuXHRyZXR1cm4gdGhpcy5pbmRleE9mKHN0cik9PTA7XHJcbn1cclxuU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XHJcblx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XHJcblx0dmFyIHMgPSB0aGlzO1xyXG5cdGlmICghYXJncyB8fCBhcmdzLmxlbmd0aCA8IDEpIHtcclxuXHRcdHJldHVybiBzO1xyXG5cdH1cclxuXHR2YXIgciA9IHM7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHR2YXIgcmVnID0gbmV3IFJlZ0V4cCgnXFxcXHsnICsgaSArICdcXFxcfScpO1xyXG5cdFx0ciA9IHIucmVwbGFjZShyZWcsIGFyZ3NbaV0pO1xyXG5cdH1cclxuXHRyZXR1cm4gcjtcclxufTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZm91bmRhdGlvbi9zdHJpbmcudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgLy8vIENvbnRhaW5zIGNyZWF0b3IgaW5zdGFuY2Ugb2JqZWN0XHJcbiAgICBleHBvcnQgbGV0IENyZWF0b3JzOkNyZWF0b3JbXSA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldChzZWxlY3RvcjphbnkpOmFueXtcclxuICAgICAgICBsZXQgcmx0OmFueSA9IFtdO1xyXG4gICAgICAgIGlmIChzZWxlY3Rvcil7XHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgIHJsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDdXJzb3J7XHJcbiAgICAgICAgcGFyZW50OmFueTtcclxuICAgICAgICBib3JkZXI6YW55O1xyXG4gICAgICAgIHJvb3Q6YW55O1xyXG4gICAgICAgIGN1cnQ6YW55O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDcmVhdG9ye1xyXG4gICAgICAgIGlkOnN0cmluZztcclxuICAgICAgICBnZXQgSWQoKTpzdHJpbmd7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBDcmVhdGUoanNvbjphbnksIGNzPzpDdXJzb3IpOmFueXtcclxuICAgICAgICAgICAgaWYgKCFqc29uKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBvID0gdGhpcy5jcmVhdGUoanNvbik7XHJcbiAgICAgICAgICAgIGlmICghY3Mpe1xyXG4gICAgICAgICAgICAgICAgY3MgPSBuZXcgQ3Vyc29yKCk7XHJcbiAgICAgICAgICAgICAgICBjcy5yb290ID0gbztcclxuICAgICAgICAgICAgICAgIGNzLnBhcmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBjcy5ib3JkZXIgPSBvO1xyXG4gICAgICAgICAgICAgICAgY3MuY3VydCA9IG87XHJcbiAgICAgICAgICAgICAgICBvLmN1cnNvciA9IGNzO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGxldCBuY3MgPSBuZXcgQ3Vyc29yKCk7XHJcbiAgICAgICAgICAgICAgICBuY3Mucm9vdCA9IGNzLnJvb3Q7XHJcbiAgICAgICAgICAgICAgICBuY3MucGFyZW50ID0gY3MuY3VydDtcclxuICAgICAgICAgICAgICAgIG5jcy5ib3JkZXIgPSBjcy5ib3JkZXI7XHJcbiAgICAgICAgICAgICAgICBuY3MuY3VydCA9IG87XHJcbiAgICAgICAgICAgICAgICBvLmN1cnNvciA9IG5jcztcclxuICAgICAgICAgICAgICAgIGNzID0gbmNzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChqc29uLmFsaWFzKXtcclxuICAgICAgICAgICAgICAgIGxldCBuID0ganNvbi5hbGlhcztcclxuICAgICAgICAgICAgICAgIGlmIChqc29uLmFsaWFzLnN0YXJ0c1dpdGgoXCIkXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICBuID0ganNvbi5hbGlhcy5zdWJzdHIoMSwganNvbi5hbGlhcy5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY3MuYm9yZGVyLCBuKTtcclxuICAgICAgICAgICAgICAgIGNzLmJvcmRlcltcIiRcIiArIG5dID0gbztcclxuICAgICAgICAgICAgICAgIGlmIChqc29uLmFsaWFzLnN0YXJ0c1dpdGgoXCIkXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICBjcy5ib3JkZXIgPSBvO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkZWxldGUganNvblt0aGlzLklkXTtcclxuICAgICAgICAgICAgdGhpcy5leHRlbmQobywganNvbik7XHJcbiAgICAgICAgICAgIGlmIChqc29uLm1hZGUpe1xyXG4gICAgICAgICAgICAgICAganNvbi5tYWRlLmNhbGwobyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgby4kcm9vdCA9IGNzLnJvb3Q7XHJcbiAgICAgICAgICAgIG8uJGJvcmRlciA9IGNzLmJvcmRlcjtcclxuICAgICAgICAgICAgcmV0dXJuIG87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGUoanNvbjphbnkpOmFueTtcclxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gYXBwZW5kKGVsOmFueSwgY2hpbGQ6YW55KXtcclxuICAgICAgICBpZiAoZWwuYXBwZW5kICYmIHR5cGVvZihlbC5hcHBlbmQpID09ICdmdW5jdGlvbicpe1xyXG4gICAgICAgICAgICBlbC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBlbC5hcHBlbmRDaGlsZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1c2UoanNvbjphbnksIGNzPzpDdXJzb3IpOmFueXtcclxuICAgICAgICBsZXQgcmx0OmFueSA9IG51bGw7XHJcbiAgICAgICAgaWYgKCFqc29uKXtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbnRhaW5lcjphbnkgPSBudWxsO1xyXG4gICAgICAgIGlmIChqc29uLiRjb250YWluZXIkKXtcclxuICAgICAgICAgICAgY29udGFpbmVyID0ganNvbi4kY29udGFpbmVyJDtcclxuICAgICAgICAgICAgZGVsZXRlIGpzb24uJGNvbnRhaW5lciQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgKGpzb24pID09ICdzdHJpbmcnKXtcclxuICAgICAgICAgICAgcmx0ID0gZ2V0KGpzb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yKHZhciBpIG9mIENyZWF0b3JzKXtcclxuICAgICAgICAgICAgaWYgKGpzb25baS5JZF0pe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gaS5DcmVhdGUoanNvbiwgY3MpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbnRhaW5lcil7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChybHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBvYmpleHRlbmQobzphbnksIGpzb246YW55KXtcclxuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XHJcbiAgICAgICAgICAgIGlmIChvW2ldICYmIHR5cGVvZihvW2ldKSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICBvYmpleHRlbmQob1tpXSwganNvbltpXSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgb1tpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi91c2UudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgZXhwb3J0IGNsYXNzIERvbUNyZWF0b3IgZXh0ZW5kcyBDcmVhdG9ye1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBcInRhZ1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XHJcbiAgICAgICAgICAgIGlmIChqc29uID09IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHRhZyA9IGpzb25bdGhpcy5pZF07XHJcbiAgICAgICAgICAgIGxldCBlbDpOb2RlO1xyXG4gICAgICAgICAgICBpZiAodGFnID09ICcjdGV4dCcpe1xyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0YWcpO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyBcclxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcclxuICAgICAgICAgICAgICAgIGRvbWV4dGVuZChvLCBqc29uKTtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKGpzb24uJCAmJiBvIGluc3RhbmNlb2YgTm9kZSl7XHJcbiAgICAgICAgICAgICAgICBvLm5vZGVWYWx1ZSA9IGpzb24uJDtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcclxuICAgICAgICAgICAgICAgIG8uZXh0ZW5kKGpzb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvbWV4dGVuZChlbDphbnksIGpzb246YW55KXtcclxuICAgICAgICBsZXQgY3MgPSBlbC5jdXJzb3I7XHJcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xyXG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGVsW2ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2dHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2dHlwZSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWV4dGVuZCh0YXJnZXQsIGpzb25baV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcIiRcIil7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25baV0gaW5zdGFuY2VvZiBBcnJheSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBqIG9mIGpzb25baV0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoaiwgY3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqc29uW2ldLCBjcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VsLmFwcGVuZENoaWxkKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcclxuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKXtcclxuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxbaV0gJiYgdHlwZW9mKGVsW2ldKSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShpLCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi91c2UudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgZXhwb3J0IGNsYXNzIFN2Z0NyZWF0b3IgZXh0ZW5kcyBDcmVhdG9ye1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBcInNnXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNyZWF0ZShqc29uOmFueSk6Tm9kZXtcclxuICAgICAgICAgICAgaWYgKGpzb24gPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgdGFnID0ganNvblt0aGlzLmlkXTtcclxuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XHJcbiAgICAgICAgICAgIGlmICh0YWcgPT0gXCJzdmdcIil7XHJcbiAgICAgICAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIHRhZyk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCB0YWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvIGluc3RhbmNlb2YgU1ZHRWxlbWVudCl7XHJcbiAgICAgICAgICAgICAgICBzdmdleHRlbmQobywganNvbik7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xyXG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChvLmV4dGVuZCl7XHJcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdmdleHRlbmQoZWw6YW55LCBqc29uOmFueSl7XHJcbiAgICAgICAgbGV0IGNzID0gZWwuY3Vyc29yO1xyXG4gICAgICAgIGZvcihsZXQgaSBpbiBqc29uKXtcclxuICAgICAgICAgICAgaWYgKGkuc3RhcnRzV2l0aChcIiQkXCIpKXtcclxuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBlbFtpXTtcclxuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIHRhcmdldDtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodnR5cGUgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdmdleHRlbmQodGFyZ2V0LCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWVsc2UgaWYgKGkgPT0gXCIkXCIpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICAgICAgICAgIGlmIChqc29uW2ldIGluc3RhbmNlb2YgQXJyYXkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaiBvZiBqc29uW2ldKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGosIGNzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2VsLmFwcGVuZENoaWxkKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoanNvbltpXSwgY3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaS5zdGFydHNXaXRoKFwiJFwiKSl7XHJcbiAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IFwiZnVuY3Rpb25cIil7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsW2ldICYmIHR5cGVvZihlbFtpXSkgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpleHRlbmQoZWxbaV0sIGpzb25baV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhudWxsLCBpLCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi91c2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9kb21jcmVhdG9yLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSB3b3tcclxuICAgIGV4cG9ydCBsZXQgV2lkZ2V0czphbnkgPSB7fTtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVWlDcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcclxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmlkID0gXCJ1aVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XHJcbiAgICAgICAgICAgIGlmIChqc29uID09IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHdnID0ganNvblt0aGlzLmlkXTtcclxuICAgICAgICAgICAgaWYgKCFXaWRnZXRzW3dnXSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGVsOk5vZGUgPSB1c2UoV2lkZ2V0c1t3Z10oKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xyXG4gICAgICAgICAgICAgICAgZG9tYXBwbHkobywganNvbik7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xyXG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChvLmV4dGVuZCl7XHJcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZG9tYXBwbHkoZWw6YW55LCBqc29uOmFueSl7XHJcbiAgICAgICAgbGV0IGNzID0gZWwuY3Vyc29yO1xyXG4gICAgICAgIGZvcihsZXQgaSBpbiBqc29uKXtcclxuICAgICAgICAgICAgaWYgKGkuc3RhcnRzV2l0aChcIiQkXCIpKXtcclxuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBlbFtpXTtcclxuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIHRhcmdldDtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodnR5cGUgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21hcHBseSh0YXJnZXQsIGpzb25baV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcIiRcIil7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IGppID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICBqaSA9IFtqaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChqaSBpbnN0YW5jZW9mIEFycmF5KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZXMgPSBlbC5jaGlsZE5vZGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGo8amkubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGppW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaiA8IG5vZGVzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21hcHBseShub2Rlc1tqXSwgaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGl0ZW0sIGNzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaS5zdGFydHNXaXRoKFwiJFwiKSl7XHJcbiAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwic3R5bGVcIil7XHJcbiAgICAgICAgICAgICAgICBvYmpleHRlbmQoZWxbaV0sIGpzb25baV0pO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGpzb25baV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbFtpXSAmJiB0eXBlb2YoZWxbaV0pID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZXh0ZW5kKGVsW2ldLCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGksIGpzb25baV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIlxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFuO1xyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTphbnk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBQYXR0ZXJuczphbnkgPSB7fTtcclxuICAgIFxyXG4gICAgY2xhc3MgVG91Y2hlZFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAxICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2hlbmRcIiAmJiBxdWV1ZS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLCBvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgcHJldiA9IHF1ZXVlWzFdO1xyXG4gICAgICAgICAgICAvL2RlYnVnZ2VyO1xyXG4gICAgICAgICAgICBpZiAocHJldiAmJiBwcmV2Lmxlbmd0aCA9PSAxKXtcclxuICAgICAgICAgICAgICAgIGxldCBhY3QgPSBwcmV2WzBdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRyYWcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmIChvdXRxICE9IG51bGwgJiYgb3V0cS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFjdDphbnkgPSBvdXRxWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWN0ICYmIChwYWN0LmFjdCA9PSBcImRyYWdnaW5nXCIgfHwgcGFjdC5hY3QgPT0gXCJkcmFnc3RhcnRcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRyYWcpeyBcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaTwzOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocVswXS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJ0b3VjaGVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBEcmFnZ2luZ1BhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSBcclxuICAgICAgICAgICAgICAgICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2htb3ZlXCIgXHJcbiAgICAgICAgICAgICAgICAmJiBxdWV1ZS5sZW5ndGggPiAyO1xyXG4gICAgICAgICAgICBpZiAocmx0KXtcclxuICAgICAgICAgICAgICAgIHJsdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgbGV0IHMxID0gcXVldWVbMl07XHJcbiAgICAgICAgICAgICAgICBsZXQgczIgPSBxdWV1ZVsxXTtcclxuICAgICAgICAgICAgICAgIGlmIChzMS5sZW5ndGggPT0gMSAmJiBzMi5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGExID0gczFbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGEyID0gczJbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGExLmFjdCA9PSBcInRvdWNoc3RhcnRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhMS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIgJiYgYTIuYWN0ID09IFwidG91Y2htb3ZlXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBybHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmIChhMS5hY3QgPT0gXCJ0b3VjaG1vdmVcIiAmJiBhMi5hY3QgPT0gXCJ0b3VjaG1vdmVcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCBwcmV2ID0gcXVldWVbMl07XHJcbiAgICAgICAgICAgIGlmIChwcmV2Lmxlbmd0aCA9PSAxKXtcclxuICAgICAgICAgICAgICAgIGxldCBhY3QgPSBwcmV2WzBdO1xyXG4gICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGFjdC5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdDpcImRyYWdzdGFydFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmIChhY3QuYWN0ID09IFwidG91Y2htb3ZlXCIgJiYgb3V0cS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmFjdCA9IG91dHFbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhY3QuYWN0ID09IFwiZHJhZ3N0YXJ0XCIgfHwgcmFjdC5hY3QgPT0gXCJkcmFnZ2luZ1wiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdDpcImRyYWdnaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgRHJvcFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAxICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2hlbmRcIiAmJiBxdWV1ZS5sZW5ndGggPiAwICYmIG91dHEubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSxvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICAvL2xldCBwcmV2ID0gcXVldWVbMV07XHJcbiAgICAgICAgICAgIGxldCBhY3QgPSBvdXRxWzBdO1xyXG4gICAgICAgICAgICBpZiAoYWN0LmFjdCA9PSBcImRyYWdnaW5nXCIgfHwgYWN0LmFjdCA9PSBcImRyYWdzdGFydFwiKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0OlwiZHJvcHBlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgRGJsVG91Y2hlZFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNoZW5kXCIgJiYgcXVldWUubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IHByZXYgPSBxdWV1ZVsxXTtcclxuICAgICAgICAgICAgaWYgKHByZXYgJiYgcHJldi5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0ID0gcHJldlswXTtcclxuICAgICAgICAgICAgICAgIGlmIChvdXRxICE9IG51bGwgJiYgb3V0cS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFjdDphbnkgPSBvdXRxWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWN0ICYmIHBhY3QuYWN0ID09IFwidG91Y2hlZFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjdC5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIgfHwgYWN0LmFjdCA9PSBcInRvdWNobW92ZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhY3QudGltZSAtIHBhY3QudGltZSA8IDUwMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0OlwiZGJsdG91Y2hlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdDpcInRvdWNoZWRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGNBbmdsZShhOmlhY3QsIGI6aWFjdCwgbGVuOm51bWJlcik6bnVtYmVye1xyXG4gICAgICAgIGxldCBhZyA9IE1hdGguYWNvcygoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKS9sZW4pIC8gTWF0aC5QSSAqIDE4MDtcclxuICAgICAgICBpZiAoYi5jcG9zWzFdIDwgYS5jcG9zWzFdKXtcclxuICAgICAgICAgICAgYWcqPS0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYWc7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgWm9vbVN0YXJ0UGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDIgXHJcbiAgICAgICAgICAgICAgICAmJiAoKGFjdHNbMF0uYWN0ID09IFwidG91Y2hzdGFydFwiIHx8IGFjdHNbMV0uYWN0ID09IFwidG91Y2hzdGFydFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIHx8KG91dHEubGVuZ3RoID4gMCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgYWN0c1swXS5hY3QgPT0gXCJ0b3VjaG1vdmVcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgYWN0c1sxXS5hY3QgPT0gXCJ0b3VjaG1vdmVcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgb3V0cVswXS5hY3QgIT0gXCJ6b29taW5nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIG91dHFbMF0uYWN0ICE9IFwiem9vbXN0YXJ0XCIgKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCBhY3RzID0gcXVldWVbMF07XHJcbiAgICAgICAgICAgIGxldCBhOmlhY3QgPSBhY3RzWzBdO1xyXG4gICAgICAgICAgICBsZXQgYjppYWN0ID0gYWN0c1sxXTtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IE1hdGguc3FydCgoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKSooYi5jcG9zWzBdIC0gYS5jcG9zWzBdKSArIChiLmNwb3NbMV0gLSBhLmNwb3NbMV0pKihiLmNwb3NbMV0gLSBhLmNwb3NbMV0pKTtcclxuICAgICAgICAgICAgbGV0IG93aWR0aCA9IE1hdGguYWJzKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSk7XHJcbiAgICAgICAgICAgIGxldCBvaGVpZ2h0ID0gTWF0aC5hYnMoYi5jcG9zWzFdIC0gYS5jcG9zWzFdKTtcclxuICAgICAgICAgICAgbGV0IGFnID0gY2FsY0FuZ2xlKGEsIGIsIGxlbik7IC8vTWF0aC5hY29zKChiLmNwb3NbMF0gLSBhLmNwb3NbMF0pL2xlbikgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgICAgICAgICBsZXQgcjppYWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgYWN0Olwiem9vbXN0YXJ0XCIsXHJcbiAgICAgICAgICAgICAgICBjcG9zOlsoYS5jcG9zWzBdICsgYi5jcG9zWzBdKS8yLCAoYS5jcG9zWzFdICsgYi5jcG9zWzFdKS8yXSxcclxuICAgICAgICAgICAgICAgIGxlbjpsZW4sXHJcbiAgICAgICAgICAgICAgICBhbmdsZTphZyxcclxuICAgICAgICAgICAgICAgIG93aWR0aDpvd2lkdGgsXHJcbiAgICAgICAgICAgICAgICBvaGVpZ2h0Om9oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB0aW1lOmEudGltZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgWm9vbVBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAyIFxyXG4gICAgICAgICAgICAgICAgJiYgKGFjdHNbMF0uYWN0ICE9IFwidG91Y2hlbmRcIiAmJiBhY3RzWzFdLmFjdCAhPSBcInRvdWNoZW5kXCIpXHJcbiAgICAgICAgICAgICAgICAmJiAoYWN0c1swXS5hY3QgPT0gXCJ0b3VjaG1vdmVcIiB8fCBhY3RzWzFdLmFjdCA9PSBcInRvdWNobW92ZVwiKVxyXG4gICAgICAgICAgICAgICAgJiYgb3V0cS5sZW5ndGggPiAwXHJcbiAgICAgICAgICAgICAgICAmJiAob3V0cVswXS5hY3QgPT0gXCJ6b29tc3RhcnRcIiB8fCBvdXRxWzBdLmFjdCA9PSBcInpvb21pbmdcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCBhY3RzID0gcXVldWVbMF07XHJcbiAgICAgICAgICAgIGxldCBhOmlhY3QgPSBhY3RzWzBdO1xyXG4gICAgICAgICAgICBsZXQgYjppYWN0ID0gYWN0c1sxXTtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IE1hdGguc3FydCgoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKSooYi5jcG9zWzBdIC0gYS5jcG9zWzBdKSArIChiLmNwb3NbMV0gLSBhLmNwb3NbMV0pKihiLmNwb3NbMV0gLSBhLmNwb3NbMV0pKTtcclxuICAgICAgICAgICAgbGV0IGFnID0gY2FsY0FuZ2xlKGEsIGIsIGxlbik7IC8vTWF0aC5hY29zKChiLmNwb3NbMF0gLSBhLmNwb3NbMF0pL2xlbikgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgICAgICAgICBsZXQgb3dpZHRoID0gTWF0aC5hYnMoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKTtcclxuICAgICAgICAgICAgbGV0IG9oZWlnaHQgPSBNYXRoLmFicyhiLmNwb3NbMV0gLSBhLmNwb3NbMV0pO1xyXG4gICAgICAgICAgICBsZXQgcjppYWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgYWN0Olwiem9vbWluZ1wiLFxyXG4gICAgICAgICAgICAgICAgY3BvczpbKGEuY3Bvc1swXSArIGIuY3Bvc1swXSkvMiwgKGEuY3Bvc1sxXSArIGIuY3Bvc1sxXSkvMl0sXHJcbiAgICAgICAgICAgICAgICBsZW46bGVuLFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6YWcsXHJcbiAgICAgICAgICAgICAgICBvd2lkdGg6b3dpZHRoLFxyXG4gICAgICAgICAgICAgICAgb2hlaWdodDpvaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgdGltZTphLnRpbWVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFpvb21FbmRQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gb3V0cS5sZW5ndGggPiAwIFxyXG4gICAgICAgICAgICAgICAgJiYgKG91dHFbMF0uYWN0ID09IFwiem9vbXN0YXJ0XCIgfHwgb3V0cVswXS5hY3QgPT0gXCJ6b29taW5nXCIpXHJcbiAgICAgICAgICAgICAgICAmJiBhY3RzLmxlbmd0aCA8PTI7XHJcbiAgICAgICAgICAgIGlmIChybHQpe1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmRpcihhY3RzKTtcclxuICAgICAgICAgICAgICAgIGlmIChhY3RzLmxlbmd0aCA8IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpIG9mIGFjdHMpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaS5hY3QgPT0gXCJ0b3VjaGVuZFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IHI6aWFjdCA9IHtcclxuICAgICAgICAgICAgICAgIGFjdDpcInpvb21lbmRcIixcclxuICAgICAgICAgICAgICAgIGNwb3M6WzAsIDBdLFxyXG4gICAgICAgICAgICAgICAgbGVuOjAsXHJcbiAgICAgICAgICAgICAgICBhbmdsZTowLFxyXG4gICAgICAgICAgICAgICAgb3dpZHRoOjAsXHJcbiAgICAgICAgICAgICAgICBvaGVpZ2h0OjAsXHJcbiAgICAgICAgICAgICAgICB0aW1lOm5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgUGF0dGVybnMuem9vbWVuZCA9IG5ldyBab29tRW5kUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMuem9vbWluZyA9IG5ldyBab29tUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMuem9vbXN0YXJ0ID0gbmV3IFpvb21TdGFydFBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLmRyYWdnaW5nID0gbmV3IERyYWdnaW5nUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMuZHJvcHBlZCA9IG5ldyBEcm9wUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMudG91Y2hlZCA9IG5ldyBUb3VjaGVkUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMuZGJsdG91Y2hlZCA9IG5ldyBEYmxUb3VjaGVkUGF0dGVybigpO1xyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi93by9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGF0dGVybnMudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIGZpbmdlcnN7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIGlhY3R7XHJcbiAgICAgICAgYWN0OnN0cmluZyxcclxuICAgICAgICBjcG9zOm51bWJlcltdLFxyXG4gICAgICAgIHJwb3M/Om51bWJlcltdLFxyXG4gICAgICAgIG9oZWlnaHQ/Om51bWJlcixcclxuICAgICAgICBvd2lkdGg/Om51bWJlcixcclxuICAgICAgICBsZW4/Om51bWJlcixcclxuICAgICAgICBhbmdsZT86bnVtYmVyLFxyXG4gICAgICAgIHRpbWU/Om51bWJlclxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZWNvZ25pemVye1xyXG4gICAgICAgIGlucXVldWU6YW55W10gPSBbXTtcclxuICAgICAgICBvdXRxdWV1ZTppYWN0W10gPSBbXTtcclxuICAgICAgICBwYXR0ZXJuczppcGF0dGVybltdID0gW107XHJcbiAgICAgICAgY2ZnOmFueTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoY2ZnOmFueSl7XHJcbiAgICAgICAgICAgIGxldCBkZWZwYXR0ZXJucyA9IFtcInpvb21lbmRcIiwgXCJ6b29tc3RhcnRcIiwgXCJ6b29taW5nXCIsIFwiZGJsdG91Y2hlZFwiLCBcInRvdWNoZWRcIiwgXCJkcm9wcGVkXCIsIFwiZHJhZ2dpbmdcIl07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWNmZyl7XHJcbiAgICAgICAgICAgICAgICBjZmcgPSB7cGF0dGVybnM6ZGVmcGF0dGVybnN9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIWNmZy5wYXR0ZXJucyl7XHJcbiAgICAgICAgICAgICAgICBjZmcucGF0dGVybnMgPSBkZWZwYXR0ZXJucztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jZmcgPSBjZmc7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaSBvZiBjZmcucGF0dGVybnMpe1xyXG4gICAgICAgICAgICAgICAgaWYgKFBhdHRlcm5zW2ldKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdHRlcm5zLmFkZChQYXR0ZXJuc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYXJzZShhY3RzOmlhY3RbXSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNmZy5xbGVuKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2ZnLnFsZW4gPSAxMjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pbnF1ZXVlLnNwbGljZSgwLCAwLCBhY3RzKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaW5xdWV1ZS5sZW5ndGggPiB0aGlzLmNmZy5xbGVuKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5xdWV1ZS5zcGxpY2UodGhpcy5pbnF1ZXVlLmxlbmd0aCAtIDEsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoYWN0cy5sZW5ndGggPT0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNoc3RhcnRcIiAmJiB0aGlzLmNmZy5vbiAmJiB0aGlzLmNmZy5vbi50YXApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZmcub24udGFwKGFjdHNbMF0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IHBhdHRlcm4gb2YgdGhpcy5wYXR0ZXJucyl7XHJcbiAgICAgICAgICAgICAgICBpZiAocGF0dGVybi52ZXJpZnkoYWN0cywgdGhpcy5pbnF1ZXVlLCB0aGlzLm91dHF1ZXVlKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJsdCA9IHBhdHRlcm4ucmVjb2duaXplKHRoaXMuaW5xdWV1ZSwgdGhpcy5vdXRxdWV1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJsdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3V0cXVldWUuc3BsaWNlKDAsIDAsIHJsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm91dHF1ZXVlLmxlbmd0aCA+IHRoaXMuY2ZnLnFsZW4pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vdXRxdWV1ZS5zcGxpY2UodGhpcy5vdXRxdWV1ZS5sZW5ndGggLSAxLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcSA9IHRoaXMuaW5xdWV1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnF1ZXVlID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHEuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2ZnLm9uICYmIHRoaXMuY2ZnLm9uW3JsdC5hY3RdKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2ZnLm9uW3JsdC5hY3RdKHJsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2ZnLm9ucmVjb2duaXplZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNmZy5vbnJlY29nbml6ZWQocmx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicmVjb2duaXplci50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGxldCBpbml0ZWQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBjbGFzcyB6b29tc2lte1xyXG4gICAgICAgIG9wcG86aWFjdDtcclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlKGFjdDppYWN0KTp2b2lke1xyXG4gICAgICAgICAgICBsZXQgbSA9IFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgvMiwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodC8yXTtcclxuICAgICAgICAgICAgdGhpcy5vcHBvID0ge2FjdDphY3QuYWN0LCBjcG9zOlsyKm1bMF0gLSBhY3QuY3Bvc1swXSwgMiptWzFdIC0gYWN0LmNwb3NbMV1dLCB0aW1lOmFjdC50aW1lfTtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhY3QuY3Bvc1sxXSwgbVsxXSwgdGhpcy5vcHBvLmNwb3NbMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdGFydChhY3Q6aWFjdCk6aWFjdFtde1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZShhY3QpO1xyXG4gICAgICAgICAgICByZXR1cm4gW2FjdCwgdGhpcy5vcHBvXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgem9vbShhY3Q6aWFjdCk6aWFjdFtde1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZShhY3QpO1xyXG4gICAgICAgICAgICByZXR1cm4gW2FjdCwgdGhpcy5vcHBvXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW5kKGFjdDppYWN0KTppYWN0W117XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKGFjdCk7XHJcbiAgICAgICAgICAgIHJldHVybiBbYWN0LCB0aGlzLm9wcG9dO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3Mgb2Zmc2V0c2ltIGV4dGVuZHMgem9vbXNpbXtcclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlKGFjdDppYWN0KTp2b2lke1xyXG4gICAgICAgICAgICB0aGlzLm9wcG8gPSB7YWN0OmFjdC5hY3QsIGNwb3M6W2FjdC5jcG9zWzBdICsgMTAwLCBhY3QuY3Bvc1sxXSArIDEwMF0sIHRpbWU6YWN0LnRpbWV9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgenM6em9vbXNpbSA9IG51bGw7XHJcbiAgICBsZXQgb3M6b2Zmc2V0c2ltID0gbnVsbDtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRvdWNoZXMoZXZlbnQ6YW55LCBpc2VuZD86Ym9vbGVhbik6YW55e1xyXG4gICAgICAgIGlmIChpc2VuZCl7XHJcbiAgICAgICAgICAgIHJldHVybiBldmVudC5jaGFuZ2VkVG91Y2hlcztcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50LnRvdWNoZXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0b3VjaChjZmc6YW55KTphbnl7XHJcbiAgICAgICAgbGV0IHJnOlJlY29nbml6ZXIgPSBuZXcgUmVjb2duaXplcihjZmcpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVBY3QobmFtZTpzdHJpbmcsIHg6bnVtYmVyLCB5Om51bWJlcik6aWFjdHtcclxuICAgICAgICAgICAgcmV0dXJuIHthY3Q6bmFtZSwgY3BvczpbeCwgeV0sIHRpbWU6bmV3IERhdGUoKS5nZXRUaW1lKCl9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlKGNmZzphbnksIGFjdHM6aWFjdFtdKTp2b2lke1xyXG4gICAgICAgICAgICBpZiAoIWNmZyB8fCAhY2ZnLmVuYWJsZWQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjZmcub25hY3Qpe1xyXG4gICAgICAgICAgICAgICAgY2ZnLm9uYWN0KHJnLmlucXVldWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJnLnBhcnNlKGFjdHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFpbml0ZWQpe1xyXG4gICAgICAgICAgICBkb2N1bWVudC5vbmNvbnRleHRtZW51ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICghTW9iaWxlRGV2aWNlLmFueSl7XHJcbiAgICAgICAgICAgICAgICB6cyA9IG5ldyB6b29tc2ltKCk7XHJcbiAgICAgICAgICAgICAgICBvcyA9IG5ldyBvZmZzZXRzaW0oKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNoc3RhcnRcIiwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PSAwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3Muc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgb3Mub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB6cy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCB6cy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdDppYWN0ID0gY3JlYXRlQWN0KFwidG91Y2htb3ZlXCIsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5idXR0b24gPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3RdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9zLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIG9zLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgenMuc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgenMub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaGVuZFwiLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCBvcy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpzLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIHpzLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdHM6aWFjdFtdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdWNoZXMgPSBnZXRvdWNoZXMoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpPHRvdWNoZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaHN0YXJ0XCIsIGl0ZW0uY2xpZW50WCwgaXRlbS5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0cy5hZGQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgYWN0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RzOmlhY3RbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3VjaGVzID0gZ2V0b3VjaGVzKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaG1vdmVcIiwgaXRlbS5jbGllbnRYLCBpdGVtLmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RzLmFkZChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBhY3RzKTtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQnJvd3Nlci5pc1NhZmFyaSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RzOmlhY3RbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3VjaGVzID0gZ2V0b3VjaGVzKGV2ZW50LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaGVuZFwiLCBpdGVtLmNsaWVudFgsIGl0ZW0uY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHMuYWRkKGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIGFjdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluaXRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjZmc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNpbXVsYXRlKGVsZW1lbnQ6YW55LCBldmVudE5hbWU6c3RyaW5nLCBwb3M6YW55KSB7XHJcblx0ZnVuY3Rpb24gZXh0ZW5kKGRlc3RpbmF0aW9uOmFueSwgc291cmNlOmFueSkge1xyXG5cdFx0Zm9yICh2YXIgcHJvcGVydHkgaW4gc291cmNlKVxyXG5cdFx0XHRkZXN0aW5hdGlvbltwcm9wZXJ0eV0gPSBzb3VyY2VbcHJvcGVydHldO1xyXG5cdFx0cmV0dXJuIGRlc3RpbmF0aW9uO1xyXG5cdH1cclxuXHJcblx0bGV0IGV2ZW50TWF0Y2hlcnM6YW55ID0ge1xyXG5cdFx0J0hUTUxFdmVudHMnOiAvXig/OmxvYWR8dW5sb2FkfGFib3J0fGVycm9yfHNlbGVjdHxjaGFuZ2V8c3VibWl0fHJlc2V0fGZvY3VzfGJsdXJ8cmVzaXplfHNjcm9sbCkkLyxcclxuXHRcdCdNb3VzZUV2ZW50cyc6IC9eKD86Y2xpY2t8ZGJsY2xpY2t8bW91c2UoPzpkb3dufHVwfG92ZXJ8bW92ZXxvdXQpKSQvXHJcblx0fVxyXG5cclxuXHRsZXQgZGVmYXVsdE9wdGlvbnMgPSB7XHJcblx0XHRwb2ludGVyWDogMTAwLFxyXG5cdFx0cG9pbnRlclk6IDEwMCxcclxuXHRcdGJ1dHRvbjogMCxcclxuXHRcdGN0cmxLZXk6IGZhbHNlLFxyXG5cdFx0YWx0S2V5OiBmYWxzZSxcclxuXHRcdHNoaWZ0S2V5OiBmYWxzZSxcclxuXHRcdG1ldGFLZXk6IGZhbHNlLFxyXG5cdFx0YnViYmxlczogdHJ1ZSxcclxuXHRcdGNhbmNlbGFibGU6IHRydWVcclxuXHR9XHJcblx0aWYgKHBvcykge1xyXG5cdFx0ZGVmYXVsdE9wdGlvbnMucG9pbnRlclggPSBwb3NbMF07XHJcblx0XHRkZWZhdWx0T3B0aW9ucy5wb2ludGVyWSA9IHBvc1sxXTtcclxuXHR9XHJcblx0bGV0IG9wdGlvbnMgPSBleHRlbmQoZGVmYXVsdE9wdGlvbnMsIGFyZ3VtZW50c1szXSB8fCB7fSk7XHJcblx0bGV0IG9FdmVudDphbnksIGV2ZW50VHlwZTphbnkgPSBudWxsO1xyXG5cclxuXHRmb3IgKGxldCBuYW1lIGluIGV2ZW50TWF0Y2hlcnMpIHtcclxuXHRcdGlmIChldmVudE1hdGNoZXJzW25hbWVdLnRlc3QoZXZlbnROYW1lKSkgeyBldmVudFR5cGUgPSBuYW1lOyBicmVhazsgfVxyXG5cdH1cclxuXHJcblx0aWYgKCFldmVudFR5cGUpXHJcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ09ubHkgSFRNTEV2ZW50cyBhbmQgTW91c2VFdmVudHMgaW50ZXJmYWNlcyBhcmUgc3VwcG9ydGVkJyk7XHJcblxyXG5cdGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCkge1xyXG5cdFx0b0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoZXZlbnRUeXBlKTtcclxuXHRcdGlmIChldmVudFR5cGUgPT0gJ0hUTUxFdmVudHMnKSB7XHJcblx0XHRcdG9FdmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCBvcHRpb25zLmJ1YmJsZXMsIG9wdGlvbnMuY2FuY2VsYWJsZSk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0b0V2ZW50LmluaXRNb3VzZUV2ZW50KGV2ZW50TmFtZSwgb3B0aW9ucy5idWJibGVzLCBvcHRpb25zLmNhbmNlbGFibGUsIGRvY3VtZW50LmRlZmF1bHRWaWV3LFxyXG4gICAgICAgICAgICBvcHRpb25zLmJ1dHRvbiwgb3B0aW9ucy5wb2ludGVyWCwgb3B0aW9ucy5wb2ludGVyWSwgb3B0aW9ucy5wb2ludGVyWCwgb3B0aW9ucy5wb2ludGVyWSxcclxuICAgICAgICAgICAgb3B0aW9ucy5jdHJsS2V5LCBvcHRpb25zLmFsdEtleSwgb3B0aW9ucy5zaGlmdEtleSwgb3B0aW9ucy5tZXRhS2V5LCBvcHRpb25zLmJ1dHRvbiwgZWxlbWVudCk7XHJcblx0XHR9XHJcblx0XHRlbGVtZW50LmRpc3BhdGNoRXZlbnQob0V2ZW50KTtcclxuXHR9XHJcblx0ZWxzZSB7XHJcblx0XHRvcHRpb25zLmNsaWVudFggPSBvcHRpb25zLnBvaW50ZXJYO1xyXG5cdFx0b3B0aW9ucy5jbGllbnRZID0gb3B0aW9ucy5wb2ludGVyWTtcclxuXHRcdHZhciBldnQgPSAoZG9jdW1lbnQgYXMgYW55KS5jcmVhdGVFdmVudE9iamVjdCgpO1xyXG5cdFx0b0V2ZW50ID0gZXh0ZW5kKGV2dCwgb3B0aW9ucyk7XHJcblx0XHRlbGVtZW50LmZpcmVFdmVudCgnb24nICsgZXZlbnROYW1lLCBvRXZlbnQpO1xyXG5cdH1cclxuXHRyZXR1cm4gZWxlbWVudDtcclxufVxyXG5cclxubGV0IHRvdWNoID0gZmluZ2Vycy50b3VjaDsiLCJcclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInJlY29nbml6ZXIudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIGZpbmdlcnN7XHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgWm9vbWVye1xyXG4gICAgICAgIHByb3RlY3RlZCBzYWN0OmlhY3Q7XHJcbiAgICAgICAgcHJvdGVjdGVkIHBhY3Q6aWFjdDtcclxuICAgICAgICBwcm90ZWN0ZWQgc3RhcnRlZDpib29sZWFuO1xyXG4gICAgICAgIG1hcHBpbmc6e307XHJcbiAgICAgICAgY29uc3RydWN0b3IoZWw6YW55KXtcclxuICAgICAgICAgICAgZWwuJHpvb21lciQgPSB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBab29tIGV4dGVuZHMgWm9vbWVye1xyXG4gICAgICAgIGRlbHRhOmFueTtcclxuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xyXG4gICAgICAgICAgICBzdXBlcihlbCk7XHJcbiAgICAgICAgICAgIGxldCB6b29tZXIgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLm1hcHBpbmcgPSB7XHJcbiAgICAgICAgICAgICAgICB6b29tc3RhcnQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnNhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSwgem9vbWluZzpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoem9vbWVyLnN0YXJ0ZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcCA9IHpvb21lci5zYWN0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gW2FjdC5jcG9zWzBdIC0gcC5jcG9zWzBdLCBhY3QuY3Bvc1sxXSAtIHAuY3Bvc1sxXV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3QgPSBhY3QuYW5nbGUgLSBwLmFuZ2xlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2NhbGUgPSBhY3QubGVuIC8gcC5sZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWx0YSA9IHtvZmZzZXQ6IG9mZnNldCwgYW5nbGU6cm90LCBzY2FsZTpzY2FsZX07IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tZXIucGFjdCA9IGFjdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kaXIoZGVsdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHpvb21lbmQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGNsYXNzIFpzaXplIGV4dGVuZHMgWm9vbWVye1xyXG4gICAgICAgIGRlbHRhOmFueTtcclxuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xyXG4gICAgICAgICAgICBzdXBlcihlbCk7XHJcbiAgICAgICAgICAgIGxldCB6b29tZXIgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLm1hcHBpbmcgPSB7XHJcbiAgICAgICAgICAgICAgICB6b29tc3RhcnQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnNhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSx6b29taW5nOmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh6b29tZXIuc3RhcnRlZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwID0gem9vbWVyLnBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBbYWN0LmNwb3NbMF0gLSBwLmNwb3NbMF0sIGFjdC5jcG9zWzFdIC0gcC5jcG9zWzFdXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlc2l6ZSA9IFthY3Qub3dpZHRoIC0gcC5vd2lkdGgsIGFjdC5vaGVpZ2h0IC0gcC5vaGVpZ2h0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbHRhID0ge29mZnNldDogb2Zmc2V0LCByZXNpemU6cmVzaXplfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3ID0gZWwuYXN0eWxlKFtcIndpZHRoXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGggPSBlbC5hc3R5bGUoW1wiaGVpZ2h0XCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsID0gZWwuYXN0eWxlKFtcImxlZnRcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdCA9IGVsLmFzdHlsZShbXCJ0b3BcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUud2lkdGggPSBwYXJzZUludCh3KSArIGRlbHRhLnJlc2l6ZVswXSArIFwicHhcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUuaGVpZ2h0ID0gcGFyc2VJbnQoaCkgKyBkZWx0YS5yZXNpemVbMV0gKyBcInB4XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gcGFyc2VJbnQobCkgKyBkZWx0YS5vZmZzZXRbMF0gKyBcInB4XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHBhcnNlSW50KHQpICsgZGVsdGEub2Zmc2V0WzFdICsgXCJweFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRlbHRhLnJlc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSx6b29tZW5kOmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInRvdWNoLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInpvb21lci50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGZ1bmN0aW9uIGVsQXRQb3MocG9zOm51bWJlcltdKTphbnl7XHJcbiAgICAgICAgbGV0IHJsdDphbnkgPSBudWxsO1xyXG4gICAgICAgIGxldCBjYWNoZTphbnlbXSA9IFtdO1xyXG4gICAgICAgIHdoaWxlKHRydWUpe1xyXG4gICAgICAgICAgICBsZXQgZWw6YW55ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChwb3NbMF0sIHBvc1sxXSk7XHJcbiAgICAgICAgICAgIGlmIChlbCA9PSBkb2N1bWVudC5ib2R5IHx8IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcImh0bWxcIiB8fCBlbCA9PSB3aW5kb3cpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoZWwuJGV2dHJhcCQpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoZWwuJHRvdWNoYWJsZSQpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gZWwuZ2V0YXJnZXQ/ZWwuZ2V0YXJnZXQoKTplbFxyXG4gICAgICAgICAgICAgICAgcmx0LiR0b3VjaGVsJCA9IGVsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgY2FjaGUuYWRkKGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IobGV0IGkgb2YgY2FjaGUpe1xyXG4gICAgICAgICAgICBpLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBhY3RpdmVFbDphbnk7XHJcbiAgICBsZXQgY2ZnID0gdG91Y2goe1xyXG4gICAgICAgIG9uOnsgXHJcbiAgICAgICAgICAgIHRhcDpmdW5jdGlvbihhY3Q6aWFjdCl7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVFbCA9IGVsQXRQb3MoYWN0LmNwb3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxvbmFjdDpmdW5jdGlvbihpbnE6YW55KXtcclxuICAgICAgICB9LG9ucmVjb2duaXplZDpmdW5jdGlvbihhY3Q6aWFjdCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVjb2duaXplZDpcIiwgYWN0LmFjdCk7XHJcbiAgICAgICAgICAgIGlmIChhY3RpdmVFbCAmJiBhY3RpdmVFbC4kem9vbWVyJCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgem0gPSBhY3RpdmVFbC4kem9vbWVyJDtcclxuICAgICAgICAgICAgICAgIGlmICh6bS5tYXBwaW5nW2FjdC5hY3RdKXtcclxuICAgICAgICAgICAgICAgICAgICB6bS5tYXBwaW5nW2FjdC5hY3RdKGFjdCwgYWN0aXZlRWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjZmcuZW5hYmxlZCA9IHRydWU7XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZpbmdlcihlbDphbnkpOmFueXtcclxuICAgICAgICBlbC4kdG91Y2hhYmxlJCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgem9vbWFibGU6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGxldCB6b29tZXIgPSBuZXcgWm9vbShlbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSx6c2l6YWJsZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHpzaXplID0gbmV3IFpzaXplKGVsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxubGV0IGZpbmdlciA9IGZpbmdlcnMuZmluZ2VyOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWlsZGVyL3VzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvZG9tY3JlYXRvci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvc3ZnY3JlYXRvci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cclxuXHJcbndvLkNyZWF0b3JzLmFkZChuZXcgd28uRG9tQ3JlYXRvcigpKTtcclxud28uQ3JlYXRvcnMuYWRkKG5ldyB3by5TdmdDcmVhdG9yKCkpO1xyXG53by5DcmVhdG9ycy5hZGQobmV3IHdvLlVpQ3JlYXRvcigpKTtcclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2ZvdW5kYXRpb24vZWxlbWVudHMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgV2lkZ2V0cy5jb3ZlciA9IGZ1bmN0aW9uKCk6YW55e1xyXG4gICAgICAgIHJldHVybntcclxuICAgICAgICAgICAgdGFnOlwiZGl2XCIsXHJcbiAgICAgICAgICAgIGNsYXNzOlwiY292ZXJcIixcclxuICAgICAgICAgICAgc3R5bGU6e2Rpc3BsYXk6J25vbmUnfSxcclxuICAgICAgICAgICAgc2hvdzpmdW5jdGlvbihjYWxsYmFjazphbnkpOnZvaWR7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRjaGlsZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kY2hpbGQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spe1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LGhpZGU6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRjaGlsZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgd28uZGVzdHJveSh0aGlzLiRjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuJGNoaWxkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25oaWRlKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LG1hZGU6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3YgPSAoZG9jdW1lbnQuYm9keSBhcyBhbnkpLiRnY3YkO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN2KXtcclxuICAgICAgICAgICAgICAgICAgICB3by5kZXN0cm95KGN2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAoZG9jdW1lbnQuYm9keSBhcyBhbnkpLiRnY3YkID0gdGhpcztcclxuICAgICAgICAgICAgfSxvbmNsaWNrOmZ1bmN0aW9uKGV2ZW50OmFueSl7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kJHRvdWNoY2xvc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LGFwcGVuZDpmdW5jdGlvbihjaGlsZDphbnkpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kY2hpbGQgPSBjaGlsZDtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTsgXHJcbiAgICB9IFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNvdmVyKGpzb246YW55KTphbnl7XHJcbiAgICAgICAgbGV0IGN2ID0gd28udXNlKHtcclxuICAgICAgICAgICAgdWk6J2NvdmVyJyxcclxuICAgICAgICAgICAgJCR0b3VjaGNsb3NlOnRydWUsXHJcbiAgICAgICAgICAgICQ6anNvblxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGN2LnNob3coZnVuY3Rpb24oZWw6YW55KXtcclxuICAgICAgICAgICAgd28uY2VudGVyU2NyZWVuKGVsLiRib3ggfHwgZWwuJGNoaWxkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjdi5vbmhpZGUgPSBqc29uLm9uaGlkZTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9mb3VuZGF0aW9uL2VsZW1lbnRzLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSB3b3tcclxuICAgIFdpZGdldHMuY2FyZCA9IGZ1bmN0aW9uKCk6YW55e1xyXG4gICAgICAgIHJldHVybiAge1xyXG4gICAgICAgICAgICB0YWc6XCJkaXZcIixcclxuICAgICAgICAgICAgY2xhc3M6XCJjYXJkXCIsXHJcbiAgICAgICAgICAgIHNldHZhbDogZnVuY3Rpb24odmFsOmFueSk6dm9pZHtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSBpbiB2YWwpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2ID0gdmFsW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ID0gdGhpc1tcIiRcIiArIGldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAodikgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2Lm1vZGUgfHwgKHYubW9kZSA9PSBcInByZXBlbmRcIiAmJiB0LmNoaWxkTm9kZXMubGVuZ3RoIDwgMSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYubW9kZSA9IFwiYXBwZW5kXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodi5tb2RlID09IFwicmVwbGFjZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdi5tb2RlID0gXCJhcHBlbmRcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2Lm1vZGUgPT0gXCJwcmVwZW5kXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuaW5zZXJ0QmVmb3JlKHYudGFyZ2V0LCB0LmNoaWxkTm9kZXNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5hcHBlbmRDaGlsZCh2LnRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodCkudGV4dCh2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJDpbXHJcbiAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwidGl0bGVcIiwgJDpbXHJcbiAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcInR4dFwiLCBhbGlhczpcInRpdGxlXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJjdHJsc1wiLCAkOltcclxuICAgICAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcIndidG5cIiwgb25jbGljazogZnVuY3Rpb24oZXZlbnQ6YW55KXt3by5kZXN0cm95KHRoaXMuJGJvcmRlcik7fSwgJDpcIlhcIn1cclxuICAgICAgICAgICAgICAgICAgICBdfVxyXG4gICAgICAgICAgICAgICAgXX0sXHJcbiAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwiYm9keVwiLCBhbGlhczpcImJvZHlcIn1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZm91bmRhdGlvbi9lbGVtZW50cy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9idWlsZGVyL3VpY3JlYXRvci50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2Ugd297XHJcbiAgICBXaWRnZXRzLmxvYWRpbmcgPSBmdW5jdGlvbigpOmFueXtcclxuICAgICAgICByZXR1cm57XHJcbiAgICAgICAgICAgIHRhZzpcImRpdlwiLFxyXG4gICAgICAgICAgICBjbGFzczpcImxvYWRpbmdcIixcclxuICAgICAgICAgICAgbWFkZTogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGxldCBwMSA9IHdvLnVzZSh7dWk6XCJhcmNcIn0pO1xyXG4gICAgICAgICAgICAgICAgcDEuc2V0QXR0cmlidXRlTlMobnVsbCwgXCJjbGFzc1wiLCBcImFyYyBwMVwiKTtcclxuICAgICAgICAgICAgICAgIHAxLnVwZGF0ZShbMTYsIDQ4XSwgMTYsIDI3MCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzYm94LmFwcGVuZENoaWxkKHAxKTsgICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHAyID0gd28udXNlKHt1aTpcImFyY1wifSk7XHJcbiAgICAgICAgICAgICAgICBwMi5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcImNsYXNzXCIsIFwiYXJjIHAxXCIpO1xyXG4gICAgICAgICAgICAgICAgcDIudXBkYXRlKFsxNiwgNDhdLCAxNiwgMjcwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNib3guYXBwZW5kQ2hpbGQocDIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vJGVsZW1lbnQudmVsb2NpdHkoeyBvcGFjaXR5OiAxIH0sIHsgZHVyYXRpb246IDEwMDAgfSk7XHJcbiAgICAgICAgICAgICAgICBwMS5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBcIjMycHggMzJweFwiO1xyXG4gICAgICAgICAgICAgICAgcDIuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gXCI1MCUgNTAlXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHQxID0gMjAwMCwgdDI9MTQwMDtcclxuICAgICAgICAgICAgICAgICgkKHAxKSBhcyBhbnkpLnZlbG9jaXR5KHtyb3RhdGVaOlwiLT0zNjBkZWdcIn0sIHtkdXJhdGlvbjp0MSwgZWFzaW5nOlwibGluZWFyXCJ9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGhhbmRsZTEgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKCQocDEpIGFzIGFueSkudmVsb2NpdHkoe3JvdGF0ZVo6XCItPTM2MGRlZ1wifSwge2R1cmF0aW9uOnQxLCBlYXNpbmc6XCJsaW5lYXJcIn0pO1xyXG4gICAgICAgICAgICAgICAgfSwgdDEpO1xyXG4gICAgICAgICAgICAgICAgKCQocDIpIGFzIGFueSkudmVsb2NpdHkoe3JvdGF0ZVo6XCIrPTM2MGRlZ1wifSwge2R1cmF0aW9uOnQyLCBlYXNpbmc6XCJsaW5lYXJcIiwgbG9vcDp0cnVlfSk7XHJcbiAgICAgICAgICAgIH0sJDp7XHJcbiAgICAgICAgICAgICAgICBzZzpcInN2Z1wiLFxyXG4gICAgICAgICAgICAgICAgYWxpYXM6XCJzYm94XCIsXHJcbiAgICAgICAgICAgICAgICBzdHlsZTp7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6NjQsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OjY0XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9OyBcclxuICAgIH07IFxyXG4gICAgV2lkZ2V0cy5hcmMgPSBmdW5jdGlvbigpOmFueXtcclxuICAgICAgICByZXR1cm57XHJcbiAgICAgICAgICAgIHNnOlwicGF0aFwiLFxyXG4gICAgICAgICAgICB1cGRhdGU6ZnVuY3Rpb24oY2VudGVyOm51bWJlcltdLCByYWRpdXM6bnVtYmVyLCBhbmdsZTpudW1iZXIpOnZvaWR7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGVuZCA9IHBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyWzBdLCBjZW50ZXJbMV0sIHJhZGl1cywgYW5nbGUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBzdGFydCA9IFtjZW50ZXJbMF0gKyByYWRpdXMsIGNlbnRlclsxXV07XHJcbiAgICAgICAgICAgICAgICBsZXQgZCA9IFtcIk1cIiArIHBzdGFydFswXSwgcHN0YXJ0WzFdLCBcIkFcIiArIHJhZGl1cywgcmFkaXVzLCBcIjAgMSAwXCIsIHBlbmRbMF0sIHBlbmRbMV1dO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcImRcIiwgZC5qb2luKFwiIFwiKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIHBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyWDpudW1iZXIsIGNlbnRlclk6bnVtYmVyLCByYWRpdXM6bnVtYmVyLCBhbmdsZUluRGVncmVlczpudW1iZXIpIHtcclxuICAgICAgICBsZXQgYW5nbGVJblJhZGlhbnMgPSBhbmdsZUluRGVncmVlcyAqIE1hdGguUEkgLyAxODAuMDtcclxuICAgICAgICBsZXQgeCA9IGNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgICAgbGV0IHkgPSBjZW50ZXJZICsgcmFkaXVzICogTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICAgIHJldHVybiBbeCx5XTtcclxuICAgIH1cclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
