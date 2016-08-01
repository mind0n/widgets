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
            if (this.cfg.on && this.cfg.on.tap) {
                for (var _i = 0, acts_1 = acts; _i < acts_1.length; _i++) {
                    var i = acts_1[_i];
                    //acts.length >= 1 && acts[0].act == "touchstart" &&
                    if (i.act == "touchstart") {
                        this.cfg.on.tap(acts[0]);
                        break;
                    }
                }
            }
            for (var _a = 0, _b = this.patterns; _a < _b.length; _a++) {
                var pattern = _b[_a];
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
            if (!el.$zoomer$) {
                el.$zoomer$ = [this];
            }
            else {
                el.$zoomer$[el.$zoomer$.length] = this;
            }
        }
        return Zoomer;
    }());
    fingers.Zoomer = Zoomer;
    var Drag = (function (_super) {
        __extends(Drag, _super);
        function Drag(el) {
            _super.call(this, el);
            var zoomer = this;
            this.mapping = {
                dragstart: function (act, el) {
                    zoomer.sact = act;
                    zoomer.pact = act;
                    zoomer.started = true;
                }, dragging: function (act, el) {
                    if (zoomer.started) {
                        var p = zoomer.pact;
                        var offset = [act.cpos[0] - p.cpos[0], act.cpos[1] - p.cpos[1]];
                        var delta = { offset: offset };
                        var l = el.astyle(["left"]);
                        var t = el.astyle(["top"]);
                        el.style.left = parseInt(l) + delta.offset[0] + "px";
                        el.style.top = parseInt(t) + delta.offset[1] + "px";
                        zoomer.pact = act;
                    }
                }, dragend: function (act, el) {
                    zoomer.started = false;
                }
            };
        }
        return Drag;
    }(Zoomer));
    fingers.Drag = Drag;
    function pointOnElement(el, evt, pos) {
        var rlt = [0, 0];
        el.onmouseover = function (event) {
            rlt = [event.offsetX, event.offsetY];
        };
        simulate(el, "mouseover", pos);
        return rlt;
    }
    fingers.pointOnElement = pointOnElement;
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
                    zoomer.rot = fingers.Rotator(el);
                }, zooming: function (act, el) {
                    if (zoomer.started) {
                        var p = zoomer.sact;
                        var offset = [act.cpos[0] - p.cpos[0], act.cpos[1] - p.cpos[1]];
                        var rot = act.angle - p.angle;
                        var scale = act.len / p.len;
                        var delta = { offset: offset, angle: rot, scale: scale };
                        var center = pointOnElement(el, "mouseover", act.cpos);
                        zoomer.rot.rotate({
                            pos: offset,
                            angle: rot,
                            center: center,
                            scale: scale
                        });
                        zoomer.pact = act;
                    }
                }, zoomend: function (act, el) {
                    zoomer.started = false;
                    zoomer.rot.commitStatus();
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
                    }
                }, zoomend: function (act, el) {
                    zoomer.started = false;
                }
            };
        }
        return Zsize;
    }(Zoomer));
    fingers.Zsize = Zsize;
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
    var inited = false;
    var cfg = null;
    function finger(el) {
        if (!cfg) {
            cfg = fingers.touch({
                on: {
                    tap: function (act) {
                        activeEl = elAtPos(act.cpos);
                    }
                }, onact: function (inq) {
                }, onrecognized: function (act) {
                    if (activeEl && activeEl.$zoomer$) {
                        var zm = activeEl.$zoomer$;
                        for (var _i = 0, zm_1 = zm; _i < zm_1.length; _i++) {
                            var i = zm_1[_i];
                            if (i.mapping[act.act]) {
                                i.mapping[act.act](act, activeEl);
                            }
                        }
                    }
                }
            });
            cfg.enabled = true;
        }
        el.$touchable$ = true;
        return {
            zoomable: function () {
                var zoomer = new fingers.Zoom(el);
                return this;
            }, zsizable: function () {
                var zsize = new fingers.Zsize(el);
                return this;
            }, draggable: function () {
                var drag = new fingers.Drag(el);
                return this;
            }
        };
    }
    fingers.finger = finger;
})(fingers || (fingers = {}));
var finger = fingers.finger;

var fingers;
(function (fingers) {
    var Rot = (function () {
        function Rot(el) {
            if (!el) {
                return;
            }
            this.target = el;
            el.$rot$ = this;
            var pos = [el.astyle(["left"]), el.astyle(["top"])];
            el.style.left = pos[0];
            el.style.top = pos[1];
            var rc = el.getBoundingClientRect();
            this.origin = {
                center: [rc.width / 2, rc.height / 2],
                angle: 0,
                scale: [1, 1],
                pos: [parseFloat(pos[0]), parseFloat(pos[1])],
                size: [rc.width, rc.height]
            };
            this.cmt = {
                center: [rc.width / 2, rc.height / 2],
                angle: 0,
                scale: [1, 1],
                pos: [parseFloat(pos[0]), parseFloat(pos[1])],
                size: [rc.width, rc.height]
            };
            this.cache = {
                center: [rc.width / 2, rc.height / 2],
                angle: 0,
                scale: [1, 1],
                pos: [parseFloat(pos[0]), parseFloat(pos[1])],
                size: [rc.width, rc.height]
            };
            this.status = [];
            this.center = document.createElement("div");
            this.center.style.position = 'absolute';
            this.center.style.left = '50%';
            this.center.style.top = '50%';
            this.center.style.width = '0px';
            this.center.style.height = '0px';
            this.center.style.border = 'solid 0px blue';
            el.appendChild(this.center);
            this.setOrigin(this.origin.center);
            el.style.transform = "rotate(0deg)";
            this.pushStatus();
        }
        Rot.prototype.rotate = function (arg, undef) {
            if (!arg) {
                return this;
            }
            var cache = this.cache;
            var origin = this.cmt;
            var offset = this.offset;
            var angle = arg.angle, center = arg.center, scale = arg.scale, pos = arg.pos, resize = arg.resize;
            if (!offset) {
                offset = [0, 0];
            }
            if (center !== undef) {
                this.pushStatus();
                this.setOrigin(center);
                var cstatus = this.pushStatus();
                offset = this.correct(cstatus, offset);
            }
            if (angle || angle === 0) {
                cache.angle = origin.angle + angle;
                cache.angle = cache.angle % 360;
            }
            if (resize) {
                cache.size = [origin.size[0] + resize[0], origin.size[1] + resize[1]];
                if (cache.size[0] < 10) {
                    cache.size[0] = 10;
                }
                if (cache.size[1] < 10) {
                    cache.size[1] = 10;
                }
            }
            if (scale) {
                if (!(scale instanceof Array)) {
                    var n = parseFloat(scale);
                    scale = [n, n];
                }
                cache.scale = [origin.scale[0] * scale[0], origin.scale[1] * scale[1]];
            }
            if (pos) {
                cache.pos = [origin.pos[0] + pos[0] - offset[0], origin.pos[1] + pos[1] - offset[1]];
            }
            this.target.style.transform = 'rotateZ(' + cache.angle + 'deg) scale(' + cache.scale[0] + ',' + cache.scale[1] + ')';
            this.target.style.left = cache.pos[0] + 'px';
            this.target.style.top = cache.pos[1] + 'px';
            if (resize) {
                this.target.style.width = cache.size[0] + 'px';
                this.target.style.height = cache.size[1] + 'px';
            }
            this.pushStatus();
            return this;
        };
        Rot.prototype.getCenter = function () {
            var rc = this.center.getBoundingClientRect();
            return [rc.left, rc.top];
        };
        Rot.prototype.setOrigin = function (p) {
            this.target.style.transformOrigin = p[0] + "px " + p[1] + "px";
        };
        Rot.prototype.correct = function (status, poffset) {
            if (!poffset) {
                poffset = [0, 0];
            }
            var d = status.delta;
            var x = parseFloat(this.target.astyle["left"]) - d.center[0];
            var y = parseFloat(this.target.astyle["top"]) - d.center[1];
            this.offset = [poffset[0] + d.center[0], poffset[1] + d.center[1]];
            this.target.style.left = x + "px";
            this.target.style.top = y + "px";
            return this.offset;
        };
        Rot.prototype.commitStatus = function () {
            this.cmt = this.cache;
            this.cmt.pos = [parseFloat(this.target.style.left), parseFloat(this.target.style.top)];
            this.cmt.size = [parseFloat(this.target.style.width), parseFloat(this.target.style.height)];
            this.cache = { angle: 0, scale: [1, 1], pos: [0, 0], size: [0, 0] };
            this.offset = [0, 0];
        };
        Rot.prototype.pushStatus = function () {
            var c = this.getCenter();
            var l = [parseFloat(this.target.astyle(["left"])), parseFloat(this.target.astyle(["top"]))];
            var s = { center: [c[0], c[1]], pos: l };
            var q = this.status;
            var p = q.length > 0 ? q[q.length - 1] : s;
            s.delta = { center: [s.center[0] - p.center[0], s.center[1] - p.center[1]],
                pos: [s.pos[0] - p.pos[0], s.pos[1] - p.pos[1]] };
            q[q.length] = s;
            if (q.length > 6) {
                q.splice(0, 1);
            }
            return s;
        };
        return Rot;
    }());
    function Rotator(el) {
        var r = el.$rot$ || new Rot(el);
        return r;
    }
    fingers.Rotator = Rotator;
})(fingers || (fingers = {}));

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
Element.prototype.set = function (val) {
    function add(t, v) {
        if (t) {
            if (typeof (v) == 'object') {
                var tmp = wo.use(v.target);
                if (tmp) {
                    v.target = tmp;
                }
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
    if (wo.usable(val)) {
        add(this, val);
    }
    for (var i in val) {
        var v = val[i];
        var t = this["$" + i];
        add(t, v);
    }
};
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
                //console.dir(json.alias);
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
        Creator.prototype.applyattr = function (el, json, i, cs) {
            var target = el[i];
            if (target) {
                var type = typeof target;
                if (type == 'object') {
                    var vtype = typeof json[i];
                    if (vtype == 'object') {
                        wo.jextend(target, json[i], this);
                    }
                    else {
                        el[i] = json[i];
                    }
                }
                else {
                    el[i] = json[i];
                }
            }
            else {
                el[i] = json[i];
            }
        };
        Creator.prototype.applyprop = function (el, json, i, cs) {
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
    function usable(json) {
        for (var _i = 0, Creators_1 = wo.Creators; _i < Creators_1.length; _i++) {
            var i = Creators_1[_i];
            if (json[i.Id]) {
                return true;
            }
        }
        return false;
    }
    wo.usable = usable;
    function use(json, cs) {
        var rlt = null;
        if (!json || json instanceof Element) {
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
        for (var _i = 0, Creators_2 = wo.Creators; _i < Creators_2.length; _i++) {
            var i = Creators_2[_i];
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
        DomCreator.prototype.verify = function (i, json) {
            if (i.startsWith("$$")) {
                return this.applyattr;
            }
            else if (i == "$") {
                return this.applychild;
            }
            else if (i.startsWith("$")) {
                return wo.objextend;
            }
            else {
                return this.applyprop;
            }
        };
        DomCreator.prototype.extend = function (o, json) {
            if (json instanceof Node || json instanceof Element) {
                debugger;
                return;
            }
            if (o instanceof HTMLElement) {
                //domextend(o, json);
                wo.jextend(o, json, this);
            }
            else if (json.$ && o instanceof Node) {
                o.nodeValue = json.$;
            }
            else if (o.extend) {
                o.extend(json);
            }
        };
        DomCreator.prototype.applychild = function (el, json, i, cs) {
            var type = typeof json[i];
            if (json[i] instanceof Array) {
                for (var _i = 0, _a = json[i]; _i < _a.length; _i++) {
                    var j = _a[_i];
                    var child = wo.use(j, cs);
                    if (child != null) {
                        wo.append(el, child);
                    }
                }
            }
            else if (type == 'object') {
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
        };
        return DomCreator;
    }(wo.Creator));
    wo.DomCreator = DomCreator;
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
        UiCreator.prototype.verify = function (i, json) {
            if (i.startsWith("$$")) {
                return this.applyattr;
            }
            else if (i == "$") {
                return this.applychild;
            }
            else if (i == "style") {
                return wo.objextend;
            }
            else {
                return this.applyprop;
            }
        };
        UiCreator.prototype.extend = function (o, json) {
            if (json instanceof Node || json instanceof Element) {
                debugger;
                return;
            }
            if (o instanceof HTMLElement) {
                wo.jextend(o, json, this);
            }
            else if (json.$ && o instanceof Node) {
                o.nodeValue = json.$;
            }
            else if (o.extend) {
                o.extend(json);
            }
        };
        UiCreator.prototype.applychild = function (el, json, i, cs) {
            var type = typeof json[i];
            var ji = json[i];
            if (type == 'object' && !(ji instanceof Array)) {
                ji = [ji];
            }
            if (ji instanceof Array) {
                var nodes = el.childNodes;
                for (var j = 0; j < ji.length; j++) {
                    var item = ji[j];
                    if (wo.iswidget(item)) {
                        if (el.use) {
                            el.use(item, cs);
                        }
                        else {
                            var child = wo.use(item, cs);
                            if (child != null) {
                                wo.append(el, child);
                            }
                        }
                    }
                    else {
                        if (j < nodes.length) {
                            wo.jextend(nodes[j], item, this);
                        }
                        else {
                            if (el.use) {
                                el.use(item, cs);
                            }
                            else {
                                var child = wo.use(item, cs);
                                if (child != null) {
                                    wo.append(el, child);
                                }
                            }
                        }
                    }
                }
            }
            else {
                el.innerHTML = json[i];
            }
        };
        return UiCreator;
    }(wo.Creator));
    wo.UiCreator = UiCreator;
    function iswidget(json) {
        if (!json || !json.ui) {
            return false;
        }
        for (var i in wo.Widgets) {
            if (i == json.ui) {
                return true;
            }
        }
        return false;
    }
    wo.iswidget = iswidget;
})(wo || (wo = {}));

/// <reference path="./foundation/definitions.ts" />
/// <reference path="./builder/use.ts" />
/// <reference path="./builder/domcreator.ts" />
/// <reference path="./builder/svgcreator.ts" />
/// <reference path="./builder/uicreator.ts" />
wo.Creators.add(new wo.DomCreator());
wo.Creators.add(new wo.SvgCreator());
wo.Creators.add(new wo.UiCreator());

var wo;
(function (wo) {
    function objextend(o, json) {
        for (var i in json) {
            if (typeof (json[i]) == 'object' && o[i] && typeof (o[i]) == 'object') {
                objextend(o[i], json[i]);
            }
            else {
                o[i] = json[i];
            }
        }
    }
    wo.objextend = objextend;
})(wo || (wo = {}));

/// <reference path="objextend.ts" />
var wo;
(function (wo) {
    function jextend(target, json, bag) {
        var cs = target.cursor;
        for (var i in json) {
            var handler = bag.verify(i, json);
            if (!handler) {
                handler = wo.objextend;
            }
            handler(target, json, i, cs);
        }
    }
    wo.jextend = jextend;
})(wo || (wo = {}));

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

/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />
var wo;
(function (wo) {
    wo.Widgets.card = function () {
        return {
            tag: "div",
            class: "card",
            use: function (json) {
                var child = wo.use(json);
                if (this.$body) {
                    this.$body.appendChild(child);
                }
                else {
                    debugger;
                }
            },
            $: [
                { tag: "div", class: "title noselect", $: [
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
    wo.Widgets.dropdown = function () {
        return {
            tag: "div",
            class: "dropdown",
            set: function (val) {
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
                { tag: "div", class: "title noselect", $: [
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHMiLCJmaW5nZXJzL3BhdHRlcm5zLnRzIiwiZmluZ2Vycy9yZWNvZ25pemVyLnRzIiwiZmluZ2Vycy90b3VjaC50cyIsImZpbmdlcnMvem9vbWVyLnRzIiwiZmluZ2Vycy9maW5nZXIudHMiLCJmaW5nZXJzL3JvdGF0b3IudHMiLCJ3by9mb3VuZGF0aW9uL3N0cmluZy50cyIsIndvL2J1aWxkZXIvdXNlLnRzIiwid28vYnVpbGRlci9kb21jcmVhdG9yLnRzIiwid28vYnVpbGRlci9zdmdjcmVhdG9yLnRzIiwid28vYnVpbGRlci91aWNyZWF0b3IudHMiLCJ3by93by50cyIsIndvL2J1aWxkZXIvb2JqZXh0ZW5kLnRzIiwid28vYnVpbGRlci9leHRlbmRlci50cyIsIndvL2ZvdW5kYXRpb24vZGV2aWNlLnRzIiwid28vZm91bmRhdGlvbi9lbGVtZW50cy50cyIsIndvL3dpZGdldHMvY2FyZC9jYXJkLnRzIiwid28vd2lkZ2V0cy9jb3Zlci9jb3Zlci50cyIsIndvL3dpZGdldHMvZHJvcGRvd24vZHJvcGRvd24udHMiLCJ3by93aWRnZXRzL2xvYWRpbmcvbG9hZGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFtQ0EsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxJQUFRO0lBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzFCLENBQUMsQ0FBQTtBQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsU0FBa0I7SUFDbkQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNwQixHQUFHLENBQUEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztRQUMvQixpQkFBaUI7UUFDakIsSUFBSSxHQUFHLEdBQUcsSUFB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Q0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNoRSxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDOUQsSUFBSSxLQUFLLEdBQUcsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUMsQ0FBQzt3QkFFNUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQzdCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUU5QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDNUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBRTNCLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzt3QkFDdEQsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO3dCQUV2RCxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ3JELEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMs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QUcsQ0FBQyxDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDNUYsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFDUyx3QkFBVSxHQUFwQjtZQUNJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsR0FBTyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUMsQ0FBQyxFQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENB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QUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDO1NBQ0osQ0FBQztJQUNOLENBQUMsQ0FBQztJQUNGLDBCQUEwQixPQUFjLEVBQUUsT0FBYyxFQUFFLE1BQWEsRUFBRSxjQUFxQjtRQUMxRixJQUFJLGNBQWMsR0FBRyxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDdEQsSUFBSSxDQUFDLEdBQUcsT0FBTyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsQ0FBQztBQUNMLENBQUMsRUFyRFMsRUFBRSxLQUFGLEVBQUUsUUFxRFgiLCJmaWxlIjoid28uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgV2luZG93e1xuXHRvcHI6YW55O1xuXHRvcGVyYTphbnk7XG5cdGNocm9tZTphbnk7XG5cdFN0eWxlTWVkaWE6YW55O1xuXHRJbnN0YWxsVHJpZ2dlcjphbnk7XG5cdENTUzphbnk7XG59XG5cbmludGVyZmFjZSBEb2N1bWVudHtcblx0ZG9jdW1lbnRNb2RlOmFueTtcbn1cblxuLy8gRWxlbWVudC50c1xuaW50ZXJmYWNlIEVsZW1lbnR7XG5cdFtuYW1lOnN0cmluZ106YW55O1xuXHRhc3R5bGUoc3R5bGVzOnN0cmluZ1tdKTpzdHJpbmc7XG5cdHNldCh2YWw6YW55KTp2b2lkO1xuXHRkZXN0cm95U3RhdHVzOmFueTtcblx0ZGlzcG9zZSgpOmFueTtcbn1cblxuaW50ZXJmYWNlIE5vZGV7XG5cdGN1cnNvcjphbnk7XG59XG5cbmludGVyZmFjZSBTdHJpbmd7XG5cdHN0YXJ0c1dpdGgoc3RyOnN0cmluZyk6Ym9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRhZGQoaXRlbTpUKTp2b2lkO1xuXHRjbGVhcihkZWw/OmJvb2xlYW4pOnZvaWQ7XG59XG5cbkFycmF5LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoaXRlbTphbnkpIHtcblx0dGhpc1t0aGlzLmxlbmd0aF0gPSBpdGVtO1xufVxuXG5BcnJheS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoa2VlcGFsaXZlPzpib29sZWFuKSB7XG5cdGxldCBuID0gdGhpcy5sZW5ndGg7XG5cdGZvcihsZXQgaSA9IG4gLSAxOyBpID49IDA7IGktLSl7XG5cdFx0Ly9kZWxldGUgdGhpc1tpXTtcblx0XHRsZXQgdG1wID0gdGhpcy5wb3AoKTtcblx0XHR0bXAgPSBudWxsO1xuXHR9XG59XG4iLCJcclxubmFtZXNwYWNlIGZpbmdlcnN7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbjtcclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6YW55O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgUGF0dGVybnM6YW55ID0ge307XHJcbiAgICBcclxuICAgIGNsYXNzIFRvdWNoZWRQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNoZW5kXCIgJiYgcXVldWUubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IHByZXYgPSBxdWV1ZVsxXTtcclxuICAgICAgICAgICAgLy9kZWJ1Z2dlcjtcclxuICAgICAgICAgICAgaWYgKHByZXYgJiYgcHJldi5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0ID0gcHJldlswXTtcclxuICAgICAgICAgICAgICAgIGxldCBkcmFnID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAob3V0cSAhPSBudWxsICYmIG91dHEubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhY3Q6YW55ID0gb3V0cVswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFjdCAmJiAocGFjdC5hY3QgPT0gXCJkcmFnZ2luZ1wiIHx8IHBhY3QuYWN0ID09IFwiZHJhZ3N0YXJ0XCIpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFkcmFnKXsgXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7IGk8MzsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHEgPSBxdWV1ZVtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHFbMF0uYWN0ID09IFwidG91Y2hzdGFydFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0OlwidG91Y2hlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRHJhZ2dpbmdQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDEgXHJcbiAgICAgICAgICAgICAgICAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNobW92ZVwiIFxyXG4gICAgICAgICAgICAgICAgJiYgcXVldWUubGVuZ3RoID4gMjtcclxuICAgICAgICAgICAgaWYgKHJsdCl7XHJcbiAgICAgICAgICAgICAgICBybHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGxldCBzMSA9IHF1ZXVlWzJdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHMyID0gcXVldWVbMV07XHJcbiAgICAgICAgICAgICAgICBpZiAoczEubGVuZ3RoID09IDEgJiYgczIubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhMSA9IHMxWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhMiA9IHMyWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhMS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2RlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYTEuYWN0ID09IFwidG91Y2hzdGFydFwiICYmIGEyLmFjdCA9PSBcInRvdWNobW92ZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZiAoYTEuYWN0ID09IFwidG91Y2htb3ZlXCIgJiYgYTIuYWN0ID09IFwidG91Y2htb3ZlXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBybHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSxvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgcHJldiA9IHF1ZXVlWzJdO1xyXG4gICAgICAgICAgICBpZiAocHJldi5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0ID0gcHJldlswXTtcclxuICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChhY3QuYWN0ID09IFwidG91Y2hzdGFydFwiKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJkcmFnc3RhcnRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiAoYWN0LmFjdCA9PSBcInRvdWNobW92ZVwiICYmIG91dHEubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhY3QgPSBvdXRxWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyYWN0LmFjdCA9PSBcImRyYWdzdGFydFwiIHx8IHJhY3QuYWN0ID09IFwiZHJhZ2dpbmdcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJkcmFnZ2luZ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIERyb3BQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNoZW5kXCIgJiYgcXVldWUubGVuZ3RoID4gMCAmJiBvdXRxLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgLy9sZXQgcHJldiA9IHF1ZXVlWzFdO1xyXG4gICAgICAgICAgICBsZXQgYWN0ID0gb3V0cVswXTtcclxuICAgICAgICAgICAgaWYgKGFjdC5hY3QgPT0gXCJkcmFnZ2luZ1wiIHx8IGFjdC5hY3QgPT0gXCJkcmFnc3RhcnRcIil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdDpcImRyb3BwZWRcIixcclxuICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIERibFRvdWNoZWRQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDEgJiYgYWN0c1swXS5hY3QgPT0gXCJ0b3VjaGVuZFwiICYmIHF1ZXVlLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCBwcmV2ID0gcXVldWVbMV07XHJcbiAgICAgICAgICAgIGlmIChwcmV2ICYmIHByZXYubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICAgICAgbGV0IGFjdCA9IHByZXZbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAob3V0cSAhPSBudWxsICYmIG91dHEubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhY3Q6YW55ID0gb3V0cVswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFjdCAmJiBwYWN0LmFjdCA9PSBcInRvdWNoZWRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhY3QuYWN0ID09IFwidG91Y2hzdGFydFwiIHx8IGFjdC5hY3QgPT0gXCJ0b3VjaG1vdmVcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0LnRpbWUgLSBwYWN0LnRpbWUgPCA1MDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdDpcImRibHRvdWNoZWRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJ0b3VjaGVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYWxjQW5nbGUoYTppYWN0LCBiOmlhY3QsIGxlbjpudW1iZXIpOm51bWJlcntcclxuICAgICAgICBsZXQgYWcgPSBNYXRoLmFjb3MoKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkvbGVuKSAvIE1hdGguUEkgKiAxODA7XHJcbiAgICAgICAgaWYgKGIuY3Bvc1sxXSA8IGEuY3Bvc1sxXSl7XHJcbiAgICAgICAgICAgIGFnKj0tMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFnO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFpvb21TdGFydFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAyIFxyXG4gICAgICAgICAgICAgICAgJiYgKChhY3RzWzBdLmFjdCA9PSBcInRvdWNoc3RhcnRcIiB8fCBhY3RzWzFdLmFjdCA9PSBcInRvdWNoc3RhcnRcIilcclxuICAgICAgICAgICAgICAgICAgICB8fChvdXRxLmxlbmd0aCA+IDAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2htb3ZlXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIGFjdHNbMV0uYWN0ID09IFwidG91Y2htb3ZlXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIG91dHFbMF0uYWN0ICE9IFwiem9vbWluZ1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBvdXRxWzBdLmFjdCAhPSBcInpvb21zdGFydFwiICkpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLCBvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgYWN0cyA9IHF1ZXVlWzBdO1xyXG4gICAgICAgICAgICBsZXQgYTppYWN0ID0gYWN0c1swXTtcclxuICAgICAgICAgICAgbGV0IGI6aWFjdCA9IGFjdHNbMV07XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBNYXRoLnNxcnQoKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkqKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkgKyAoYi5jcG9zWzFdIC0gYS5jcG9zWzFdKSooYi5jcG9zWzFdIC0gYS5jcG9zWzFdKSk7XHJcbiAgICAgICAgICAgIGxldCBvd2lkdGggPSBNYXRoLmFicyhiLmNwb3NbMF0gLSBhLmNwb3NbMF0pO1xyXG4gICAgICAgICAgICBsZXQgb2hlaWdodCA9IE1hdGguYWJzKGIuY3Bvc1sxXSAtIGEuY3Bvc1sxXSk7XHJcbiAgICAgICAgICAgIGxldCBhZyA9IGNhbGNBbmdsZShhLCBiLCBsZW4pOyAvL01hdGguYWNvcygoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKS9sZW4pIC8gTWF0aC5QSSAqIDE4MDtcclxuICAgICAgICAgICAgbGV0IHI6aWFjdCA9IHtcclxuICAgICAgICAgICAgICAgIGFjdDpcInpvb21zdGFydFwiLFxyXG4gICAgICAgICAgICAgICAgY3BvczpbKGEuY3Bvc1swXSArIGIuY3Bvc1swXSkvMiwgKGEuY3Bvc1sxXSArIGIuY3Bvc1sxXSkvMl0sXHJcbiAgICAgICAgICAgICAgICBsZW46bGVuLFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6YWcsXHJcbiAgICAgICAgICAgICAgICBvd2lkdGg6b3dpZHRoLFxyXG4gICAgICAgICAgICAgICAgb2hlaWdodDpvaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgdGltZTphLnRpbWVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFpvb21QYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMiBcclxuICAgICAgICAgICAgICAgICYmIChhY3RzWzBdLmFjdCAhPSBcInRvdWNoZW5kXCIgJiYgYWN0c1sxXS5hY3QgIT0gXCJ0b3VjaGVuZFwiKVxyXG4gICAgICAgICAgICAgICAgJiYgKGFjdHNbMF0uYWN0ID09IFwidG91Y2htb3ZlXCIgfHwgYWN0c1sxXS5hY3QgPT0gXCJ0b3VjaG1vdmVcIilcclxuICAgICAgICAgICAgICAgICYmIG91dHEubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgICAgJiYgKG91dHFbMF0uYWN0ID09IFwiem9vbXN0YXJ0XCIgfHwgb3V0cVswXS5hY3QgPT0gXCJ6b29taW5nXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLCBvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgYWN0cyA9IHF1ZXVlWzBdO1xyXG4gICAgICAgICAgICBsZXQgYTppYWN0ID0gYWN0c1swXTtcclxuICAgICAgICAgICAgbGV0IGI6aWFjdCA9IGFjdHNbMV07XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBNYXRoLnNxcnQoKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkqKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkgKyAoYi5jcG9zWzFdIC0gYS5jcG9zWzFdKSooYi5jcG9zWzFdIC0gYS5jcG9zWzFdKSk7XHJcbiAgICAgICAgICAgIGxldCBhZyA9IGNhbGNBbmdsZShhLCBiLCBsZW4pOyAvL01hdGguYWNvcygoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKS9sZW4pIC8gTWF0aC5QSSAqIDE4MDtcclxuICAgICAgICAgICAgbGV0IG93aWR0aCA9IE1hdGguYWJzKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSk7XHJcbiAgICAgICAgICAgIGxldCBvaGVpZ2h0ID0gTWF0aC5hYnMoYi5jcG9zWzFdIC0gYS5jcG9zWzFdKTtcclxuICAgICAgICAgICAgbGV0IHI6aWFjdCA9IHtcclxuICAgICAgICAgICAgICAgIGFjdDpcInpvb21pbmdcIixcclxuICAgICAgICAgICAgICAgIGNwb3M6WyhhLmNwb3NbMF0gKyBiLmNwb3NbMF0pLzIsIChhLmNwb3NbMV0gKyBiLmNwb3NbMV0pLzJdLFxyXG4gICAgICAgICAgICAgICAgbGVuOmxlbixcclxuICAgICAgICAgICAgICAgIGFuZ2xlOmFnLFxyXG4gICAgICAgICAgICAgICAgb3dpZHRoOm93aWR0aCxcclxuICAgICAgICAgICAgICAgIG9oZWlnaHQ6b2hlaWdodCxcclxuICAgICAgICAgICAgICAgIHRpbWU6YS50aW1lXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBab29tRW5kUGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IG91dHEubGVuZ3RoID4gMCBcclxuICAgICAgICAgICAgICAgICYmIChvdXRxWzBdLmFjdCA9PSBcInpvb21zdGFydFwiIHx8IG91dHFbMF0uYWN0ID09IFwiem9vbWluZ1wiKVxyXG4gICAgICAgICAgICAgICAgJiYgYWN0cy5sZW5ndGggPD0yO1xyXG4gICAgICAgICAgICBpZiAocmx0KXtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5kaXIoYWN0cyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0cy5sZW5ndGggPCAyKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBvZiBhY3RzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkuYWN0ID09IFwidG91Y2hlbmRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCByOmlhY3QgPSB7XHJcbiAgICAgICAgICAgICAgICBhY3Q6XCJ6b29tZW5kXCIsXHJcbiAgICAgICAgICAgICAgICBjcG9zOlswLCAwXSxcclxuICAgICAgICAgICAgICAgIGxlbjowLFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6MCxcclxuICAgICAgICAgICAgICAgIG93aWR0aDowLFxyXG4gICAgICAgICAgICAgICAgb2hlaWdodDowLFxyXG4gICAgICAgICAgICAgICAgdGltZTpuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFBhdHRlcm5zLnpvb21lbmQgPSBuZXcgWm9vbUVuZFBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLnpvb21pbmcgPSBuZXcgWm9vbVBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLnpvb21zdGFydCA9IG5ldyBab29tU3RhcnRQYXR0ZXJuKCk7XHJcbiAgICBQYXR0ZXJucy5kcmFnZ2luZyA9IG5ldyBEcmFnZ2luZ1BhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLmRyb3BwZWQgPSBuZXcgRHJvcFBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLnRvdWNoZWQgPSBuZXcgVG91Y2hlZFBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLmRibHRvdWNoZWQgPSBuZXcgRGJsVG91Y2hlZFBhdHRlcm4oKTtcclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vd28vZm91bmRhdGlvbi9kZWZpbml0aW9ucy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhdHRlcm5zLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBmaW5nZXJze1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBpYWN0e1xyXG4gICAgICAgIGFjdDpzdHJpbmcsXHJcbiAgICAgICAgY3BvczpudW1iZXJbXSxcclxuICAgICAgICBycG9zPzpudW1iZXJbXSxcclxuICAgICAgICBvaGVpZ2h0PzpudW1iZXIsXHJcbiAgICAgICAgb3dpZHRoPzpudW1iZXIsXHJcbiAgICAgICAgbGVuPzpudW1iZXIsXHJcbiAgICAgICAgYW5nbGU/Om51bWJlcixcclxuICAgICAgICB0aW1lPzpudW1iZXJcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVjb2duaXplcntcclxuICAgICAgICBpbnF1ZXVlOmFueVtdID0gW107XHJcbiAgICAgICAgb3V0cXVldWU6aWFjdFtdID0gW107XHJcbiAgICAgICAgcGF0dGVybnM6aXBhdHRlcm5bXSA9IFtdO1xyXG4gICAgICAgIGNmZzphbnk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKGNmZzphbnkpe1xyXG4gICAgICAgICAgICBsZXQgZGVmcGF0dGVybnMgPSBbXCJ6b29tZW5kXCIsIFwiem9vbXN0YXJ0XCIsIFwiem9vbWluZ1wiLCBcImRibHRvdWNoZWRcIiwgXCJ0b3VjaGVkXCIsIFwiZHJvcHBlZFwiLCBcImRyYWdnaW5nXCJdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKCFjZmcpe1xyXG4gICAgICAgICAgICAgICAgY2ZnID0ge3BhdHRlcm5zOmRlZnBhdHRlcm5zfTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFjZmcucGF0dGVybnMpe1xyXG4gICAgICAgICAgICAgICAgY2ZnLnBhdHRlcm5zID0gZGVmcGF0dGVybnM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2ZnID0gY2ZnO1xyXG4gICAgICAgICAgICBmb3IobGV0IGkgb2YgY2ZnLnBhdHRlcm5zKXtcclxuICAgICAgICAgICAgICAgIGlmIChQYXR0ZXJuc1tpXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXR0ZXJucy5hZGQoUGF0dGVybnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFyc2UoYWN0czppYWN0W10pOnZvaWR7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jZmcucWxlbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNmZy5xbGVuID0gMTI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5xdWV1ZS5zcGxpY2UoMCwgMCwgYWN0cyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlucXVldWUubGVuZ3RoID4gdGhpcy5jZmcucWxlbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlucXVldWUuc3BsaWNlKHRoaXMuaW5xdWV1ZS5sZW5ndGggLSAxLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2ZnLm9uICYmIHRoaXMuY2ZnLm9uLnRhcCl7XHJcbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgb2YgYWN0cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9hY3RzLmxlbmd0aCA+PSAxICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2hzdGFydFwiICYmXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkuYWN0ID09IFwidG91Y2hzdGFydFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZmcub24udGFwKGFjdHNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgcGF0dGVybiBvZiB0aGlzLnBhdHRlcm5zKXtcclxuICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJuLnZlcmlmeShhY3RzLCB0aGlzLmlucXVldWUsIHRoaXMub3V0cXVldWUpKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmx0ID0gcGF0dGVybi5yZWNvZ25pemUodGhpcy5pbnF1ZXVlLCB0aGlzLm91dHF1ZXVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmx0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vdXRxdWV1ZS5zcGxpY2UoMCwgMCwgcmx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3V0cXVldWUubGVuZ3RoID4gdGhpcy5jZmcucWxlbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm91dHF1ZXVlLnNwbGljZSh0aGlzLm91dHF1ZXVlLmxlbmd0aCAtIDEsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBxID0gdGhpcy5pbnF1ZXVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlucXVldWUgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcS5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jZmcub24gJiYgdGhpcy5jZmcub25bcmx0LmFjdF0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZmcub25bcmx0LmFjdF0ocmx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jZmcub25yZWNvZ25pemVkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2ZnLm9ucmVjb2duaXplZChybHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJyZWNvZ25pemVyLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBmaW5nZXJze1xyXG4gICAgbGV0IGluaXRlZDpib29sZWFuID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGNsYXNzIHpvb21zaW17XHJcbiAgICAgICAgb3BwbzppYWN0O1xyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGUoYWN0OmlhY3QpOnZvaWR7XHJcbiAgICAgICAgICAgIGxldCBtID0gW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aC8yLCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LzJdO1xyXG4gICAgICAgICAgICB0aGlzLm9wcG8gPSB7YWN0OmFjdC5hY3QsIGNwb3M6WzIqbVswXSAtIGFjdC5jcG9zWzBdLCAyKm1bMV0gLSBhY3QuY3Bvc1sxXV0sIHRpbWU6YWN0LnRpbWV9O1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFjdC5jcG9zWzFdLCBtWzFdLCB0aGlzLm9wcG8uY3Bvc1sxXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXJ0KGFjdDppYWN0KTppYWN0W117XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKGFjdCk7XHJcbiAgICAgICAgICAgIHJldHVybiBbYWN0LCB0aGlzLm9wcG9dO1xyXG4gICAgICAgIH1cclxuICAgICAgICB6b29tKGFjdDppYWN0KTppYWN0W117XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKGFjdCk7XHJcbiAgICAgICAgICAgIHJldHVybiBbYWN0LCB0aGlzLm9wcG9dO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbmQoYWN0OmlhY3QpOmlhY3RbXXtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGUoYWN0KTtcclxuICAgICAgICAgICAgcmV0dXJuIFthY3QsIHRoaXMub3Bwb107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBvZmZzZXRzaW0gZXh0ZW5kcyB6b29tc2lte1xyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGUoYWN0OmlhY3QpOnZvaWR7XHJcbiAgICAgICAgICAgIHRoaXMub3BwbyA9IHthY3Q6YWN0LmFjdCwgY3BvczpbYWN0LmNwb3NbMF0gKyAxMDAsIGFjdC5jcG9zWzFdICsgMTAwXSwgdGltZTphY3QudGltZX07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB6czp6b29tc2ltID0gbnVsbDtcclxuICAgIGxldCBvczpvZmZzZXRzaW0gPSBudWxsO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldG91Y2hlcyhldmVudDphbnksIGlzZW5kPzpib29sZWFuKTphbnl7XHJcbiAgICAgICAgaWYgKGlzZW5kKXtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50LmNoYW5nZWRUb3VjaGVzO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gZXZlbnQudG91Y2hlcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRvdWNoKGNmZzphbnkpOmFueXtcclxuICAgICAgICBsZXQgcmc6UmVjb2duaXplciA9IG5ldyBSZWNvZ25pemVyKGNmZyk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUFjdChuYW1lOnN0cmluZywgeDpudW1iZXIsIHk6bnVtYmVyKTppYWN0e1xyXG4gICAgICAgICAgICByZXR1cm4ge2FjdDpuYW1lLCBjcG9zOlt4LCB5XSwgdGltZTpuZXcgRGF0ZSgpLmdldFRpbWUoKX07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGUoY2ZnOmFueSwgYWN0czppYWN0W10pOnZvaWR7XHJcbiAgICAgICAgICAgIGlmICghY2ZnIHx8ICFjZmcuZW5hYmxlZCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNmZy5vbmFjdCl7XHJcbiAgICAgICAgICAgICAgICBjZmcub25hY3QocmcuaW5xdWV1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmcucGFyc2UoYWN0cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWluaXRlZCl7XHJcbiAgICAgICAgICAgIGRvY3VtZW50Lm9uY29udGV4dG1lbnUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKCFNb2JpbGVEZXZpY2UuYW55KXtcclxuICAgICAgICAgICAgICAgIHpzID0gbmV3IHpvb21zaW0oKTtcclxuICAgICAgICAgICAgICAgIG9zID0gbmV3IG9mZnNldHNpbSgpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdDppYWN0ID0gY3JlYXRlQWN0KFwidG91Y2hzdGFydFwiLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCBvcy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpzLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIHpzLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaG1vdmVcIiwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PSAwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3Muc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgb3Mub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB6cy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCB6cy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNoZW5kXCIsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5idXR0b24gPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3RdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9zLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIG9zLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgenMuc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgenMub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0czppYWN0W10gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG91Y2hlcyA9IGdldG91Y2hlcyhldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7IGk8dG91Y2hlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNoc3RhcnRcIiwgaXRlbS5jbGllbnRYLCBpdGVtLmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RzLmFkZChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBhY3RzKTtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdHM6aWFjdFtdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdWNoZXMgPSBnZXRvdWNoZXMoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNobW92ZVwiLCBpdGVtLmNsaWVudFgsIGl0ZW0uY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHMuYWRkKGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIGFjdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChCcm93c2VyLmlzU2FmYXJpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdHM6aWFjdFtdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdWNoZXMgPSBnZXRvdWNoZXMoZXZlbnQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNoZW5kXCIsIGl0ZW0uY2xpZW50WCwgaXRlbS5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0cy5hZGQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgYWN0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNmZztcclxuICAgIH1cclxufVxyXG5cclxubGV0IHRvdWNoID0gZmluZ2Vycy50b3VjaDsiLCJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJyZWNvZ25pemVyLnRzXCIgLz5cblxubmFtZXNwYWNlIGZpbmdlcnN7XG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFpvb21lcntcbiAgICAgICAgcHJvdGVjdGVkIHNhY3Q6aWFjdDtcbiAgICAgICAgcHJvdGVjdGVkIHBhY3Q6aWFjdDtcbiAgICAgICAgcHJvdGVjdGVkIHN0YXJ0ZWQ6Ym9vbGVhbjtcbiAgICAgICAgbWFwcGluZzp7fTtcbiAgICAgICAgY29uc3RydWN0b3IoZWw6YW55KXtcbiAgICAgICAgICAgIGlmICghZWwuJHpvb21lciQpe1xuICAgICAgICAgICAgICAgIGVsLiR6b29tZXIkID0gW3RoaXNdO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZWwuJHpvb21lciRbZWwuJHpvb21lciQubGVuZ3RoXSA9IHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgRHJhZyBleHRlbmRzIFpvb21lcntcbiAgICAgICAgY29uc3RydWN0b3IoZWw6YW55KXtcbiAgICAgICAgICAgIHN1cGVyKGVsKTtcbiAgICAgICAgICAgIGxldCB6b29tZXIgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5tYXBwaW5nID0ge1xuICAgICAgICAgICAgICAgIGRyYWdzdGFydDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnNhY3QgPSBhY3Q7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5wYWN0ID0gYWN0O1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSwgZHJhZ2dpbmc6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh6b29tZXIuc3RhcnRlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcCA9IHpvb21lci5wYWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IFthY3QuY3Bvc1swXSAtIHAuY3Bvc1swXSwgYWN0LmNwb3NbMV0gLSBwLmNwb3NbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbHRhID0ge29mZnNldDogb2Zmc2V0fTsgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbCA9IGVsLmFzdHlsZShbXCJsZWZ0XCJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ID0gZWwuYXN0eWxlKFtcInRvcFwiXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gcGFyc2VJbnQobCkgKyBkZWx0YS5vZmZzZXRbMF0gKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBwYXJzZUludCh0KSArIGRlbHRhLm9mZnNldFsxXSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb21lci5wYWN0ID0gYWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZHJhZ2VuZDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcG9pbnRPbkVsZW1lbnQoZWw6YW55LCBldnQ6c3RyaW5nLCBwb3M6bnVtYmVyW10pe1xuICAgICAgICBsZXQgcmx0ID0gWzAsIDBdO1xuICAgICAgICBlbC5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKGV2ZW50OmFueSl7XG4gICAgICAgICAgICBybHQgPSBbZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WV07XG4gICAgICAgIH1cbiAgICAgICAgc2ltdWxhdGUoZWwsIFwibW91c2VvdmVyXCIsIHBvcyk7XG4gICAgICAgIHJldHVybiBybHQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIFpvb20gZXh0ZW5kcyBab29tZXJ7XG4gICAgICAgIHByb3RlY3RlZCByb3Q6YW55O1xuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xuICAgICAgICAgICAgc3VwZXIoZWwpO1xuICAgICAgICAgICAgbGV0IHpvb21lciA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLm1hcHBpbmcgPSB7XG4gICAgICAgICAgICAgICAgem9vbXN0YXJ0OmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc2FjdCA9IGFjdDtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnJvdCA9IFJvdGF0b3IoZWwpO1xuICAgICAgICAgICAgICAgIH0sIHpvb21pbmc6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh6b29tZXIuc3RhcnRlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcCA9IHpvb21lci5zYWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IFthY3QuY3Bvc1swXSAtIHAuY3Bvc1swXSwgYWN0LmNwb3NbMV0gLSBwLmNwb3NbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdCA9IGFjdC5hbmdsZSAtIHAuYW5nbGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2NhbGUgPSBhY3QubGVuIC8gcC5sZW47XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGVsdGEgPSB7b2Zmc2V0OiBvZmZzZXQsIGFuZ2xlOnJvdCwgc2NhbGU6c2NhbGV9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNlbnRlciA9IHBvaW50T25FbGVtZW50KGVsLCBcIm1vdXNlb3ZlclwiLCBhY3QuY3Bvcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb21lci5yb3Qucm90YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3M6b2Zmc2V0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmdsZTpyb3QsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjpjZW50ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGU6c2NhbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB6b29tZW5kOmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIucm90LmNvbW1pdFN0YXR1cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBleHBvcnQgY2xhc3MgWnNpemUgZXh0ZW5kcyBab29tZXJ7XG4gICAgICAgIGNvbnN0cnVjdG9yKGVsOmFueSl7XG4gICAgICAgICAgICBzdXBlcihlbCk7XG4gICAgICAgICAgICBsZXQgem9vbWVyID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMubWFwcGluZyA9IHtcbiAgICAgICAgICAgICAgICB6b29tc3RhcnQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zYWN0ID0gYWN0O1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIucGFjdCA9IGFjdDtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sem9vbWluZzpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvb21lci5zdGFydGVkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwID0gem9vbWVyLnBhY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gW2FjdC5jcG9zWzBdIC0gcC5jcG9zWzBdLCBhY3QuY3Bvc1sxXSAtIHAuY3Bvc1sxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVzaXplID0gW2FjdC5vd2lkdGggLSBwLm93aWR0aCwgYWN0Lm9oZWlnaHQgLSBwLm9oZWlnaHRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbHRhID0ge29mZnNldDogb2Zmc2V0LCByZXNpemU6cmVzaXplfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHcgPSBlbC5hc3R5bGUoW1wid2lkdGhcIl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGggPSBlbC5hc3R5bGUoW1wiaGVpZ2h0XCJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGwgPSBlbC5hc3R5bGUoW1wibGVmdFwiXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdCA9IGVsLmFzdHlsZShbXCJ0b3BcIl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS53aWR0aCA9IHBhcnNlSW50KHcpICsgZGVsdGEucmVzaXplWzBdICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUuaGVpZ2h0ID0gcGFyc2VJbnQoaCkgKyBkZWx0YS5yZXNpemVbMV0gKyBcInB4XCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBwYXJzZUludChsKSArIGRlbHRhLm9mZnNldFswXSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHBhcnNlSW50KHQpICsgZGVsdGEub2Zmc2V0WzFdICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tZXIucGFjdCA9IGFjdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sem9vbWVuZDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaW11bGF0ZShlbGVtZW50OmFueSwgZXZlbnROYW1lOnN0cmluZywgcG9zOmFueSkge1xuICAgICAgICBmdW5jdGlvbiBleHRlbmQoZGVzdGluYXRpb246YW55LCBzb3VyY2U6YW55KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBzb3VyY2UpXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb25bcHJvcGVydHldID0gc291cmNlW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIHJldHVybiBkZXN0aW5hdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBldmVudE1hdGNoZXJzOmFueSA9IHtcbiAgICAgICAgICAgICdIVE1MRXZlbnRzJzogL14oPzpsb2FkfHVubG9hZHxhYm9ydHxlcnJvcnxzZWxlY3R8Y2hhbmdlfHN1Ym1pdHxyZXNldHxmb2N1c3xibHVyfHJlc2l6ZXxzY3JvbGwpJC8sXG4gICAgICAgICAgICAnTW91c2VFdmVudHMnOiAvXig/OmNsaWNrfGRibGNsaWNrfG1vdXNlKD86ZG93bnx1cHxvdmVyfG1vdmV8b3V0KSkkL1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgICAgICAgcG9pbnRlclg6IDEwMCxcbiAgICAgICAgICAgIHBvaW50ZXJZOiAxMDAsXG4gICAgICAgICAgICBidXR0b246IDAsXG4gICAgICAgICAgICBjdHJsS2V5OiBmYWxzZSxcbiAgICAgICAgICAgIGFsdEtleTogZmFsc2UsXG4gICAgICAgICAgICBzaGlmdEtleTogZmFsc2UsXG4gICAgICAgICAgICBtZXRhS2V5OiBmYWxzZSxcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgZGVmYXVsdE9wdGlvbnMucG9pbnRlclggPSBwb3NbMF07XG4gICAgICAgICAgICBkZWZhdWx0T3B0aW9ucy5wb2ludGVyWSA9IHBvc1sxXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgb3B0aW9ucyA9IGV4dGVuZChkZWZhdWx0T3B0aW9ucywgYXJndW1lbnRzWzNdIHx8IHt9KTtcbiAgICAgICAgbGV0IG9FdmVudDphbnksIGV2ZW50VHlwZTphbnkgPSBudWxsO1xuXG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gZXZlbnRNYXRjaGVycykge1xuICAgICAgICAgICAgaWYgKGV2ZW50TWF0Y2hlcnNbbmFtZV0udGVzdChldmVudE5hbWUpKSB7IGV2ZW50VHlwZSA9IG5hbWU7IGJyZWFrOyB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWV2ZW50VHlwZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignT25seSBIVE1MRXZlbnRzIGFuZCBNb3VzZUV2ZW50cyBpbnRlcmZhY2VzIGFyZSBzdXBwb3J0ZWQnKTtcblxuICAgICAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcbiAgICAgICAgICAgIG9FdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KGV2ZW50VHlwZSk7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09ICdIVE1MRXZlbnRzJykge1xuICAgICAgICAgICAgICAgIG9FdmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCBvcHRpb25zLmJ1YmJsZXMsIG9wdGlvbnMuY2FuY2VsYWJsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvRXZlbnQuaW5pdE1vdXNlRXZlbnQoZXZlbnROYW1lLCBvcHRpb25zLmJ1YmJsZXMsIG9wdGlvbnMuY2FuY2VsYWJsZSwgZG9jdW1lbnQuZGVmYXVsdFZpZXcsXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5idXR0b24sIG9wdGlvbnMucG9pbnRlclgsIG9wdGlvbnMucG9pbnRlclksIG9wdGlvbnMucG9pbnRlclgsIG9wdGlvbnMucG9pbnRlclksXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jdHJsS2V5LCBvcHRpb25zLmFsdEtleSwgb3B0aW9ucy5zaGlmdEtleSwgb3B0aW9ucy5tZXRhS2V5LCBvcHRpb25zLmJ1dHRvbiwgZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQob0V2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9wdGlvbnMuY2xpZW50WCA9IG9wdGlvbnMucG9pbnRlclg7XG4gICAgICAgICAgICBvcHRpb25zLmNsaWVudFkgPSBvcHRpb25zLnBvaW50ZXJZO1xuICAgICAgICAgICAgdmFyIGV2dCA9IChkb2N1bWVudCBhcyBhbnkpLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgICAgICAgICBvRXZlbnQgPSBleHRlbmQoZXZ0LCBvcHRpb25zKTtcbiAgICAgICAgICAgIGVsZW1lbnQuZmlyZUV2ZW50KCdvbicgKyBldmVudE5hbWUsIG9FdmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidG91Y2gudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiem9vbWVyLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBmaW5nZXJze1xyXG4gICAgZnVuY3Rpb24gZWxBdFBvcyhwb3M6bnVtYmVyW10pOmFueXtcclxuICAgICAgICBsZXQgcmx0OmFueSA9IG51bGw7XHJcbiAgICAgICAgbGV0IGNhY2hlOmFueVtdID0gW107XHJcbiAgICAgICAgd2hpbGUodHJ1ZSl7XHJcbiAgICAgICAgICAgIGxldCBlbDphbnkgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHBvc1swXSwgcG9zWzFdKTtcclxuICAgICAgICAgICAgaWYgKGVsID09IGRvY3VtZW50LmJvZHkgfHwgZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IFwiaHRtbFwiIHx8IGVsID09IHdpbmRvdyl7XHJcbiAgICAgICAgICAgICAgICBybHQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChlbC4kZXZ0cmFwJCl7XHJcbiAgICAgICAgICAgICAgICBybHQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChlbC4kdG91Y2hhYmxlJCl7XHJcbiAgICAgICAgICAgICAgICBybHQgPSBlbC5nZXRhcmdldD9lbC5nZXRhcmdldCgpOmVsXHJcbiAgICAgICAgICAgICAgICBybHQuJHRvdWNoZWwkID0gZWw7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICBjYWNoZS5hZGQoZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvcihsZXQgaSBvZiBjYWNoZSl7XHJcbiAgICAgICAgICAgIGkuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBybHQ7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFjdGl2ZUVsOmFueTtcclxuICAgIGxldCBpbml0ZWQ6Ym9vbGVhbj1mYWxzZTtcclxuICAgIGxldCBjZmc6YW55ID0gbnVsbDtcclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZmluZ2VyKGVsOmFueSk6YW55e1xyXG4gICAgICAgIGlmICghY2ZnKXtcclxuICAgICAgICAgICAgY2ZnID0gdG91Y2goe1xyXG4gICAgICAgICAgICAgICAgb246eyBcclxuICAgICAgICAgICAgICAgICAgICB0YXA6ZnVuY3Rpb24oYWN0OmlhY3Qpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbCA9IGVsQXRQb3MoYWN0LmNwb3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sb25hY3Q6ZnVuY3Rpb24oaW5xOmFueSl7XHJcbiAgICAgICAgICAgICAgICB9LG9ucmVjb2duaXplZDpmdW5jdGlvbihhY3Q6aWFjdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZUVsICYmIGFjdGl2ZUVsLiR6b29tZXIkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHptID0gYWN0aXZlRWwuJHpvb21lciQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBvZiB6bSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaS5tYXBwaW5nW2FjdC5hY3RdKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLm1hcHBpbmdbYWN0LmFjdF0oYWN0LCBhY3RpdmVFbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsLiR0b3VjaGFibGUkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB6b29tYWJsZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHpvb21lciA9IG5ldyBab29tKGVsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9LHpzaXphYmxlOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgenNpemUgPSBuZXcgWnNpemUoZWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0sZHJhZ2dhYmxlOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHJhZyA9IG5ldyBEcmFnKGVsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxubGV0IGZpbmdlciA9IGZpbmdlcnMuZmluZ2VyOyIsIlxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGNsYXNzIFJvdHtcclxuICAgICAgICBwcm90ZWN0ZWQgb3JpZ2luOmFueTtcclxuICAgICAgICBwcm90ZWN0ZWQgY210OmFueTtcclxuICAgICAgICBwcm90ZWN0ZWQgY2FjaGU6YW55O1xyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdHVzOmFueVtdO1xyXG5cclxuICAgICAgICB0YXJnZXQ6YW55O1xyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY2VudGVyOmFueTtcclxuICAgICAgICBwcm90ZWN0ZWQgb2Zmc2V0Om51bWJlcltdO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGVsOmFueSl7XHJcbiAgICAgICAgICAgIGlmICghZWwpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gZWw7XHJcbiAgICAgICAgICAgIGVsLiRyb3QkID0gdGhpcztcclxuICAgICAgICAgICAgbGV0IHBvcyA9IFtlbC5hc3R5bGUoW1wibGVmdFwiXSksIGVsLmFzdHlsZShbXCJ0b3BcIl0pXTtcclxuICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IHBvc1swXTtcclxuICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gcG9zWzFdO1xyXG4gICAgICAgICAgICBsZXQgcmMgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW4gPSB7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXI6W3JjLndpZHRoLzIsIHJjLmhlaWdodC8yXSwgXHJcbiAgICAgICAgICAgICAgICBhbmdsZTowLCBcclxuICAgICAgICAgICAgICAgIHNjYWxlOlsxLDFdLCBcclxuICAgICAgICAgICAgICAgIHBvczpbcGFyc2VGbG9hdChwb3NbMF0pLCBwYXJzZUZsb2F0KHBvc1sxXSldLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTpbcmMud2lkdGgsIHJjLmhlaWdodF1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5jbXQgPSB7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXI6W3JjLndpZHRoLzIsIHJjLmhlaWdodC8yXSwgXHJcbiAgICAgICAgICAgICAgICBhbmdsZTowLCBcclxuICAgICAgICAgICAgICAgIHNjYWxlOlsxLDFdLCBcclxuICAgICAgICAgICAgICAgIHBvczpbcGFyc2VGbG9hdChwb3NbMF0pLCBwYXJzZUZsb2F0KHBvc1sxXSldLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTpbcmMud2lkdGgsIHJjLmhlaWdodF1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5jYWNoZSA9IHtcclxuICAgICAgICAgICAgICAgIGNlbnRlcjpbcmMud2lkdGgvMiwgcmMuaGVpZ2h0LzJdLCBcclxuICAgICAgICAgICAgICAgIGFuZ2xlOjAsIFxyXG4gICAgICAgICAgICAgICAgc2NhbGU6WzEsMV0sIFxyXG4gICAgICAgICAgICAgICAgcG9zOltwYXJzZUZsb2F0KHBvc1swXSksIHBhcnNlRmxvYXQocG9zWzFdKV0sXHJcbiAgICAgICAgICAgICAgICBzaXplOltyYy53aWR0aCwgcmMuaGVpZ2h0XVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlci5zdHlsZS5sZWZ0ID0gJzUwJSc7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyLnN0eWxlLnRvcCA9ICc1MCUnO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlci5zdHlsZS53aWR0aCA9ICcwcHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlci5zdHlsZS5oZWlnaHQgPSAnMHB4JztcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUuYm9yZGVyID0gJ3NvbGlkIDBweCBibHVlJztcclxuXHJcbiAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKHRoaXMuY2VudGVyKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRPcmlnaW4odGhpcy5vcmlnaW4uY2VudGVyKTtcclxuICAgICAgICAgICAgZWwuc3R5bGUudHJhbnNmb3JtID0gXCJyb3RhdGUoMGRlZylcIjtcclxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdHVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByb3RhdGUoYXJnOmFueSwgdW5kZWY/OmFueSl7XHJcbiAgICAgICAgICAgIGlmICghYXJnKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgXHRcdFx0bGV0IGNhY2hlID0gdGhpcy5jYWNoZTtcclxuXHRcdFx0bGV0IG9yaWdpbiA9IHRoaXMuY210O1xyXG5cdFx0XHRsZXQgb2Zmc2V0ID0gdGhpcy5vZmZzZXQ7XHJcblx0XHRcdGxldCBhbmdsZSA9IGFyZy5hbmdsZSwgXHJcbiAgICAgICAgICAgICAgICBjZW50ZXIgPSBhcmcuY2VudGVyLCBcclxuICAgICAgICAgICAgICAgIHNjYWxlID0gYXJnLnNjYWxlLCBcclxuICAgICAgICAgICAgICAgIHBvcyA9IGFyZy5wb3MsIFxyXG4gICAgICAgICAgICAgICAgcmVzaXplID0gYXJnLnJlc2l6ZTtcclxuICAgICAgICAgICAgaWYgKCFvZmZzZXQpe1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gWzAsIDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjZW50ZXIgIT09IHVuZGVmKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucHVzaFN0YXR1cygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPcmlnaW4oY2VudGVyKTtcclxuICAgICAgICAgICAgICAgIGxldCBjc3RhdHVzID0gdGhpcy5wdXNoU3RhdHVzKCk7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGlzLmNvcnJlY3QoY3N0YXR1cywgb2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYW5nbGUgfHwgYW5nbGUgPT09IDApe1xyXG4gICAgICAgICAgICAgICAgY2FjaGUuYW5nbGUgPSBvcmlnaW4uYW5nbGUgKyBhbmdsZTtcclxuICAgICAgICAgICAgICAgIGNhY2hlLmFuZ2xlID0gY2FjaGUuYW5nbGUgJSAzNjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlc2l6ZSl7XHJcbiAgICAgICAgICAgICAgICBjYWNoZS5zaXplID0gW29yaWdpbi5zaXplWzBdICsgcmVzaXplWzBdLCBvcmlnaW4uc2l6ZVsxXSArIHJlc2l6ZVsxXV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FjaGUuc2l6ZVswXSA8IDEwKXtcclxuICAgICAgICAgICAgICAgICAgICBjYWNoZS5zaXplWzBdID0gMTA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FjaGUuc2l6ZVsxXSA8IDEwKXtcclxuICAgICAgICAgICAgICAgICAgICBjYWNoZS5zaXplWzFdID0gMTA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHNjYWxlKXtcclxuICAgICAgICAgICAgICAgIGlmICghKHNjYWxlIGluc3RhbmNlb2YgQXJyYXkpKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbiA9IHBhcnNlRmxvYXQoc2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlID0gW24sIG5dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FjaGUuc2NhbGUgPSBbb3JpZ2luLnNjYWxlWzBdICogc2NhbGVbMF0sIG9yaWdpbi5zY2FsZVsxXSAqIHNjYWxlWzFdXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocG9zKXtcclxuICAgICAgICAgICAgICAgIGNhY2hlLnBvcyA9IFtvcmlnaW4ucG9zWzBdICsgcG9zWzBdIC0gb2Zmc2V0WzBdLCBvcmlnaW4ucG9zWzFdICsgcG9zWzFdIC0gb2Zmc2V0WzFdXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWignICsgY2FjaGUuYW5nbGUgKyAnZGVnKSBzY2FsZSgnICsgY2FjaGUuc2NhbGVbMF0gKyAnLCcgKyBjYWNoZS5zY2FsZVsxXSArICcpJztcclxuXHRcdFx0dGhpcy50YXJnZXQuc3R5bGUubGVmdCA9IGNhY2hlLnBvc1swXSArICdweCc7XHJcblx0XHRcdHRoaXMudGFyZ2V0LnN0eWxlLnRvcCA9IGNhY2hlLnBvc1sxXSArICdweCc7XHJcbiAgICAgICAgICAgIGlmIChyZXNpemUpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUud2lkdGggPSBjYWNoZS5zaXplWzBdICsgJ3B4JztcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmhlaWdodCA9IGNhY2hlLnNpemVbMV0gKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXR1cygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBnZXRDZW50ZXIoKTpudW1iZXJbXXtcclxuICAgICAgICAgICAgbGV0IHJjID0gdGhpcy5jZW50ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBbcmMubGVmdCwgcmMudG9wXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHNldE9yaWdpbihwOm51bWJlcltdKTp2b2lke1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBwWzBdICsgXCJweCBcIiArIHBbMV0gKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBjb3JyZWN0KHN0YXR1czphbnksIHBvZmZzZXQ/Om51bWJlcltdKTpudW1iZXJbXXtcclxuICAgICAgICAgICAgaWYgKCFwb2Zmc2V0KXtcclxuICAgICAgICAgICAgICAgIHBvZmZzZXQgPSBbMCwgMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGQgPSBzdGF0dXMuZGVsdGE7XHJcbiAgICAgICAgICAgIGxldCB4ID0gcGFyc2VGbG9hdCh0aGlzLnRhcmdldC5hc3R5bGVbXCJsZWZ0XCJdKSAtIGQuY2VudGVyWzBdO1xyXG4gICAgICAgICAgICBsZXQgeSA9IHBhcnNlRmxvYXQodGhpcy50YXJnZXQuYXN0eWxlW1widG9wXCJdKSAtIGQuY2VudGVyWzFdO1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IFtwb2Zmc2V0WzBdICsgZC5jZW50ZXJbMF0sIHBvZmZzZXRbMV0gKyBkLmNlbnRlclsxXV07XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vZmZzZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBjb21taXRTdGF0dXMoKTp2b2lke1xyXG4gICAgICAgICAgICB0aGlzLmNtdCA9IHRoaXMuY2FjaGU7XHJcbiAgICAgICAgICAgIHRoaXMuY210LnBvcyA9IFtwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQpLCBwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LnN0eWxlLnRvcCldO1xyXG4gICAgICAgICAgICB0aGlzLmNtdC5zaXplID0gW3BhcnNlRmxvYXQodGhpcy50YXJnZXQuc3R5bGUud2lkdGgpLCBwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LnN0eWxlLmhlaWdodCldO1xyXG4gICAgICAgICAgICB0aGlzLmNhY2hlID0ge2FuZ2xlOjAsIHNjYWxlOlsxLDFdLCBwb3M6WzAsMF0sIHNpemU6WzAsMF19O1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IFswLCAwXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHB1c2hTdGF0dXMoKTp2b2lke1xyXG4gICAgICAgICAgICBsZXQgYyA9IHRoaXMuZ2V0Q2VudGVyKCk7XHJcbiAgICAgICAgICAgIGxldCBsID0gW3BhcnNlRmxvYXQodGhpcy50YXJnZXQuYXN0eWxlKFtcImxlZnRcIl0pKSxwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LmFzdHlsZShbXCJ0b3BcIl0pKV07XHJcbiAgICAgICAgICAgIGxldCBzOmFueSA9IHtjZW50ZXI6W2NbMF0sIGNbMV1dLCBwb3M6bH07XHJcbiAgICAgICAgICAgIGxldCBxID0gdGhpcy5zdGF0dXM7XHJcbiAgICAgICAgICAgIGxldCBwID0gcS5sZW5ndGggPiAwP3FbcS5sZW5ndGggLSAxXSA6IHM7XHJcbiAgICAgICAgICAgIHMuZGVsdGEgPSB7IGNlbnRlcjpbcy5jZW50ZXJbMF0gLSBwLmNlbnRlclswXSwgcy5jZW50ZXJbMV0gLSBwLmNlbnRlclsxXV0sXHJcbiAgICAgICAgICAgICAgICBwb3M6IFtzLnBvc1swXSAtIHAucG9zWzBdLCBzLnBvc1sxXSAtIHAucG9zWzFdXX07XHJcbiAgICAgICAgICAgIHFbcS5sZW5ndGhdID0gcztcclxuICAgICAgICAgICAgaWYgKHEubGVuZ3RoID4gNil7XHJcbiAgICAgICAgICAgICAgICBxLnNwbGljZSgwLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gUm90YXRvcihlbDphbnkpOmFueXtcclxuICAgICAgICBsZXQgciA9IGVsLiRyb3QkIHx8IG5ldyBSb3QoZWwpO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCJpbnRlcmZhY2UgU3RyaW5ne1xuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XG5cdGZvcm1hdCguLi5yZXN0QXJnczphbnlbXSk6c3RyaW5nO1xufVxuXG5TdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGggPSBmdW5jdGlvbihzdHI6c3RyaW5nKTpib29sZWFue1xuXHRyZXR1cm4gdGhpcy5pbmRleE9mKHN0cik9PTA7XG59XG5TdHJpbmcucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdHZhciBzID0gdGhpcztcblx0aWYgKCFhcmdzIHx8IGFyZ3MubGVuZ3RoIDwgMSkge1xuXHRcdHJldHVybiBzO1xuXHR9XG5cdHZhciByID0gcztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHJlZyA9IG5ldyBSZWdFeHAoJ1xcXFx7JyArIGkgKyAnXFxcXH0nKTtcblx0XHRyID0gci5yZXBsYWNlKHJlZywgYXJnc1tpXSk7XG5cdH1cblx0cmV0dXJuIHI7XG59OyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9mb3VuZGF0aW9uL3N0cmluZy50c1wiIC8+XG5cbkVsZW1lbnQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKHZhbDphbnkpOnZvaWR7XG4gICAgZnVuY3Rpb24gYWRkKHQ6YW55LCB2OmFueSk6dm9pZHtcblx0XHRpZiAodCl7XG5cdFx0XHRpZiAodHlwZW9mICh2KSA9PSAnb2JqZWN0Jyl7XG5cdFx0XHRcdGxldCB0bXAgPSB3by51c2Uodi50YXJnZXQpO1xuICAgICAgICAgICAgICAgIGlmICh0bXApe1xuICAgICAgICAgICAgICAgICAgICB2LnRhcmdldCA9IHRtcDtcbiAgICAgICAgICAgICAgICB9XG5cdFx0XHRcdGlmICghdi5tb2RlIHx8ICh2Lm1vZGUgPT0gXCJwcmVwZW5kXCIgJiYgdC5jaGlsZE5vZGVzLmxlbmd0aCA8IDEpKXtcblx0XHRcdFx0XHR2Lm1vZGUgPSBcImFwcGVuZFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2Lm1vZGUgPT0gXCJyZXBsYWNlXCIpe1xuXHRcdFx0XHRcdHQuaW5uZXJIVE1MID0gXCJcIjtcblx0XHRcdFx0XHR2Lm1vZGUgPSBcImFwcGVuZFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2Lm1vZGUgPT0gXCJwcmVwZW5kXCIpe1xuXHRcdFx0XHRcdHQuaW5zZXJ0QmVmb3JlKHYudGFyZ2V0LCB0LmNoaWxkTm9kZXNbMF0pO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHR0LmFwcGVuZENoaWxkKHYudGFyZ2V0KTtcblx0XHRcdFx0fSAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblx0XHRcdH1lbHNle1xuXHRcdFx0XHQkKHQpLnRleHQodik7XG5cdFx0XHR9XG5cdFx0fVxuXG4gICAgfVxuICAgIGlmICh3by51c2FibGUodmFsKSl7XG4gICAgICAgIGFkZCh0aGlzLCB2YWwpO1xuICAgIH1cblx0Zm9yKGxldCBpIGluIHZhbCl7XG5cdFx0bGV0IHYgPSB2YWxbaV07XG4gICAgXHRsZXQgdCA9IHRoaXNbXCIkXCIgKyBpXTtcbiAgICAgICAgYWRkKHQsIHYpO1xuXHR9ICAgICAgICAgICAgXG59O1xuXG5uYW1lc3BhY2Ugd297XG4gICAgLy8vIENvbnRhaW5zIGNyZWF0b3IgaW5zdGFuY2Ugb2JqZWN0XG4gICAgZXhwb3J0IGxldCBDcmVhdG9yczpDcmVhdG9yW10gPSBbXTtcblxuICAgIGZ1bmN0aW9uIGdldChzZWxlY3RvcjphbnkpOmFueXtcbiAgICAgICAgbGV0IHJsdDphbnkgPSBbXTtcbiAgICAgICAgaWYgKHNlbGVjdG9yKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBybHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmx0O1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBDdXJzb3J7XG4gICAgICAgIHBhcmVudDphbnk7XG4gICAgICAgIGJvcmRlcjphbnk7XG4gICAgICAgIHJvb3Q6YW55O1xuICAgICAgICBjdXJ0OmFueTtcbiAgICB9XG5cbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgQ3JlYXRvcntcbiAgICAgICAgaWQ6c3RyaW5nO1xuICAgICAgICBnZXQgSWQoKTpzdHJpbmd7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICAgICAgfVxuICAgICAgICBDcmVhdGUoanNvbjphbnksIGNzPzpDdXJzb3IpOmFueXtcbiAgICAgICAgICAgIGlmICghanNvbil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbyA9IHRoaXMuY3JlYXRlKGpzb24pO1xuICAgICAgICAgICAgaWYgKCFjcyl7XG4gICAgICAgICAgICAgICAgY3MgPSBuZXcgQ3Vyc29yKCk7XG4gICAgICAgICAgICAgICAgY3Mucm9vdCA9IG87XG4gICAgICAgICAgICAgICAgY3MucGFyZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBjcy5ib3JkZXIgPSBvO1xuICAgICAgICAgICAgICAgIGNzLmN1cnQgPSBvO1xuICAgICAgICAgICAgICAgIG8uY3Vyc29yID0gY3M7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgbmNzID0gbmV3IEN1cnNvcigpO1xuICAgICAgICAgICAgICAgIG5jcy5yb290ID0gY3Mucm9vdDtcbiAgICAgICAgICAgICAgICBuY3MucGFyZW50ID0gY3MuY3VydDtcbiAgICAgICAgICAgICAgICBuY3MuYm9yZGVyID0gY3MuYm9yZGVyO1xuICAgICAgICAgICAgICAgIG5jcy5jdXJ0ID0gbztcbiAgICAgICAgICAgICAgICBvLmN1cnNvciA9IG5jcztcbiAgICAgICAgICAgICAgICBjcyA9IG5jcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqc29uLmFsaWFzKXtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUuZGlyKGpzb24uYWxpYXMpO1xuICAgICAgICAgICAgICAgIGxldCBuID0ganNvbi5hbGlhcztcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5hbGlhcy5zdGFydHNXaXRoKFwiJFwiKSl7XG4gICAgICAgICAgICAgICAgICAgIG4gPSBqc29uLmFsaWFzLnN1YnN0cigxLCBqc29uLmFsaWFzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcy5ib3JkZXJbXCIkXCIgKyBuXSA9IG87XG4gICAgICAgICAgICAgICAgaWYgKGpzb24uYWxpYXMuc3RhcnRzV2l0aChcIiRcIikpe1xuICAgICAgICAgICAgICAgICAgICBjcy5ib3JkZXIgPSBvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVsZXRlIGpzb25bdGhpcy5JZF07XG4gICAgICAgICAgICB0aGlzLmV4dGVuZChvLCBqc29uKTtcbiAgICAgICAgICAgIGlmIChqc29uLm1hZGUpe1xuICAgICAgICAgICAgICAgIGpzb24ubWFkZS5jYWxsKG8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgby4kcm9vdCA9IGNzLnJvb3Q7XG4gICAgICAgICAgICBvLiRib3JkZXIgPSBjcy5ib3JkZXI7XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgY3JlYXRlKGpzb246YW55KTphbnk7XG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lkO1xuICAgICAgICBwcm90ZWN0ZWQgYXBwbHlhdHRyKGVsOmFueSwganNvbjphbnksIGk6c3RyaW5nLCBjczphbnkpe1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGVsW2ldO1xuICAgICAgICAgICAgaWYgKHRhcmdldCl7XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdGFyZ2V0O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZ0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh2dHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZXh0ZW5kKHRhcmdldCwganNvbltpXSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvdGVjdGVkIGFwcGx5cHJvcChlbDphbnksIGpzb246YW55LCBpOnN0cmluZywgY3M6YW55KXtcbiAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGlmIChlbFtpXSAmJiB0eXBlb2YoZWxbaV0pID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgb2JqZXh0ZW5kKGVsW2ldLCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGksIGpzb25baV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBhcHBlbmQoZWw6YW55LCBjaGlsZDphbnkpe1xuICAgICAgICBpZiAoZWwuYXBwZW5kICYmIHR5cGVvZihlbC5hcHBlbmQpID09ICdmdW5jdGlvbicpe1xuICAgICAgICAgICAgZWwuYXBwZW5kKGNoaWxkKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBlbC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gdXNhYmxlKGpzb246YW55KTpib29sZWFue1xuICAgICAgICBmb3IodmFyIGkgb2YgQ3JlYXRvcnMpe1xuICAgICAgICAgICAgaWYgKGpzb25baS5JZF0pe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gdXNlKGpzb246YW55LCBjcz86Q3Vyc29yKTphbnl7XG4gICAgICAgIGxldCBybHQ6YW55ID0gbnVsbDtcbiAgICAgICAgaWYgKCFqc29uIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcbiAgICAgICAgICAgIHJldHVybiBybHQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvbnRhaW5lcjphbnkgPSBudWxsO1xuICAgICAgICBpZiAoanNvbi4kY29udGFpbmVyJCl7XG4gICAgICAgICAgICBjb250YWluZXIgPSBqc29uLiRjb250YWluZXIkO1xuICAgICAgICAgICAgZGVsZXRlIGpzb24uJGNvbnRhaW5lciQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiAoanNvbikgPT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgcmx0ID0gZ2V0KGpzb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yKHZhciBpIG9mIENyZWF0b3JzKXtcbiAgICAgICAgICAgIGlmIChqc29uW2kuSWRdKXtcbiAgICAgICAgICAgICAgICBybHQgPSBpLkNyZWF0ZShqc29uLCBjcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnRhaW5lcil7XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmx0O1xuICAgIH1cblxuXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdXNlLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIGV4cG9ydCBjbGFzcyBEb21DcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmlkID0gXCJ0YWdcIjtcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0YWcgPSBqc29uW3RoaXMuaWRdO1xuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XG4gICAgICAgICAgICBpZiAodGFnID09ICcjdGV4dCcpe1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGFnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7IFxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgICAgIHZlcmlmeShpOnN0cmluZywganNvbjphbnkpe1xuICAgICAgICAgICAgaWYgKGkuc3RhcnRzV2l0aChcIiQkXCIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBseWF0dHI7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcIiRcIil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwbHljaGlsZDtcbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqZXh0ZW5kO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwbHlwcm9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWR7XG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgLy9kb21leHRlbmQobywganNvbik7XG4gICAgICAgICAgICAgICAgamV4dGVuZChvLCBqc29uLCB0aGlzKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgYXBwbHljaGlsZChlbDphbnksIGpzb246YW55LCBpOnN0cmluZywgY3M6YW55KXtcbiAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICBpZiAoanNvbltpXSBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGogb2YganNvbltpXSl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqLCBjcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqc29uW2ldLCBjcyk7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0ganNvbltpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZm91bmRhdGlvbi9kZWZpbml0aW9ucy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi91c2UudHNcIiAvPlxuXG5uYW1lc3BhY2Ugd297XG4gICAgZXhwb3J0IGNsYXNzIFN2Z0NyZWF0b3IgZXh0ZW5kcyBDcmVhdG9ye1xuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBcInNnXCI7XG4gICAgICAgIH1cbiAgICAgICAgY3JlYXRlKGpzb246YW55KTpOb2Rle1xuICAgICAgICAgICAgaWYgKGpzb24gPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdGFnID0ganNvblt0aGlzLmlkXTtcbiAgICAgICAgICAgIGxldCBlbDpOb2RlO1xuICAgICAgICAgICAgaWYgKHRhZyA9PSBcInN2Z1wiKXtcbiAgICAgICAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIHRhZyk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIHRhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH1cbiAgICAgICAgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZHtcbiAgICAgICAgICAgIGlmIChqc29uIGluc3RhbmNlb2YgTm9kZSB8fCBqc29uIGluc3RhbmNlb2YgRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBTVkdFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBzdmdleHRlbmQobywganNvbik7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoanNvbi4kICYmIG8gaW5zdGFuY2VvZiBOb2RlKXtcbiAgICAgICAgICAgICAgICBvLm5vZGVWYWx1ZSA9IGpzb24uJDtcbiAgICAgICAgICAgIH1lbHNlIGlmIChvLmV4dGVuZCl7XG4gICAgICAgICAgICAgICAgby5leHRlbmQoanNvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdmdleHRlbmQoZWw6YW55LCBqc29uOmFueSl7XG4gICAgICAgIGxldCBjcyA9IGVsLmN1cnNvcjtcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xuICAgICAgICAgICAgaWYgKGkuc3RhcnRzV2l0aChcIiQkXCIpKXtcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZWxbaV07XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdGFyZ2V0O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZ0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh2dHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmdleHRlbmQodGFyZ2V0LCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwiJFwiKXtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgIGlmIChqc29uW2ldIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGogb2YganNvbltpXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoaiwgY3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoanNvbltpXSwgY3MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2UgaWYgKGkuc3RhcnRzV2l0aChcIiRcIikpe1xuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxbaV0gJiYgdHlwZW9mKGVsW2ldKSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpleHRlbmQoZWxbaV0sIGpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKG51bGwsIGksIGpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdXNlLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2RvbWNyZWF0b3IudHNcIiAvPlxuXG5uYW1lc3BhY2Ugd297XG4gICAgZXhwb3J0IGxldCBXaWRnZXRzOmFueSA9IHt9O1xuXG4gICAgZXhwb3J0IGNsYXNzIFVpQ3JlYXRvciBleHRlbmRzIENyZWF0b3J7XG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IFwidWlcIjtcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB3ZyA9IGpzb25bdGhpcy5pZF07XG4gICAgICAgICAgICBpZiAoIVdpZGdldHNbd2ddKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGVsOk5vZGUgPSB1c2UoV2lkZ2V0c1t3Z10oKSk7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH1cbiAgICAgICAgdmVyaWZ5KGk6c3RyaW5nLCBqc29uOmFueSl7XG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFwcGx5YXR0cjtcbiAgICAgICAgICAgIH1lbHNlIGlmKGkgPT0gXCIkXCIpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFwcGx5Y2hpbGQ7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcInN0eWxlXCIpe1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmpleHRlbmQ7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBseXByb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZHtcbiAgICAgICAgICAgIGlmIChqc29uIGluc3RhbmNlb2YgTm9kZSB8fCBqc29uIGluc3RhbmNlb2YgRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgamV4dGVuZChvLCBqc29uLCB0aGlzKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgYXBwbHljaGlsZChlbDphbnksIGpzb246YW55LCBpOnN0cmluZywgY3M6YW55KXtcbiAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICBsZXQgamkgPSBqc29uW2ldO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcgJiYgIShqaSBpbnN0YW5jZW9mIEFycmF5KSl7XG4gICAgICAgICAgICAgICAgamkgPSBbamldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGppIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgICAgICAgIGxldCBub2RlcyA9IGVsLmNoaWxkTm9kZXM7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgajxqaS5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gamlbal07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3by5pc3dpZGdldChpdGVtKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWwudXNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC51c2UoaXRlbSwgY3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGl0ZW0sIGNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaiA8IG5vZGVzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamV4dGVuZChub2Rlc1tqXSwgaXRlbSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWwudXNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwudXNlKGl0ZW0sIGNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGl0ZW0sIGNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBqc29uW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGlzd2lkZ2V0KGpzb246YW55KTpib29sZWFue1xuICAgICAgICBpZiAoIWpzb24gfHwgIWpzb24udWkpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yKGxldCBpIGluIFdpZGdldHMpe1xuICAgICAgICAgICAgaWYgKGkgPT0ganNvbi51aSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVpbGRlci91c2UudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVpbGRlci9kb21jcmVhdG9yLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvc3ZnY3JlYXRvci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWlsZGVyL3VpY3JlYXRvci50c1wiIC8+XG5cbndvLkNyZWF0b3JzLmFkZChuZXcgd28uRG9tQ3JlYXRvcigpKTtcbndvLkNyZWF0b3JzLmFkZChuZXcgd28uU3ZnQ3JlYXRvcigpKTtcbndvLkNyZWF0b3JzLmFkZChuZXcgd28uVWlDcmVhdG9yKCkpO1xuIiwibmFtZXNwYWNlIHdve1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG9iamV4dGVuZChvOmFueSwganNvbjphbnkpe1xyXG4gICAgICAgIGZvcihsZXQgaSBpbiBqc29uKXtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZihqc29uW2ldKSA9PSAnb2JqZWN0JyAmJiBvW2ldICYmIHR5cGVvZihvW2ldKSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICBvYmpleHRlbmQob1tpXSwganNvbltpXSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgb1tpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwib2JqZXh0ZW5kLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSB3b3tcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBqZXh0ZW5kKHRhcmdldDphbnksIGpzb246YW55LCBiYWc6YW55KXtcclxuICAgICAgICBsZXQgY3MgPSB0YXJnZXQuY3Vyc29yO1xyXG4gICAgICAgIGZvcihsZXQgaSBpbiBqc29uKXtcclxuICAgICAgICAgICAgbGV0IGhhbmRsZXIgPSBiYWcudmVyaWZ5KGksIGpzb24pO1xyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXIpe1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IG9iamV4dGVuZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyKHRhcmdldCwganNvbiwgaSwgY3MpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy50c1wiIC8+XG5jbGFzcyBNb2JpbGVEZXZpY2V7XG5cdHN0YXRpYyBnZXQgQW5kcm9pZCAoKTpib29sZWFuIHtcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0FuZHJvaWQvaSk7XG5cdFx0aWYgKHIpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XG5cdFx0fVxuXHRcdHJldHVybiByIT0gbnVsbCAmJiByLmxlbmd0aD4wO1xuXHR9XG5cdHN0YXRpYyBnZXQgQmxhY2tCZXJyeSgpOmJvb2xlYW4ge1xuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQmxhY2tCZXJyeS9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIhPW51bGwgJiYgci5sZW5ndGggPiAwO1xuXHR9XG5cdHN0YXRpYyBnZXQgaU9TKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUGhvbmV8aVBhZHxpUG9kL2kpO1xuXHRcdGlmIChyKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gciAhPSBudWxsICYmIHIubGVuZ3RoID4gMDtcblx0fVxuXHRzdGF0aWMgZ2V0IE9wZXJhKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9PcGVyYSBNaW5pL2kpO1xuXHRcdGlmIChyKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gciAhPSBudWxsICYmIHIubGVuZ3RoID4gMDtcblx0fVxuXHRzdGF0aWMgZ2V0IFdpbmRvd3MoKTpib29sZWFuIHtcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0lFTW9iaWxlL2kpO1xuXHRcdGlmIChyKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gciE9IG51bGwgJiYgci5sZW5ndGggPjA7XG5cdH1cblx0c3RhdGljIGdldCBhbnkoKTpib29sZWFuIHtcblx0XHRyZXR1cm4gKE1vYmlsZURldmljZS5BbmRyb2lkIHx8IE1vYmlsZURldmljZS5CbGFja0JlcnJ5IHx8IE1vYmlsZURldmljZS5pT1MgfHwgTW9iaWxlRGV2aWNlLk9wZXJhIHx8IE1vYmlsZURldmljZS5XaW5kb3dzKTtcblx0fVxufVxuXG5jbGFzcyBCcm93c2Vye1xuXHQvLyBPcGVyYSA4LjArXG5cdHN0YXRpYyBnZXQgaXNPcGVyYSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuICghIXdpbmRvdy5vcHIgJiYgISF3aW5kb3cub3ByLmFkZG9ucykgfHwgISF3aW5kb3cub3BlcmEgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgT1BSLycpID49IDA7XG5cdH1cblx0XG5cdC8vIEZpcmVmb3ggMS4wK1xuXHRzdGF0aWMgZ2V0IGlzRmlyZWZveCgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIHR5cGVvZiB3aW5kb3cuSW5zdGFsbFRyaWdnZXIgIT09ICd1bmRlZmluZWQnO1xuXHR9XG5cdC8vIEF0IGxlYXN0IFNhZmFyaSAzKzogXCJbb2JqZWN0IEhUTUxFbGVtZW50Q29uc3RydWN0b3JdXCJcblx0c3RhdGljIGdldCBpc1NhZmFyaSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChIVE1MRWxlbWVudCkuaW5kZXhPZignQ29uc3RydWN0b3InKSA+IDA7XG5cdH0gXG5cdC8vIEludGVybmV0IEV4cGxvcmVyIDYtMTFcblx0c3RhdGljIGdldCBpc0lFKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gLypAY2Nfb24hQCovZmFsc2UgfHwgISFkb2N1bWVudC5kb2N1bWVudE1vZGU7XG5cdH1cblx0Ly8gRWRnZSAyMCtcblx0c3RhdGljIGdldCBpc0VkZ2UoKTpib29sZWFue1xuXHRcdHJldHVybiAhQnJvd3Nlci5pc0lFICYmICEhd2luZG93LlN0eWxlTWVkaWE7XG5cdH1cblx0Ly8gQ2hyb21lIDErXG5cdHN0YXRpYyBnZXQgaXNDaHJvbWUoKTpib29sZWFue1xuXHRcdHJldHVybiAhIXdpbmRvdy5jaHJvbWUgJiYgISF3aW5kb3cuY2hyb21lLndlYnN0b3JlO1xuXHR9XG5cdC8vIEJsaW5rIGVuZ2luZSBkZXRlY3Rpb25cblx0c3RhdGljIGdldCBpc0JsaW5rKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gKEJyb3dzZXIuaXNDaHJvbWUgfHwgQnJvd3Nlci5pc09wZXJhKSAmJiAhIXdpbmRvdy5DU1M7XG5cdH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRlZmluaXRpb25zLnRzXCIgLz5cblxuRWxlbWVudC5wcm90b3R5cGUuYXN0eWxlID0gZnVuY3Rpb24gYWN0dWFsU3R5bGUocHJvcHM6c3RyaW5nW10pIHtcblx0bGV0IGVsOkVsZW1lbnQgPSB0aGlzO1xuXHRsZXQgY29tcFN0eWxlOkNTU1N0eWxlRGVjbGFyYXRpb24gPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCk7XG5cdGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG5cdFx0bGV0IHN0eWxlOnN0cmluZyA9IGNvbXBTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BzW2ldKTtcblx0XHRpZiAoc3R5bGUgIT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIHN0eWxlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbm5hbWVzcGFjZSB3b3tcblx0Y2xhc3MgRGVzdHJveWVye1xuXHRcdGRpc3Bvc2luZzpib29sZWFuO1xuXHRcdGRlc3Ryb3lpbmc6Ym9vbGVhbjtcblx0XHRzdGF0aWMgY29udGFpbmVyOkhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHRzdGF0aWMgZGVzdHJveSh0YXJnZXQ6RWxlbWVudCl7XG5cdFx0XHRpZiAoIXRhcmdldC5kZXN0cm95U3RhdHVzKXtcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMgPSBuZXcgRGVzdHJveWVyKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGFyZ2V0LmRpc3Bvc2UgJiYgIXRhcmdldC5kZXN0cm95U3RhdHVzLmRpc3Bvc2luZyl7XG5cdFx0XHRcdHRhcmdldC5kZXN0cm95U3RhdHVzLmRpc3Bvc2luZyA9IHRydWU7XG5cdFx0XHRcdHRhcmdldC5kaXNwb3NlKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRhcmdldC5kZXN0cm95U3RhdHVzLmRlc3Ryb3lpbmcpe1xuXHRcdFx0XHR0YXJnZXQuZGVzdHJveVN0YXR1cy5kZXN0cm95aW5nID0gdHJ1ZTtcblx0XHRcdFx0RGVzdHJveWVyLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0YXJnZXQpO1xuXHRcdFx0XHRmb3IobGV0IGkgaW4gdGFyZ2V0KXtcblx0XHRcdFx0XHRpZiAoaS5pbmRleE9mKCckJykgPT0gMCl7XG5cdFx0XHRcdFx0XHRsZXQgdG1wOmFueSA9IHRhcmdldFtpXTtcblx0XHRcdFx0XHRcdGlmICh0bXAgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG5cdFx0XHRcdFx0XHRcdHRhcmdldFtpXSA9IG51bGw7XG5cdFx0XHRcdFx0XHRcdHRtcCA9IG51bGw7XG5cdFx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIHRhcmdldFtpXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0RGVzdHJveWVyLmNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZGVzdHJveSh0YXJnZXQ6YW55KTp2b2lke1xuXHRcdGlmICh0YXJnZXQubGVuZ3RoID4gMCB8fCB0YXJnZXQgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRmb3IobGV0IGkgb2YgdGFyZ2V0KXtcblx0XHRcdFx0RGVzdHJveWVyLmRlc3Ryb3koaSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KXtcblx0XHRcdFx0RGVzdHJveWVyLmRlc3Ryb3kodGFyZ2V0KTtcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gY2VudGVyU2NyZWVuKHRhcmdldDphbnkpe1xuXHRcdGxldCByZWN0ID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdHRhcmdldC5zdHlsZS5wb3NpdGlvbiA9IFwiZml4ZWRcIjtcblx0XHR0YXJnZXQuc3R5bGUubGVmdCA9IFwiNTAlXCI7XG5cdFx0dGFyZ2V0LnN0eWxlLnRvcCA9IFwiNTAlXCI7XG5cdFx0dGFyZ2V0LnN0eWxlLm1hcmdpblRvcCA9IC1yZWN0LmhlaWdodCAvIDIgKyBcInB4XCI7XG5cdFx0dGFyZ2V0LnN0eWxlLm1hcmdpbkxlZnQgPSAtcmVjdC53aWR0aCAvIDIgKyBcInB4XCI7XG5cdH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZm91bmRhdGlvbi9lbGVtZW50cy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxuXG5uYW1lc3BhY2Ugd297XG4gICAgV2lkZ2V0cy5jYXJkID0gZnVuY3Rpb24oKTphbnl7XG4gICAgICAgIHJldHVybiAge1xuICAgICAgICAgICAgdGFnOlwiZGl2XCIsXG4gICAgICAgICAgICBjbGFzczpcImNhcmRcIixcbiAgICAgICAgICAgIHVzZTpmdW5jdGlvbihqc29uOmFueSl7XG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gd28udXNlKGpzb24pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRib2R5KXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kYm9keS5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAkOltcbiAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwidGl0bGUgbm9zZWxlY3RcIiwgJDpbXG4gICAgICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJ0eHRcIiwgYWxpYXM6XCJ0aXRsZVwifSxcbiAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcImN0cmxzXCIsICQ6W1xuICAgICAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcIndidG5cIiwgb25jbGljazogZnVuY3Rpb24oZXZlbnQ6YW55KXt3by5kZXN0cm95KHRoaXMuJGJvcmRlcik7fSwgJDpcIlhcIn1cbiAgICAgICAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgICAgICBdfSxcbiAgICAgICAgICAgICAgICB7IHRhZzpcImRpdlwiLCBjbGFzczpcImJvZHlcIiwgYWxpYXM6XCJib2R5XCIgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZm91bmRhdGlvbi9lbGVtZW50cy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxuXG5uYW1lc3BhY2Ugd297XG4gICAgV2lkZ2V0cy5jb3ZlciA9IGZ1bmN0aW9uKCk6YW55e1xuICAgICAgICByZXR1cm57XG4gICAgICAgICAgICB0YWc6XCJkaXZcIixcbiAgICAgICAgICAgIGNsYXNzOlwiY292ZXJcIixcbiAgICAgICAgICAgIHN0eWxlOntkaXNwbGF5Oidub25lJ30sXG4gICAgICAgICAgICBzaG93OmZ1bmN0aW9uKGNhbGxiYWNrOmFueSk6dm9pZHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kY2hpbGQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRjaGlsZC5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKXtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxoaWRlOmZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJGNoaWxkKXtcbiAgICAgICAgICAgICAgICAgICAgd28uZGVzdHJveSh0aGlzLiRjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLiRjaGlsZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uaGlkZSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxtYWRlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCBjdiA9IChkb2N1bWVudC5ib2R5IGFzIGFueSkuJGdjdiQ7XG4gICAgICAgICAgICAgICAgaWYgKGN2KXtcbiAgICAgICAgICAgICAgICAgICAgd28uZGVzdHJveShjdik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcyk7XG4gICAgICAgICAgICAgICAgKGRvY3VtZW50LmJvZHkgYXMgYW55KS4kZ2N2JCA9IHRoaXM7XG4gICAgICAgICAgICB9LG9uY2xpY2s6ZnVuY3Rpb24oZXZlbnQ6YW55KXtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kJHRvdWNoY2xvc2Upe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LGFwcGVuZDpmdW5jdGlvbihjaGlsZDphbnkpe1xuICAgICAgICAgICAgICAgIHRoaXMuJGNoaWxkID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07IFxuICAgIH0gXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNvdmVyKGpzb246YW55KTphbnl7XG4gICAgICAgIGxldCBjdiA9IHdvLnVzZSh7XG4gICAgICAgICAgICB1aTonY292ZXInLFxuICAgICAgICAgICAgJCR0b3VjaGNsb3NlOnRydWUsXG4gICAgICAgICAgICAkOmpzb25cbiAgICAgICAgfSk7XG4gICAgICAgIGN2LnNob3coZnVuY3Rpb24oZWw6YW55KXtcbiAgICAgICAgICAgIHdvLmNlbnRlclNjcmVlbihlbC4kYm94IHx8IGVsLiRjaGlsZCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjdi5vbmhpZGUgPSBqc29uLm9uaGlkZTtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2ZvdW5kYXRpb24vZWxlbWVudHMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIFdpZGdldHMuZHJvcGRvd24gPSBmdW5jdGlvbigpOmFueXtcbiAgICAgICAgcmV0dXJuICB7XG4gICAgICAgICAgICB0YWc6XCJkaXZcIixcbiAgICAgICAgICAgIGNsYXNzOlwiZHJvcGRvd25cIixcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsOmFueSk6dm9pZHtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgaW4gdmFsKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHYgPSB2YWxbaV07XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ID0gdGhpc1tcIiRcIiArIGldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICh2KSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2Lm1vZGUgfHwgKHYubW9kZSA9PSBcInByZXBlbmRcIiAmJiB0LmNoaWxkTm9kZXMubGVuZ3RoIDwgMSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2Lm1vZGUgPSBcImFwcGVuZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodi5tb2RlID09IFwicmVwbGFjZVwiKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2Lm1vZGUgPSBcImFwcGVuZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodi5tb2RlID09IFwicHJlcGVuZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5pbnNlcnRCZWZvcmUodi50YXJnZXQsIHQuY2hpbGROb2Rlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuYXBwZW5kQ2hpbGQodi50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHQpLnRleHQodik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJDpbXG4gICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcInRpdGxlIG5vc2VsZWN0XCIsICQ6W1xuICAgICAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwidHh0XCIsIGFsaWFzOlwidGl0bGVcIn0sXG4gICAgICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJjdHJsc1wiLCAkOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJ3YnRuXCIsIG9uY2xpY2s6IGZ1bmN0aW9uKGV2ZW50OmFueSl7d28uZGVzdHJveSh0aGlzLiRib3JkZXIpO30sICQ6XCJYXCJ9XG4gICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgXX0sXG4gICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcImJvZHlcIiwgYWxpYXM6XCJib2R5XCJ9XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9mb3VuZGF0aW9uL2VsZW1lbnRzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9idWlsZGVyL3VpY3JlYXRvci50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBXaWRnZXRzLmxvYWRpbmcgPSBmdW5jdGlvbigpOmFueXtcbiAgICAgICAgcmV0dXJue1xuICAgICAgICAgICAgdGFnOlwiZGl2XCIsXG4gICAgICAgICAgICBjbGFzczpcImxvYWRpbmdcIixcbiAgICAgICAgICAgIG1hZGU6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbGV0IHAxID0gd28udXNlKHt1aTpcImFyY1wifSk7XG4gICAgICAgICAgICAgICAgcDEuc2V0QXR0cmlidXRlTlMobnVsbCwgXCJjbGFzc1wiLCBcImFyYyBwMVwiKTtcbiAgICAgICAgICAgICAgICBwMS51cGRhdGUoWzE2LCA0OF0sIDE2LCAyNzApO1xuICAgICAgICAgICAgICAgIHRoaXMuJHNib3guYXBwZW5kQ2hpbGQocDEpOyAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIGxldCBwMiA9IHdvLnVzZSh7dWk6XCJhcmNcIn0pO1xuICAgICAgICAgICAgICAgIHAyLnNldEF0dHJpYnV0ZU5TKG51bGwsIFwiY2xhc3NcIiwgXCJhcmMgcDFcIik7XG4gICAgICAgICAgICAgICAgcDIudXBkYXRlKFsxNiwgNDhdLCAxNiwgMjcwKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRzYm94LmFwcGVuZENoaWxkKHAyKTtcblxuICAgICAgICAgICAgICAgIC8vJGVsZW1lbnQudmVsb2NpdHkoeyBvcGFjaXR5OiAxIH0sIHsgZHVyYXRpb246IDEwMDAgfSk7XG4gICAgICAgICAgICAgICAgcDEuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gXCIzMnB4IDMycHhcIjtcbiAgICAgICAgICAgICAgICBwMi5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBcIjUwJSA1MCVcIjtcblxuICAgICAgICAgICAgICAgIGxldCB0MSA9IDIwMDAsIHQyPTE0MDA7XG4gICAgICAgICAgICAgICAgKCQocDEpIGFzIGFueSkudmVsb2NpdHkoe3JvdGF0ZVo6XCItPTM2MGRlZ1wifSwge2R1cmF0aW9uOnQxLCBlYXNpbmc6XCJsaW5lYXJcIn0pO1xuICAgICAgICAgICAgICAgIHRoaXMuJGhhbmRsZTEgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICgkKHAxKSBhcyBhbnkpLnZlbG9jaXR5KHtyb3RhdGVaOlwiLT0zNjBkZWdcIn0sIHtkdXJhdGlvbjp0MSwgZWFzaW5nOlwibGluZWFyXCJ9KTtcbiAgICAgICAgICAgICAgICB9LCB0MSk7XG4gICAgICAgICAgICAgICAgKCQocDIpIGFzIGFueSkudmVsb2NpdHkoe3JvdGF0ZVo6XCIrPTM2MGRlZ1wifSwge2R1cmF0aW9uOnQyLCBlYXNpbmc6XCJsaW5lYXJcIiwgbG9vcDp0cnVlfSk7XG4gICAgICAgICAgICB9LCQ6e1xuICAgICAgICAgICAgICAgIHNnOlwic3ZnXCIsXG4gICAgICAgICAgICAgICAgYWxpYXM6XCJzYm94XCIsXG4gICAgICAgICAgICAgICAgc3R5bGU6e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDo2NCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OjY0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9OyBcbiAgICB9OyBcbiAgICBXaWRnZXRzLmFyYyA9IGZ1bmN0aW9uKCk6YW55e1xuICAgICAgICByZXR1cm57XG4gICAgICAgICAgICBzZzpcInBhdGhcIixcbiAgICAgICAgICAgIHVwZGF0ZTpmdW5jdGlvbihjZW50ZXI6bnVtYmVyW10sIHJhZGl1czpudW1iZXIsIGFuZ2xlOm51bWJlcik6dm9pZHtcbiAgICAgICAgICAgICAgICBsZXQgcGVuZCA9IHBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyWzBdLCBjZW50ZXJbMV0sIHJhZGl1cywgYW5nbGUpO1xuICAgICAgICAgICAgICAgIGxldCBwc3RhcnQgPSBbY2VudGVyWzBdICsgcmFkaXVzLCBjZW50ZXJbMV1dO1xuICAgICAgICAgICAgICAgIGxldCBkID0gW1wiTVwiICsgcHN0YXJ0WzBdLCBwc3RhcnRbMV0sIFwiQVwiICsgcmFkaXVzLCByYWRpdXMsIFwiMCAxIDBcIiwgcGVuZFswXSwgcGVuZFsxXV07XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcImRcIiwgZC5qb2luKFwiIFwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBmdW5jdGlvbiBwb2xhclRvQ2FydGVzaWFuKGNlbnRlclg6bnVtYmVyLCBjZW50ZXJZOm51bWJlciwgcmFkaXVzOm51bWJlciwgYW5nbGVJbkRlZ3JlZXM6bnVtYmVyKSB7XG4gICAgICAgIGxldCBhbmdsZUluUmFkaWFucyA9IGFuZ2xlSW5EZWdyZWVzICogTWF0aC5QSSAvIDE4MC4wO1xuICAgICAgICBsZXQgeCA9IGNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XG4gICAgICAgIGxldCB5ID0gY2VudGVyWSArIHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcbiAgICAgICAgcmV0dXJuIFt4LHldO1xuICAgIH1cbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
