var test = $("div");

Array.prototype.add = function (item) {
    this[this.length] = item;
};
Array.prototype.clear = function (keepalive) {
    var n = this.length;
    for (var i = n - 1; i >= 0; i--) {
        var tmp = this.pop();
        tmp = null;
    }
};

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
        get: function () {
            return (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isFirefox", {
        get: function () {
            return typeof window.InstallTrigger !== 'undefined';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isSafari", {
        get: function () {
            return Object.prototype.toString.call(HTMLElement).indexOf('Constructor') > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isIE", {
        get: function () {
            return false || !!document.documentMode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isEdge", {
        get: function () {
            return !Browser.isIE && !!window.StyleMedia;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isChrome", {
        get: function () {
            return !!window.chrome && !!window.chrome.webstore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Browser, "isBlink", {
        get: function () {
            return (Browser.isChrome || Browser.isOpera) && !!window.CSS;
        },
        enumerable: true,
        configurable: true
    });
    return Browser;
}());

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

var wo;
(function (wo) {
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
            var ag = Math.asin((b.cpos[1] - a.cpos[1]) / len) / Math.PI * 180;
            var r = {
                act: "zoomstart",
                cpos: [(a.cpos[0] + b.cpos[0]) / 2, (a.cpos[1] + b.cpos[1]) / 2],
                len: len,
                angle: ag,
                time: a.time
            };
            console.log(r.cpos, r.len, r.angle);
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
            var ag = Math.asin((b.cpos[1] - a.cpos[1]) / len) / Math.PI * 180;
            var r = {
                act: "zooming",
                cpos: [(a.cpos[0] + b.cpos[0]) / 2, (a.cpos[1] + b.cpos[1]) / 2],
                len: len,
                angle: ag,
                time: a.time
            };
            console.log(r.cpos, r.len, r.angle);
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

var fingers;
(function (fingers) {
    var Recognizer = (function () {
        function Recognizer(cfg) {
            this.inqueue = [];
            this.outqueue = [];
            this.patterns = [];
            var defpatterns = ["touched"];
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
    function finger(cfg) {
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
    fingers.finger = finger;
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
var finger = fingers.finger;

wo.Creators.add(new wo.DomCreator());
wo.Creators.add(new wo.SvgCreator());
wo.Creators.add(new wo.UiCreator());

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
    }
    wo.cover = cover;
})(wo || (wo = {}));

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
