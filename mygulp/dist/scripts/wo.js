/// <reference path="../../../typings/globals/jquery/index.d.ts" />
var test = $("div");

Array.prototype.add = function (item) {
    this[this.length] = item;
};
Array.prototype.clear = function (keepalive) {
    var n = this.length;
    for (var i = n - 1; i >= 0; i--) {
        delete this[i];
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
        TouchedPattern.prototype.verify = function (acts, queue) {
            var rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0;
            return rlt;
        };
        TouchedPattern.prototype.recognize = function (queue) {
            var prev = queue[1];
            if (prev && prev.length == 1) {
                var act = prev[0];
                if (act.act == "touchstart" || act.act == "touchmove") {
                    return {
                        act: "touched",
                        cpos: [act.cpos[0], act.cpos[1]],
                        time: act.time
                    };
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
            var rlt = acts.length == 1 && acts[0].act == "touchmove" && queue.length > 1;
            // if (rlt && queue[1][0] && queue[1][0].act == "touchstart"){
            //     debugger;
            // }
            //console.log("Verify dragging ...", rlt);
            return rlt;
        };
        DraggingPattern.prototype.recognize = function (queue, outq) {
            var prev = queue[1];
            if (prev.length == 1) {
                var act = prev[0];
                console.log(act.act);
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
            //console.log("Verifying drop ...", rlt);
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
    fingers.Patterns.dragging = new DraggingPattern();
    fingers.Patterns.dropped = new DropPattern();
    fingers.Patterns.touched = new TouchedPattern();
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

/// <reference path="recognizer.ts" />
var fingers;
(function (fingers) {
    var inited = false;
    function finger(cfg) {
        var rg = new fingers.Recognizer(cfg);
        function createAct(name, x, y) {
            return { act: name, cpos: [x, y], time: new Date().getTime() };
        }
        function handle(cfg, acts) {
            if (!cfg || !cfg.enabled) {
                return;
            }
            rg.parse(acts);
            if (cfg.onact) {
                cfg.onact(rg.inqueue);
            }
        }
        if (!inited) {
            document.oncontextmenu = function () {
                return false;
            };
            document.addEventListener("mousedown", function (event) {
                var act = createAct("touchstart", event.clientX, event.clientY);
                handle(cfg, [act]);
            }, true);
            document.addEventListener("mousemove", function (event) {
                var act = createAct("touchmove", event.clientX, event.clientY);
                handle(cfg, [act]);
            }, true);
            document.addEventListener("mouseup", function (event) {
                var act = createAct("touchend", event.clientX, event.clientY);
                handle(cfg, [act]);
            }, true);
            inited = true;
        }
        return cfg;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy93by90ZXN0cy90ZXN0LnRzIiwic3JjL3dvL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHMiLCJzcmMvd28vZm91bmRhdGlvbi9kZXZpY2UudHMiLCJzcmMvd28vZm91bmRhdGlvbi9lbGVtZW50cy50cyIsInNyYy93by9mb3VuZGF0aW9uL3N0cmluZy50cyIsInNyYy93by9idWlsZGVyL3VzZS50cyIsInNyYy93by9idWlsZGVyL2RvbWNyZWF0b3IudHMiLCJzcmMvd28vYnVpbGRlci9zdmdjcmVhdG9yLnRzIiwic3JjL3dvL2J1aWxkZXIvdWljcmVhdG9yLnRzIiwic3JjL2ZpbmdlcnMvcGF0dGVybnMudHMiLCJzcmMvZmluZ2Vycy9yZWNvZ25pemVyLnRzIiwic3JjL2ZpbmdlcnMvZmluZ2VyLnRzIiwic3JjL3dvL3dvLnRzIiwic3JjL3dvL3dpZGdldHMvY292ZXIvY292ZXIudHMiLCJzcmMvd28vd2lkZ2V0cy9jYXJkL2NhcmQudHMiLCJzcmMvd28vd2lkZ2V0cy9sb2FkaW5nL2xvYWRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsbUVBQW1FO0FBRW5FLElBQUksSUFBSSxHQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUNnQ3RCLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVUsSUFBUTtJQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMxQixDQUFDLENBQUE7QUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLFNBQWtCO0lBQ25ELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDcEIsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUM7UUFDL0IsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFD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QUFjLEVBQUUsT0FBYyxFQUFFLE1BQWEsRUFBRSxjQUFxQjtRQUMxRixJQUFJLGNBQWMsR0FBRyxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDdEQsSUFBSSxDQUFDLEdBQUcsT0FBTyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsQ0FBQztBQUNMLENBQUMsRUFyRFMsRUFBRSxLQUFGLEVBQUUsUUFxRFgiLCJmaWxlIjoid28uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vdHlwaW5ncy9nbG9iYWxzL2pxdWVyeS9pbmRleC5kLnRzXCIgLz5cclxuXHJcbmxldCB0ZXN0OmFueT0kKFwiZGl2XCIpOyIsImludGVyZmFjZSBXaW5kb3d7XG5cdG9wcjphbnk7XG5cdG9wZXJhOmFueTtcblx0Y2hyb21lOmFueTtcblx0U3R5bGVNZWRpYTphbnk7XG5cdEluc3RhbGxUcmlnZ2VyOmFueTtcblx0Q1NTOmFueTtcbn1cblxuaW50ZXJmYWNlIERvY3VtZW50e1xuXHRkb2N1bWVudE1vZGU6YW55O1xufVxuXG4vLyBFbGVtZW50LnRzXG5pbnRlcmZhY2UgRWxlbWVudHtcblx0W25hbWU6c3RyaW5nXTphbnk7XG5cdGFzdHlsZShzdHlsZXM6c3RyaW5nW10pOnN0cmluZztcblx0ZGVzdHJveVN0YXR1czphbnk7XG5cdGRpc3Bvc2UoKTphbnk7XG59XG5cbmludGVyZmFjZSBOb2Rle1xuXHRjdXJzb3I6YW55O1xufVxuXG5pbnRlcmZhY2UgU3RyaW5ne1xuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XG59XG5cbmludGVyZmFjZSBBcnJheTxUPntcblx0YWRkKGl0ZW06VCk6dm9pZDtcblx0Y2xlYXIoZGVsPzpib29sZWFuKTp2b2lkO1xufVxuXG5BcnJheS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGl0ZW06YW55KSB7XG5cdHRoaXNbdGhpcy5sZW5ndGhdID0gaXRlbTtcbn1cblxuQXJyYXkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKGtlZXBhbGl2ZT86Ym9vbGVhbikge1xuXHRsZXQgbiA9IHRoaXMubGVuZ3RoO1xuXHRmb3IobGV0IGkgPSBuIC0gMTsgaSA+PSAwOyBpLS0pe1xuXHRcdGRlbGV0ZSB0aGlzW2ldO1xuXHR9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZGVmaW5pdGlvbnMudHNcIiAvPlxuY2xhc3MgTW9iaWxlRGV2aWNle1xuXHRzdGF0aWMgZ2V0IEFuZHJvaWQgKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkL2kpO1xuXHRcdGlmIChyKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gciE9IG51bGwgJiYgci5sZW5ndGg+MDtcblx0fVxuXHRzdGF0aWMgZ2V0IEJsYWNrQmVycnkoKTpib29sZWFuIHtcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0JsYWNrQmVycnkvaSk7XG5cdFx0aWYgKHIpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XG5cdFx0fVxuXHRcdHJldHVybiByIT1udWxsICYmIHIubGVuZ3RoID4gMDtcblx0fVxuXHRzdGF0aWMgZ2V0IGlPUygpOmJvb2xlYW4ge1xuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVBob25lfGlQYWR8aVBvZC9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIgIT0gbnVsbCAmJiByLmxlbmd0aCA+IDA7XG5cdH1cblx0c3RhdGljIGdldCBPcGVyYSgpOmJvb2xlYW4ge1xuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvT3BlcmEgTWluaS9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIgIT0gbnVsbCAmJiByLmxlbmd0aCA+IDA7XG5cdH1cblx0c3RhdGljIGdldCBXaW5kb3dzKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9JRU1vYmlsZS9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIhPSBudWxsICYmIHIubGVuZ3RoID4wO1xuXHR9XG5cdHN0YXRpYyBnZXQgYW55KCk6Ym9vbGVhbiB7XG5cdFx0cmV0dXJuIChNb2JpbGVEZXZpY2UuQW5kcm9pZCB8fCBNb2JpbGVEZXZpY2UuQmxhY2tCZXJyeSB8fCBNb2JpbGVEZXZpY2UuaU9TIHx8IE1vYmlsZURldmljZS5PcGVyYSB8fCBNb2JpbGVEZXZpY2UuV2luZG93cyk7XG5cdH1cbn1cblxuY2xhc3MgQnJvd3Nlcntcblx0Ly8gT3BlcmEgOC4wK1xuXHRzdGF0aWMgZ2V0IGlzT3BlcmEoKTpib29sZWFue1xuXHRcdHJldHVybiAoISF3aW5kb3cub3ByICYmICEhd2luZG93Lm9wci5hZGRvbnMpIHx8ICEhd2luZG93Lm9wZXJhIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIE9QUi8nKSA+PSAwO1xuXHR9XG5cdFxuXHQvLyBGaXJlZm94IDEuMCtcblx0c3RhdGljIGdldCBpc0ZpcmVmb3goKTpib29sZWFue1xuXHRcdHJldHVybiB0eXBlb2Ygd2luZG93Lkluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJztcblx0fVxuXHQvLyBBdCBsZWFzdCBTYWZhcmkgMys6IFwiW29iamVjdCBIVE1MRWxlbWVudENvbnN0cnVjdG9yXVwiXG5cdHN0YXRpYyBnZXQgaXNTYWZhcmkoKTpib29sZWFue1xuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoSFRNTEVsZW1lbnQpLmluZGV4T2YoJ0NvbnN0cnVjdG9yJykgPiAwO1xuXHR9IFxuXHQvLyBJbnRlcm5ldCBFeHBsb3JlciA2LTExXG5cdHN0YXRpYyBnZXQgaXNJRSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIC8qQGNjX29uIUAqL2ZhbHNlIHx8ICEhZG9jdW1lbnQuZG9jdW1lbnRNb2RlO1xuXHR9XG5cdC8vIEVkZ2UgMjArXG5cdHN0YXRpYyBnZXQgaXNFZGdlKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gIUJyb3dzZXIuaXNJRSAmJiAhIXdpbmRvdy5TdHlsZU1lZGlhO1xuXHR9XG5cdC8vIENocm9tZSAxK1xuXHRzdGF0aWMgZ2V0IGlzQ2hyb21lKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gISF3aW5kb3cuY2hyb21lICYmICEhd2luZG93LmNocm9tZS53ZWJzdG9yZTtcblx0fVxuXHQvLyBCbGluayBlbmdpbmUgZGV0ZWN0aW9uXG5cdHN0YXRpYyBnZXQgaXNCbGluaygpOmJvb2xlYW57XG5cdFx0cmV0dXJuIChCcm93c2VyLmlzQ2hyb21lIHx8IEJyb3dzZXIuaXNPcGVyYSkgJiYgISF3aW5kb3cuQ1NTO1xuXHR9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy50c1wiIC8+XG5cbkVsZW1lbnQucHJvdG90eXBlLmFzdHlsZSA9IGZ1bmN0aW9uIGFjdHVhbFN0eWxlKHByb3BzOnN0cmluZ1tdKSB7XG5cdGxldCBlbDpFbGVtZW50ID0gdGhpcztcblx0bGV0IGNvbXBTdHlsZTpDU1NTdHlsZURlY2xhcmF0aW9uID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpO1xuXHRmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuXHRcdGxldCBzdHlsZTpzdHJpbmcgPSBjb21wU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wc1tpXSk7XG5cdFx0aWYgKHN0eWxlICE9IG51bGwpIHtcblx0XHRcdHJldHVybiBzdHlsZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5uYW1lc3BhY2Ugd297XG5cdGNsYXNzIERlc3Ryb3llcntcblx0XHRkaXNwb3Npbmc6Ym9vbGVhbjtcblx0XHRkZXN0cm95aW5nOmJvb2xlYW47XG5cdFx0c3RhdGljIGNvbnRhaW5lcjpIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0c3RhdGljIGRlc3Ryb3kodGFyZ2V0OkVsZW1lbnQpe1xuXHRcdFx0aWYgKCF0YXJnZXQuZGVzdHJveVN0YXR1cyl7XG5cdFx0XHRcdHRhcmdldC5kZXN0cm95U3RhdHVzID0gbmV3IERlc3Ryb3llcigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRhcmdldC5kaXNwb3NlICYmICF0YXJnZXQuZGVzdHJveVN0YXR1cy5kaXNwb3Npbmcpe1xuXHRcdFx0XHR0YXJnZXQuZGVzdHJveVN0YXR1cy5kaXNwb3NpbmcgPSB0cnVlO1xuXHRcdFx0XHR0YXJnZXQuZGlzcG9zZSgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0YXJnZXQuZGVzdHJveVN0YXR1cy5kZXN0cm95aW5nKXtcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGVzdHJveWluZyA9IHRydWU7XG5cdFx0XHRcdERlc3Ryb3llci5jb250YWluZXIuYXBwZW5kQ2hpbGQodGFyZ2V0KTtcblx0XHRcdFx0Zm9yKGxldCBpIGluIHRhcmdldCl7XG5cdFx0XHRcdFx0aWYgKGkuaW5kZXhPZignJCcpID09IDApe1xuXHRcdFx0XHRcdFx0bGV0IHRtcDphbnkgPSB0YXJnZXRbaV07XG5cdFx0XHRcdFx0XHRpZiAodG1wIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRbaV0gPSBudWxsO1xuXHRcdFx0XHRcdFx0XHR0bXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB0YXJnZXRbaV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdERlc3Ryb3llci5jb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3kodGFyZ2V0OmFueSk6dm9pZHtcblx0XHRpZiAodGFyZ2V0Lmxlbmd0aCA+IDAgfHwgdGFyZ2V0IGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdFx0Zm9yKGxldCBpIG9mIHRhcmdldCl7XG5cdFx0XHRcdERlc3Ryb3llci5kZXN0cm95KGkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCl7XG5cdFx0XHRcdERlc3Ryb3llci5kZXN0cm95KHRhcmdldCk7XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGNlbnRlclNjcmVlbih0YXJnZXQ6YW55KXtcblx0XHRsZXQgcmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHR0YXJnZXQuc3R5bGUucG9zaXRpb24gPSBcImZpeGVkXCI7XG5cdFx0dGFyZ2V0LnN0eWxlLmxlZnQgPSBcIjUwJVwiO1xuXHRcdHRhcmdldC5zdHlsZS50b3AgPSBcIjUwJVwiO1xuXHRcdHRhcmdldC5zdHlsZS5tYXJnaW5Ub3AgPSAtcmVjdC5oZWlnaHQgLyAyICsgXCJweFwiO1xuXHRcdHRhcmdldC5zdHlsZS5tYXJnaW5MZWZ0ID0gLXJlY3Qud2lkdGggLyAyICsgXCJweFwiO1xuXHR9XG59IiwiaW50ZXJmYWNlIFN0cmluZ3tcblx0c3RhcnRzV2l0aChzdHI6c3RyaW5nKTpib29sZWFuO1xuXHRmb3JtYXQoLi4ucmVzdEFyZ3M6YW55W10pOnN0cmluZztcbn1cblxuU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoID0gZnVuY3Rpb24oc3RyOnN0cmluZyk6Ym9vbGVhbntcblx0cmV0dXJuIHRoaXMuaW5kZXhPZihzdHIpPT0wO1xufVxuU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHR2YXIgcyA9IHRoaXM7XG5cdGlmICghYXJncyB8fCBhcmdzLmxlbmd0aCA8IDEpIHtcblx0XHRyZXR1cm4gcztcblx0fVxuXHR2YXIgciA9IHM7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciByZWcgPSBuZXcgUmVnRXhwKCdcXFxceycgKyBpICsgJ1xcXFx9Jyk7XG5cdFx0ciA9IHIucmVwbGFjZShyZWcsIGFyZ3NbaV0pO1xuXHR9XG5cdHJldHVybiByO1xufTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZm91bmRhdGlvbi9zdHJpbmcudHNcIiAvPlxuXG5uYW1lc3BhY2Ugd297XG4gICAgLy8vIENvbnRhaW5zIGNyZWF0b3IgaW5zdGFuY2Ugb2JqZWN0XG4gICAgZXhwb3J0IGxldCBDcmVhdG9yczpDcmVhdG9yW10gPSBbXTtcblxuICAgIGZ1bmN0aW9uIGdldChzZWxlY3RvcjphbnkpOmFueXtcbiAgICAgICAgbGV0IHJsdDphbnkgPSBbXTtcbiAgICAgICAgaWYgKHNlbGVjdG9yKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBybHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmx0O1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBDdXJzb3J7XG4gICAgICAgIHBhcmVudDphbnk7XG4gICAgICAgIGJvcmRlcjphbnk7XG4gICAgICAgIHJvb3Q6YW55O1xuICAgICAgICBjdXJ0OmFueTtcbiAgICB9XG5cbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgQ3JlYXRvcntcbiAgICAgICAgaWQ6c3RyaW5nO1xuICAgICAgICBnZXQgSWQoKTpzdHJpbmd7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICAgICAgfVxuICAgICAgICBDcmVhdGUoanNvbjphbnksIGNzPzpDdXJzb3IpOmFueXtcbiAgICAgICAgICAgIGlmICghanNvbil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbyA9IHRoaXMuY3JlYXRlKGpzb24pO1xuICAgICAgICAgICAgaWYgKCFjcyl7XG4gICAgICAgICAgICAgICAgY3MgPSBuZXcgQ3Vyc29yKCk7XG4gICAgICAgICAgICAgICAgY3Mucm9vdCA9IG87XG4gICAgICAgICAgICAgICAgY3MucGFyZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBjcy5ib3JkZXIgPSBvO1xuICAgICAgICAgICAgICAgIGNzLmN1cnQgPSBvO1xuICAgICAgICAgICAgICAgIG8uY3Vyc29yID0gY3M7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgbmNzID0gbmV3IEN1cnNvcigpO1xuICAgICAgICAgICAgICAgIG5jcy5yb290ID0gY3Mucm9vdDtcbiAgICAgICAgICAgICAgICBuY3MucGFyZW50ID0gY3MuY3VydDtcbiAgICAgICAgICAgICAgICBuY3MuYm9yZGVyID0gY3MuYm9yZGVyO1xuICAgICAgICAgICAgICAgIG5jcy5jdXJ0ID0gbztcbiAgICAgICAgICAgICAgICBvLmN1cnNvciA9IG5jcztcbiAgICAgICAgICAgICAgICBjcyA9IG5jcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqc29uLmFsaWFzKXtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IGpzb24uYWxpYXM7XG4gICAgICAgICAgICAgICAgaWYgKGpzb24uYWxpYXMuc3RhcnRzV2l0aChcIiRcIikpe1xuICAgICAgICAgICAgICAgICAgICBuID0ganNvbi5hbGlhcy5zdWJzdHIoMSwganNvbi5hbGlhcy5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjcy5ib3JkZXIsIG4pO1xuICAgICAgICAgICAgICAgIGNzLmJvcmRlcltcIiRcIiArIG5dID0gbztcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5hbGlhcy5zdGFydHNXaXRoKFwiJFwiKSl7XG4gICAgICAgICAgICAgICAgICAgIGNzLmJvcmRlciA9IG87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkZWxldGUganNvblt0aGlzLklkXTtcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5kKG8sIGpzb24pO1xuICAgICAgICAgICAgaWYgKGpzb24ubWFkZSl7XG4gICAgICAgICAgICAgICAganNvbi5tYWRlLmNhbGwobyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvLiRyb290ID0gY3Mucm9vdDtcbiAgICAgICAgICAgIG8uJGJvcmRlciA9IGNzLmJvcmRlcjtcbiAgICAgICAgICAgIHJldHVybiBvO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGUoanNvbjphbnkpOmFueTtcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZChlbDphbnksIGNoaWxkOmFueSl7XG4gICAgICAgIGlmIChlbC5hcHBlbmQgJiYgdHlwZW9mKGVsLmFwcGVuZCkgPT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgICAgICBlbC5hcHBlbmQoY2hpbGQpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiB1c2UoanNvbjphbnksIGNzPzpDdXJzb3IpOmFueXtcbiAgICAgICAgbGV0IHJsdDphbnkgPSBudWxsO1xuICAgICAgICBpZiAoIWpzb24pe1xuICAgICAgICAgICAgcmV0dXJuIHJsdDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29udGFpbmVyOmFueSA9IG51bGw7XG4gICAgICAgIGlmIChqc29uLiRjb250YWluZXIkKXtcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGpzb24uJGNvbnRhaW5lciQ7XG4gICAgICAgICAgICBkZWxldGUganNvbi4kY29udGFpbmVyJDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIChqc29uKSA9PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICBybHQgPSBnZXQoanNvbik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IodmFyIGkgb2YgQ3JlYXRvcnMpe1xuICAgICAgICAgICAgaWYgKGpzb25baS5JZF0pe1xuICAgICAgICAgICAgICAgIHJsdCA9IGkuQ3JlYXRlKGpzb24sIGNzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udGFpbmVyKXtcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChybHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBybHQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG9iamV4dGVuZChvOmFueSwganNvbjphbnkpe1xuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XG4gICAgICAgICAgICBpZiAob1tpXSAmJiB0eXBlb2Yob1tpXSkgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIG9iamV4dGVuZChvW2ldLCBqc29uW2ldKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIG9baV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdXNlLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIGV4cG9ydCBjbGFzcyBEb21DcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmlkID0gXCJ0YWdcIjtcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0YWcgPSBqc29uW3RoaXMuaWRdO1xuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XG4gICAgICAgICAgICBpZiAodGFnID09ICcjdGV4dCcpe1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGFnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7IFxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgICAgIGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWR7XG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgZG9tZXh0ZW5kKG8sIGpzb24pO1xuICAgICAgICAgICAgfWVsc2UgaWYgKGpzb24uJCAmJiBvIGluc3RhbmNlb2YgTm9kZSl7XG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xuICAgICAgICAgICAgICAgIG8uZXh0ZW5kKGpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb21leHRlbmQoZWw6YW55LCBqc29uOmFueSl7XG4gICAgICAgIGxldCBjcyA9IGVsLmN1cnNvcjtcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xuICAgICAgICAgICAgaWYgKGkuc3RhcnRzV2l0aChcIiQkXCIpKXtcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZWxbaV07XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdGFyZ2V0O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZ0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh2dHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb21leHRlbmQodGFyZ2V0LCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwiJFwiKXtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgIGlmIChqc29uW2ldIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGogb2YganNvbltpXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoaiwgY3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoanNvbltpXSwgY3MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VsLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2UgaWYgKGkuc3RhcnRzV2l0aChcIiRcIikpe1xuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxbaV0gJiYgdHlwZW9mKGVsW2ldKSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpleHRlbmQoZWxbaV0sIGpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShpLCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3VzZS50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBleHBvcnQgY2xhc3MgU3ZnQ3JlYXRvciBleHRlbmRzIENyZWF0b3J7XG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IFwic2dcIjtcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0YWcgPSBqc29uW3RoaXMuaWRdO1xuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XG4gICAgICAgICAgICBpZiAodGFnID09IFwic3ZnXCIpe1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgdGFnKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgdGFnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgfVxuICAgICAgICBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lke1xuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobyBpbnN0YW5jZW9mIFNWR0VsZW1lbnQpe1xuICAgICAgICAgICAgICAgIHN2Z2V4dGVuZChvLCBqc29uKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN2Z2V4dGVuZChlbDphbnksIGpzb246YW55KXtcbiAgICAgICAgbGV0IGNzID0gZWwuY3Vyc29yO1xuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBlbFtpXTtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZ0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z2V4dGVuZCh0YXJnZXQsIGpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2UgaWYgKGkgPT0gXCIkXCIpe1xuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgaWYgKGpzb25baV0gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaiBvZiBqc29uW2ldKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqLCBjcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9lbC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqc29uW2ldLCBjcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9lbC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZSBpZiAoaS5zdGFydHNXaXRoKFwiJFwiKSl7XG4gICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbFtpXSAmJiB0eXBlb2YoZWxbaV0pID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMobnVsbCwgaSwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZm91bmRhdGlvbi9kZWZpbml0aW9ucy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi91c2UudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZG9tY3JlYXRvci50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBleHBvcnQgbGV0IFdpZGdldHM6YW55ID0ge307XG5cbiAgICBleHBvcnQgY2xhc3MgVWlDcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmlkID0gXCJ1aVwiO1xuICAgICAgICB9XG4gICAgICAgIGNyZWF0ZShqc29uOmFueSk6Tm9kZXtcbiAgICAgICAgICAgIGlmIChqc29uID09IG51bGwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHdnID0ganNvblt0aGlzLmlkXTtcbiAgICAgICAgICAgIGlmICghV2lkZ2V0c1t3Z10pe1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZWw6Tm9kZSA9IHVzZShXaWRnZXRzW3dnXSgpKTtcbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgfVxuICAgICAgICBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lke1xuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBkb21hcHBseShvLCBqc29uKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb21hcHBseShlbDphbnksIGpzb246YW55KXtcbiAgICAgICAgbGV0IGNzID0gZWwuY3Vyc29yO1xuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBlbFtpXTtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZ0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFwcGx5KHRhcmdldCwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcIiRcIil7XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICBsZXQgamkgPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgamkgPSBbamldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoamkgaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBub2RlcyA9IGVsLmNoaWxkTm9kZXM7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGo8amkubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBqaVtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqIDwgbm9kZXMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21hcHBseShub2Rlc1tqXSwgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoaXRlbSwgY3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaS5zdGFydHNXaXRoKFwiJFwiKSl7XG4gICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgfWVsc2UgaWYgKGkgPT0gXCJzdHlsZVwiKXtcbiAgICAgICAgICAgICAgICBvYmpleHRlbmQoZWxbaV0sIGpzb25baV0pO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbFtpXSAmJiB0eXBlb2YoZWxbaV0pID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGksIGpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSIsIlxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFuO1xyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTphbnk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBQYXR0ZXJuczphbnkgPSB7fTtcclxuICAgIFxyXG4gICAgY2xhc3MgVG91Y2hlZFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNoZW5kXCIgJiYgcXVldWUubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgcHJldiA9IHF1ZXVlWzFdO1xyXG4gICAgICAgICAgICBpZiAocHJldiAmJiBwcmV2Lmxlbmd0aCA9PSAxKXtcclxuICAgICAgICAgICAgICAgIGxldCBhY3QgPSBwcmV2WzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFjdC5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIgfHwgYWN0LmFjdCA9PSBcInRvdWNobW92ZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJ0b3VjaGVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBEcmFnZ2luZ1BhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNobW92ZVwiICYmIHF1ZXVlLmxlbmd0aCA+IDE7XHJcbiAgICAgICAgICAgIC8vIGlmIChybHQgJiYgcXVldWVbMV1bMF0gJiYgcXVldWVbMV1bMF0uYWN0ID09IFwidG91Y2hzdGFydFwiKXtcclxuICAgICAgICAgICAgLy8gICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJWZXJpZnkgZHJhZ2dpbmcgLi4uXCIsIHJsdCk7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IHByZXYgPSBxdWV1ZVsxXTtcclxuICAgICAgICAgICAgaWYgKHByZXYubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICAgICAgbGV0IGFjdCA9IHByZXZbMF07XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhY3QuYWN0KTsgXHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0LmFjdCA9PSBcInRvdWNoc3RhcnRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0OlwiZHJhZ3N0YXJ0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKGFjdC5hY3QgPT0gXCJ0b3VjaG1vdmVcIiAmJiBvdXRxLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByYWN0ID0gb3V0cVswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmFjdC5hY3QgPT0gXCJkcmFnc3RhcnRcIiB8fCByYWN0LmFjdCA9PSBcImRyYWdnaW5nXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0OlwiZHJhZ2dpbmdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBEcm9wUGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDEgJiYgYWN0c1swXS5hY3QgPT0gXCJ0b3VjaGVuZFwiICYmIHF1ZXVlLmxlbmd0aCA+IDAgJiYgb3V0cS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiVmVyaWZ5aW5nIGRyb3AgLi4uXCIsIHJsdCk7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgLy9sZXQgcHJldiA9IHF1ZXVlWzFdO1xyXG4gICAgICAgICAgICBsZXQgYWN0ID0gb3V0cVswXTtcclxuICAgICAgICAgICAgaWYgKGFjdC5hY3QgPT0gXCJkcmFnZ2luZ1wiIHx8IGFjdC5hY3QgPT0gXCJkcmFnc3RhcnRcIil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdDpcImRyb3BwZWRcIixcclxuICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgUGF0dGVybnMuZHJhZ2dpbmcgPSBuZXcgRHJhZ2dpbmdQYXR0ZXJuKCk7XHJcbiAgICBQYXR0ZXJucy5kcm9wcGVkID0gbmV3IERyb3BQYXR0ZXJuKCk7XHJcbiAgICBQYXR0ZXJucy50b3VjaGVkID0gbmV3IFRvdWNoZWRQYXR0ZXJuKCk7XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3dvL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXR0ZXJucy50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgaWFjdHtcclxuICAgICAgICBhY3Q6c3RyaW5nLFxyXG4gICAgICAgIGNwb3M6bnVtYmVyW10sXHJcbiAgICAgICAgcnBvcz86bnVtYmVyW10sXHJcbiAgICAgICAgdGltZT86bnVtYmVyXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFJlY29nbml6ZXJ7XHJcbiAgICAgICAgaW5xdWV1ZTphbnlbXSA9IFtdO1xyXG4gICAgICAgIG91dHF1ZXVlOmlhY3RbXSA9IFtdO1xyXG4gICAgICAgIHBhdHRlcm5zOmlwYXR0ZXJuW10gPSBbXTtcclxuICAgICAgICBjZmc6YW55O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihjZmc6YW55KXtcclxuICAgICAgICAgICAgbGV0IGRlZnBhdHRlcm5zID0gW1widG91Y2hlZFwiXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICghY2ZnKXtcclxuICAgICAgICAgICAgICAgIGNmZyA9IHtwYXR0ZXJuczpkZWZwYXR0ZXJuc307XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghY2ZnLnBhdHRlcm5zKXtcclxuICAgICAgICAgICAgICAgIGNmZy5wYXR0ZXJucyA9IGRlZnBhdHRlcm5zO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNmZyA9IGNmZztcclxuICAgICAgICAgICAgZm9yKGxldCBpIG9mIGNmZy5wYXR0ZXJucyl7XHJcbiAgICAgICAgICAgICAgICBpZiAoUGF0dGVybnNbaV0pe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGF0dGVybnMuYWRkKFBhdHRlcm5zW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhcnNlKGFjdHM6aWFjdFtdKTp2b2lke1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY2ZnLnFsZW4pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZmcucWxlbiA9IDEyO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlucXVldWUuc3BsaWNlKDAsIDAsIGFjdHMpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pbnF1ZXVlLmxlbmd0aCA+IHRoaXMuY2ZnLnFsZW4pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnF1ZXVlLnNwbGljZSh0aGlzLmlucXVldWUubGVuZ3RoIC0gMSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yKGxldCBwYXR0ZXJuIG9mIHRoaXMucGF0dGVybnMpe1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhdHRlcm4udmVyaWZ5KGFjdHMsIHRoaXMuaW5xdWV1ZSwgdGhpcy5vdXRxdWV1ZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBybHQgPSBwYXR0ZXJuLnJlY29nbml6ZSh0aGlzLmlucXVldWUsIHRoaXMub3V0cXVldWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChybHQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm91dHF1ZXVlLnNwbGljZSgwLCAwLCBybHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vdXRxdWV1ZS5sZW5ndGggPiB0aGlzLmNmZy5xbGVuKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3V0cXVldWUuc3BsaWNlKHRoaXMub3V0cXVldWUubGVuZ3RoIC0gMSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHEgPSB0aGlzLmlucXVldWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5xdWV1ZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxLmNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNmZy5vbnJlY29nbml6ZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZmcub25yZWNvZ25pemVkKHJsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJyZWNvZ25pemVyLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBmaW5nZXJze1xyXG4gICAgbGV0IGluaXRlZDpib29sZWFuID0gZmFsc2U7XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZmluZ2VyKGNmZzphbnkpOmFueXtcclxuICAgICAgICBsZXQgcmc6UmVjb2duaXplciA9IG5ldyBSZWNvZ25pemVyKGNmZyk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUFjdChuYW1lOnN0cmluZywgeDpudW1iZXIsIHk6bnVtYmVyKTppYWN0e1xyXG4gICAgICAgICAgICByZXR1cm4ge2FjdDpuYW1lLCBjcG9zOlt4LCB5XSwgdGltZTpuZXcgRGF0ZSgpLmdldFRpbWUoKX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZShjZmc6YW55LCBhY3RzOmlhY3RbXSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKCFjZmcgfHwgIWNmZy5lbmFibGVkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZy5wYXJzZShhY3RzKTtcclxuICAgICAgICAgICAgaWYgKGNmZy5vbmFjdCl7XHJcbiAgICAgICAgICAgICAgICBjZmcub25hY3QocmcuaW5xdWV1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaW5pdGVkKXtcclxuICAgICAgICAgICAgZG9jdW1lbnQub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaHN0YXJ0XCIsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdF0pO1xyXG4gICAgICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaG1vdmVcIiwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0XSk7XHJcbiAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaGVuZFwiLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3RdKTtcclxuICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGluaXRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjZmc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBmaW5nZXIgPSBmaW5nZXJzLmZpbmdlcjsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvdXNlLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvZG9tY3JlYXRvci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWlsZGVyL3N2Z2NyZWF0b3IudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxuXG53by5DcmVhdG9ycy5hZGQobmV3IHdvLkRvbUNyZWF0b3IoKSk7XG53by5DcmVhdG9ycy5hZGQobmV3IHdvLlN2Z0NyZWF0b3IoKSk7XG53by5DcmVhdG9ycy5hZGQobmV3IHdvLlVpQ3JlYXRvcigpKTtcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9mb3VuZGF0aW9uL2VsZW1lbnRzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9idWlsZGVyL3VpY3JlYXRvci50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBXaWRnZXRzLmNvdmVyID0gZnVuY3Rpb24oKTphbnl7XG4gICAgICAgIHJldHVybntcbiAgICAgICAgICAgIHRhZzpcImRpdlwiLFxuICAgICAgICAgICAgY2xhc3M6XCJjb3ZlclwiLFxuICAgICAgICAgICAgc3R5bGU6e2Rpc3BsYXk6J25vbmUnfSxcbiAgICAgICAgICAgIHNob3c6ZnVuY3Rpb24oY2FsbGJhY2s6YW55KTp2b2lke1xuICAgICAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRjaGlsZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGNoaWxkLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spe1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LGhpZGU6ZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kY2hpbGQpe1xuICAgICAgICAgICAgICAgICAgICB3by5kZXN0cm95KHRoaXMuJGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuJGNoaWxkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB9LG1hZGU6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbGV0IGN2ID0gKGRvY3VtZW50LmJvZHkgYXMgYW55KS4kZ2N2JDtcbiAgICAgICAgICAgICAgICBpZiAoY3Ype1xuICAgICAgICAgICAgICAgICAgICB3by5kZXN0cm95KGN2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzKTtcbiAgICAgICAgICAgICAgICAoZG9jdW1lbnQuYm9keSBhcyBhbnkpLiRnY3YkID0gdGhpcztcbiAgICAgICAgICAgIH0sb25jbGljazpmdW5jdGlvbihldmVudDphbnkpe1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiQkdG91Y2hjbG9zZSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sYXBwZW5kOmZ1bmN0aW9uKGNoaWxkOmFueSl7XG4gICAgICAgICAgICAgICAgdGhpcy4kY2hpbGQgPSBjaGlsZDtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTsgXG4gICAgfSBcbiAgICBleHBvcnQgZnVuY3Rpb24gY292ZXIoanNvbjphbnkpOmFueXtcbiAgICAgICAgbGV0IGN2ID0gd28udXNlKHtcbiAgICAgICAgICAgIHVpOidjb3ZlcicsXG4gICAgICAgICAgICAkJHRvdWNoY2xvc2U6dHJ1ZSxcbiAgICAgICAgICAgICQ6anNvblxuICAgICAgICB9KTtcbiAgICAgICAgY3Yuc2hvdyhmdW5jdGlvbihlbDphbnkpe1xuICAgICAgICAgICAgd28uY2VudGVyU2NyZWVuKGVsLiRib3ggfHwgZWwuJGNoaWxkKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9mb3VuZGF0aW9uL2VsZW1lbnRzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9idWlsZGVyL3VpY3JlYXRvci50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBXaWRnZXRzLmNhcmQgPSBmdW5jdGlvbigpOmFueXtcbiAgICAgICAgcmV0dXJuICB7XG4gICAgICAgICAgICB0YWc6XCJkaXZcIixcbiAgICAgICAgICAgIGNsYXNzOlwiY2FyZFwiLFxuICAgICAgICAgICAgc2V0dmFsOiBmdW5jdGlvbih2YWw6YW55KTp2b2lke1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaSBpbiB2YWwpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgdiA9IHZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHQgPSB0aGlzW1wiJFwiICsgaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKHYpID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXYubW9kZSB8fCAodi5tb2RlID09IFwicHJlcGVuZFwiICYmIHQuY2hpbGROb2Rlcy5sZW5ndGggPCAxKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYubW9kZSA9IFwiYXBwZW5kXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2Lm1vZGUgPT0gXCJyZXBsYWNlXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYubW9kZSA9IFwiYXBwZW5kXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2Lm1vZGUgPT0gXCJwcmVwZW5kXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0Lmluc2VydEJlZm9yZSh2LnRhcmdldCwgdC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5hcHBlbmRDaGlsZCh2LnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodCkudGV4dCh2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAkOltcbiAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwidGl0bGVcIiwgJDpbXG4gICAgICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJ0eHRcIiwgYWxpYXM6XCJ0aXRsZVwifSxcbiAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcImN0cmxzXCIsICQ6W1xuICAgICAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcIndidG5cIiwgb25jbGljazogZnVuY3Rpb24oZXZlbnQ6YW55KXt3by5kZXN0cm95KHRoaXMuJGJvcmRlcik7fSwgJDpcIlhcIn1cbiAgICAgICAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgICAgICBdfSxcbiAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwiYm9keVwiLCBhbGlhczpcImJvZHlcIn1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2ZvdW5kYXRpb24vZWxlbWVudHMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIFdpZGdldHMubG9hZGluZyA9IGZ1bmN0aW9uKCk6YW55e1xuICAgICAgICByZXR1cm57XG4gICAgICAgICAgICB0YWc6XCJkaXZcIixcbiAgICAgICAgICAgIGNsYXNzOlwibG9hZGluZ1wiLFxuICAgICAgICAgICAgbWFkZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBsZXQgcDEgPSB3by51c2Uoe3VpOlwiYXJjXCJ9KTtcbiAgICAgICAgICAgICAgICBwMS5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcImNsYXNzXCIsIFwiYXJjIHAxXCIpO1xuICAgICAgICAgICAgICAgIHAxLnVwZGF0ZShbMTYsIDQ4XSwgMTYsIDI3MCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2JveC5hcHBlbmRDaGlsZChwMSk7ICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgbGV0IHAyID0gd28udXNlKHt1aTpcImFyY1wifSk7XG4gICAgICAgICAgICAgICAgcDIuc2V0QXR0cmlidXRlTlMobnVsbCwgXCJjbGFzc1wiLCBcImFyYyBwMVwiKTtcbiAgICAgICAgICAgICAgICBwMi51cGRhdGUoWzE2LCA0OF0sIDE2LCAyNzApO1xuICAgICAgICAgICAgICAgIHRoaXMuJHNib3guYXBwZW5kQ2hpbGQocDIpO1xuXG4gICAgICAgICAgICAgICAgLy8kZWxlbWVudC52ZWxvY2l0eSh7IG9wYWNpdHk6IDEgfSwgeyBkdXJhdGlvbjogMTAwMCB9KTtcbiAgICAgICAgICAgICAgICBwMS5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBcIjMycHggMzJweFwiO1xuICAgICAgICAgICAgICAgIHAyLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IFwiNTAlIDUwJVwiO1xuXG4gICAgICAgICAgICAgICAgbGV0IHQxID0gMjAwMCwgdDI9MTQwMDtcbiAgICAgICAgICAgICAgICAoJChwMSkgYXMgYW55KS52ZWxvY2l0eSh7cm90YXRlWjpcIi09MzYwZGVnXCJ9LCB7ZHVyYXRpb246dDEsIGVhc2luZzpcImxpbmVhclwifSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kaGFuZGxlMSA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgKCQocDEpIGFzIGFueSkudmVsb2NpdHkoe3JvdGF0ZVo6XCItPTM2MGRlZ1wifSwge2R1cmF0aW9uOnQxLCBlYXNpbmc6XCJsaW5lYXJcIn0pO1xuICAgICAgICAgICAgICAgIH0sIHQxKTtcbiAgICAgICAgICAgICAgICAoJChwMikgYXMgYW55KS52ZWxvY2l0eSh7cm90YXRlWjpcIis9MzYwZGVnXCJ9LCB7ZHVyYXRpb246dDIsIGVhc2luZzpcImxpbmVhclwiLCBsb29wOnRydWV9KTtcbiAgICAgICAgICAgIH0sJDp7XG4gICAgICAgICAgICAgICAgc2c6XCJzdmdcIixcbiAgICAgICAgICAgICAgICBhbGlhczpcInNib3hcIixcbiAgICAgICAgICAgICAgICBzdHlsZTp7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOjY0LFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6NjRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07IFxuICAgIH07IFxuICAgIFdpZGdldHMuYXJjID0gZnVuY3Rpb24oKTphbnl7XG4gICAgICAgIHJldHVybntcbiAgICAgICAgICAgIHNnOlwicGF0aFwiLFxuICAgICAgICAgICAgdXBkYXRlOmZ1bmN0aW9uKGNlbnRlcjpudW1iZXJbXSwgcmFkaXVzOm51bWJlciwgYW5nbGU6bnVtYmVyKTp2b2lke1xuICAgICAgICAgICAgICAgIGxldCBwZW5kID0gcG9sYXJUb0NhcnRlc2lhbihjZW50ZXJbMF0sIGNlbnRlclsxXSwgcmFkaXVzLCBhbmdsZSk7XG4gICAgICAgICAgICAgICAgbGV0IHBzdGFydCA9IFtjZW50ZXJbMF0gKyByYWRpdXMsIGNlbnRlclsxXV07XG4gICAgICAgICAgICAgICAgbGV0IGQgPSBbXCJNXCIgKyBwc3RhcnRbMF0sIHBzdGFydFsxXSwgXCJBXCIgKyByYWRpdXMsIHJhZGl1cywgXCIwIDEgMFwiLCBwZW5kWzBdLCBwZW5kWzFdXTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZU5TKG51bGwsIFwiZFwiLCBkLmpvaW4oXCIgXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyWDpudW1iZXIsIGNlbnRlclk6bnVtYmVyLCByYWRpdXM6bnVtYmVyLCBhbmdsZUluRGVncmVlczpudW1iZXIpIHtcbiAgICAgICAgbGV0IGFuZ2xlSW5SYWRpYW5zID0gYW5nbGVJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwLjA7XG4gICAgICAgIGxldCB4ID0gY2VudGVyWCArIHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcbiAgICAgICAgbGV0IHkgPSBjZW50ZXJZICsgcmFkaXVzICogTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xuICAgICAgICByZXR1cm4gW3gseV07XG4gICAgfVxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
