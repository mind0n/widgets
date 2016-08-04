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
Element.prototype.set = function (val, undef) {
    if (val === undef) {
        return;
    }
    function add(t, v) {
        function _add(t, v, mode) {
            if (v.mode == "prepend") {
                t.insertBefore(v, t.childNodes[0]);
            }
            else {
                t.appendChild(v);
            }
        }
        if (t) {
            if (v === undef) {
                t.innerHTML = '';
                return true;
            }
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
                var vals = val.target;
                if (!vals.length) {
                    _add(t, vals, v.mode);
                }
                else {
                    for (var _i = 0, vals_1 = vals; _i < vals_1.length; _i++) {
                        var i = vals_1[_i];
                        _add(t, i, v.mode);
                    }
                }
            }
            else {
                $(t).text(v);
            }
        }
        return false;
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
                        wo.jextend.call(this, target, json[i], this);
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
        Creator.prototype.applychild = function (el, json, i, cs) {
            var type = typeof json[i];
            if (json[i] instanceof Array) {
                for (var _i = 0, _a = json[i]; _i < _a.length; _i++) {
                    var j = _a[_i];
                    var child = use(j, cs);
                    if (child != null) {
                        append(el, child);
                    }
                }
            }
            else if (type == 'object') {
                var child = use(json[i], cs);
                if (child != null) {
                    append(el, child);
                }
                else {
                    debugger;
                }
            }
            else {
                el.innerHTML = json[i];
            }
        };
        Creator.prototype.applyprop = function (el, json, i, cs) {
            var type = typeof json[i];
            if (type == "function") {
                el[i] = json[i];
            }
            else {
                if (el[i] && typeof (el[i]) == 'object' && type == 'object') {
                    wo.objextend(el[i], json[i]);
                }
                else if (type == 'object') {
                    el[i] = json[i];
                }
                else {
                    this.setattr(el, json, i);
                }
            }
        };
        Creator.prototype.setattr = function (el, json, i) {
            el.setAttribute(i, json[i]);
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
                wo.jextend.call(this, o, json, this);
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
        SvgCreator.prototype.verify = function (i, json) {
            if (i.startsWith("$$")) {
                return this.applyattr;
            }
            else if (i == '$') {
                return this.applychild;
            }
            else if (i.startsWith("$")) {
                return wo.objextend;
            }
            else {
                return this.applyprop;
            }
        };
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
                //svgextend(o, json);
                wo.jextend.call(this, o, json, this);
            }
            else if (json.$ && o instanceof Node) {
                o.nodeValue = json.$;
            }
            else if (o.extend) {
                o.extend(json);
            }
        };
        SvgCreator.prototype.setattr = function (el, json, i) {
            return el.setAttributeNS(null, i, json[i]);
        };
        return SvgCreator;
    }(wo.Creator));
    wo.SvgCreator = SvgCreator;
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
                wo.jextend.call(this, o, json, this);
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
                            wo.jextend.call(this, nodes[j], item, this);
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
            handler.call(this, target, json, i, cs);
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
            onset: function (val) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHMiLCJmaW5nZXJzL3BhdHRlcm5zLnRzIiwiZmluZ2Vycy9yZWNvZ25pemVyLnRzIiwiZmluZ2Vycy90b3VjaC50cyIsImZpbmdlcnMvem9vbWVyLnRzIiwiZmluZ2Vycy9maW5nZXIudHMiLCJmaW5nZXJzL3JvdGF0b3IudHMiLCJ3by9mb3VuZGF0aW9uL3N0cmluZy50cyIsIndvL2J1aWxkZXIvdXNlLnRzIiwid28vYnVpbGRlci9kb21jcmVhdG9yLnRzIiwid28vYnVpbGRlci9zdmdjcmVhdG9yLnRzIiwid28vYnVpbGRlci91aWNyZWF0b3IudHMiLCJ3by93by50cyIsIndvL2J1aWxkZXIvb2JqZXh0ZW5kLnRzIiwid28vYnVpbGRlci9leHRlbmRlci50cyIsIndvL2ZvdW5kYXRpb24vZGV2aWNlLnRzIiwid28vZm91bmRhdGlvbi9lbGVtZW50cy50cyIsIndvL3dpZGdldHMvY2FyZC9jYXJkLnRzIiwid28vd2lkZ2V0cy9jb3Zlci9jb3Zlci50cyIsIndvL3dpZGdldHMvZHJvcGRvd24vZHJvcGRvd24udHMiLCJ3by93aWRnZXRzL2xvYWRpbmcvbG9hZGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFtQ0EsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxJQUFRO0lBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzFCLENBQUMsQ0FBQTtBQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsU0FBa0I7SUFDbkQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNwQixHQUFHLENBQUEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztRQUMvQixpQkFBaUI7UUFDakIsSUFBSSxHQUFHLEdBQUcsSUFB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Q0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNoRSxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDOUQsSUFBSSxLQUFLLEdBQUcsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUMsQ0FBQzt3QkFFNUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQzdCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUU5QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDNUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBRTNCLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzt3QkFDdEQsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO3dCQUV2RCxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ3JELEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMs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QUcsQ0FBQyxDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDNUYsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFDUyx3QkFBVSxHQUFwQjtZQUNJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsR0FBTyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUMsQ0FBQyxFQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENB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d3tcclxuXHRvcHI6YW55O1xyXG5cdG9wZXJhOmFueTtcclxuXHRjaHJvbWU6YW55O1xyXG5cdFN0eWxlTWVkaWE6YW55O1xyXG5cdEluc3RhbGxUcmlnZ2VyOmFueTtcclxuXHRDU1M6YW55O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRG9jdW1lbnR7XHJcblx0ZG9jdW1lbnRNb2RlOmFueTtcclxufVxyXG5cclxuLy8gRWxlbWVudC50c1xyXG5pbnRlcmZhY2UgRWxlbWVudHtcclxuXHRbbmFtZTpzdHJpbmddOmFueTtcclxuXHRhc3R5bGUoc3R5bGVzOnN0cmluZ1tdKTpzdHJpbmc7XHJcblx0c2V0KHZhbDphbnkpOnZvaWQ7XHJcblx0ZGVzdHJveVN0YXR1czphbnk7XHJcblx0ZGlzcG9zZSgpOmFueTtcclxufVxyXG5cclxuaW50ZXJmYWNlIE5vZGV7XHJcblx0Y3Vyc29yOmFueTtcclxufVxyXG5cclxuaW50ZXJmYWNlIFN0cmluZ3tcclxuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XHJcbn1cclxuXHJcbmludGVyZmFjZSBBcnJheTxUPntcclxuXHRhZGQoaXRlbTpUKTp2b2lkO1xyXG5cdGNsZWFyKGRlbD86Ym9vbGVhbik6dm9pZDtcclxufVxyXG5cclxuQXJyYXkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChpdGVtOmFueSkge1xyXG5cdHRoaXNbdGhpcy5sZW5ndGhdID0gaXRlbTtcclxufVxyXG5cclxuQXJyYXkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKGtlZXBhbGl2ZT86Ym9vbGVhbikge1xyXG5cdGxldCBuID0gdGhpcy5sZW5ndGg7XHJcblx0Zm9yKGxldCBpID0gbiAtIDE7IGkgPj0gMDsgaS0tKXtcclxuXHRcdC8vZGVsZXRlIHRoaXNbaV07XHJcblx0XHRsZXQgdG1wID0gdGhpcy5wb3AoKTtcclxuXHRcdHRtcCA9IG51bGw7XHJcblx0fVxyXG59XHJcbiIsIlxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFuO1xyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTphbnk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBQYXR0ZXJuczphbnkgPSB7fTtcclxuICAgIFxyXG4gICAgY2xhc3MgVG91Y2hlZFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAxICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2hlbmRcIiAmJiBxdWV1ZS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLCBvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgcHJldiA9IHF1ZXVlWzFdO1xyXG4gICAgICAgICAgICAvL2RlYnVnZ2VyO1xyXG4gICAgICAgICAgICBpZiAocHJldiAmJiBwcmV2Lmxlbmd0aCA9PSAxKXtcclxuICAgICAgICAgICAgICAgIGxldCBhY3QgPSBwcmV2WzBdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRyYWcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmIChvdXRxICE9IG51bGwgJiYgb3V0cS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFjdDphbnkgPSBvdXRxWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWN0ICYmIChwYWN0LmFjdCA9PSBcImRyYWdnaW5nXCIgfHwgcGFjdC5hY3QgPT0gXCJkcmFnc3RhcnRcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRyYWcpeyBcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaTwzOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocVswXS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJ0b3VjaGVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBEcmFnZ2luZ1BhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSBcclxuICAgICAgICAgICAgICAgICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2htb3ZlXCIgXHJcbiAgICAgICAgICAgICAgICAmJiBxdWV1ZS5sZW5ndGggPiAyO1xyXG4gICAgICAgICAgICBpZiAocmx0KXtcclxuICAgICAgICAgICAgICAgIHJsdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgbGV0IHMxID0gcXVldWVbMl07XHJcbiAgICAgICAgICAgICAgICBsZXQgczIgPSBxdWV1ZVsxXTtcclxuICAgICAgICAgICAgICAgIGlmIChzMS5sZW5ndGggPT0gMSAmJiBzMi5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGExID0gczFbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGEyID0gczJbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGExLmFjdCA9PSBcInRvdWNoc3RhcnRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhMS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIgJiYgYTIuYWN0ID09IFwidG91Y2htb3ZlXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBybHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmIChhMS5hY3QgPT0gXCJ0b3VjaG1vdmVcIiAmJiBhMi5hY3QgPT0gXCJ0b3VjaG1vdmVcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCBwcmV2ID0gcXVldWVbMl07XHJcbiAgICAgICAgICAgIGlmIChwcmV2Lmxlbmd0aCA9PSAxKXtcclxuICAgICAgICAgICAgICAgIGxldCBhY3QgPSBwcmV2WzBdO1xyXG4gICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGFjdC5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdDpcImRyYWdzdGFydFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmIChhY3QuYWN0ID09IFwidG91Y2htb3ZlXCIgJiYgb3V0cS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmFjdCA9IG91dHFbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhY3QuYWN0ID09IFwiZHJhZ3N0YXJ0XCIgfHwgcmFjdC5hY3QgPT0gXCJkcmFnZ2luZ1wiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdDpcImRyYWdnaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgRHJvcFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAxICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2hlbmRcIiAmJiBxdWV1ZS5sZW5ndGggPiAwICYmIG91dHEubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSxvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICAvL2xldCBwcmV2ID0gcXVldWVbMV07XHJcbiAgICAgICAgICAgIGxldCBhY3QgPSBvdXRxWzBdO1xyXG4gICAgICAgICAgICBpZiAoYWN0LmFjdCA9PSBcImRyYWdnaW5nXCIgfHwgYWN0LmFjdCA9PSBcImRyYWdzdGFydFwiKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0OlwiZHJvcHBlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgRGJsVG91Y2hlZFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNoZW5kXCIgJiYgcXVldWUubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IHByZXYgPSBxdWV1ZVsxXTtcclxuICAgICAgICAgICAgaWYgKHByZXYgJiYgcHJldi5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0ID0gcHJldlswXTtcclxuICAgICAgICAgICAgICAgIGlmIChvdXRxICE9IG51bGwgJiYgb3V0cS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFjdDphbnkgPSBvdXRxWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWN0ICYmIHBhY3QuYWN0ID09IFwidG91Y2hlZFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjdC5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIgfHwgYWN0LmFjdCA9PSBcInRvdWNobW92ZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhY3QudGltZSAtIHBhY3QudGltZSA8IDUwMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0OlwiZGJsdG91Y2hlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdDpcInRvdWNoZWRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGNBbmdsZShhOmlhY3QsIGI6aWFjdCwgbGVuOm51bWJlcik6bnVtYmVye1xyXG4gICAgICAgIGxldCBhZyA9IE1hdGguYWNvcygoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKS9sZW4pIC8gTWF0aC5QSSAqIDE4MDtcclxuICAgICAgICBpZiAoYi5jcG9zWzFdIDwgYS5jcG9zWzFdKXtcclxuICAgICAgICAgICAgYWcqPS0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYWc7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgWm9vbVN0YXJ0UGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDIgXHJcbiAgICAgICAgICAgICAgICAmJiAoKGFjdHNbMF0uYWN0ID09IFwidG91Y2hzdGFydFwiIHx8IGFjdHNbMV0uYWN0ID09IFwidG91Y2hzdGFydFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIHx8KG91dHEubGVuZ3RoID4gMCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgYWN0c1swXS5hY3QgPT0gXCJ0b3VjaG1vdmVcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgYWN0c1sxXS5hY3QgPT0gXCJ0b3VjaG1vdmVcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgb3V0cVswXS5hY3QgIT0gXCJ6b29taW5nXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIG91dHFbMF0uYWN0ICE9IFwiem9vbXN0YXJ0XCIgKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCBhY3RzID0gcXVldWVbMF07XHJcbiAgICAgICAgICAgIGxldCBhOmlhY3QgPSBhY3RzWzBdO1xyXG4gICAgICAgICAgICBsZXQgYjppYWN0ID0gYWN0c1sxXTtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IE1hdGguc3FydCgoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKSooYi5jcG9zWzBdIC0gYS5jcG9zWzBdKSArIChiLmNwb3NbMV0gLSBhLmNwb3NbMV0pKihiLmNwb3NbMV0gLSBhLmNwb3NbMV0pKTtcclxuICAgICAgICAgICAgbGV0IG93aWR0aCA9IE1hdGguYWJzKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSk7XHJcbiAgICAgICAgICAgIGxldCBvaGVpZ2h0ID0gTWF0aC5hYnMoYi5jcG9zWzFdIC0gYS5jcG9zWzFdKTtcclxuICAgICAgICAgICAgbGV0IGFnID0gY2FsY0FuZ2xlKGEsIGIsIGxlbik7IC8vTWF0aC5hY29zKChiLmNwb3NbMF0gLSBhLmNwb3NbMF0pL2xlbikgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgICAgICAgICBsZXQgcjppYWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgYWN0Olwiem9vbXN0YXJ0XCIsXHJcbiAgICAgICAgICAgICAgICBjcG9zOlsoYS5jcG9zWzBdICsgYi5jcG9zWzBdKS8yLCAoYS5jcG9zWzFdICsgYi5jcG9zWzFdKS8yXSxcclxuICAgICAgICAgICAgICAgIGxlbjpsZW4sXHJcbiAgICAgICAgICAgICAgICBhbmdsZTphZyxcclxuICAgICAgICAgICAgICAgIG93aWR0aDpvd2lkdGgsXHJcbiAgICAgICAgICAgICAgICBvaGVpZ2h0Om9oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB0aW1lOmEudGltZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgWm9vbVBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAyIFxyXG4gICAgICAgICAgICAgICAgJiYgKGFjdHNbMF0uYWN0ICE9IFwidG91Y2hlbmRcIiAmJiBhY3RzWzFdLmFjdCAhPSBcInRvdWNoZW5kXCIpXHJcbiAgICAgICAgICAgICAgICAmJiAoYWN0c1swXS5hY3QgPT0gXCJ0b3VjaG1vdmVcIiB8fCBhY3RzWzFdLmFjdCA9PSBcInRvdWNobW92ZVwiKVxyXG4gICAgICAgICAgICAgICAgJiYgb3V0cS5sZW5ndGggPiAwXHJcbiAgICAgICAgICAgICAgICAmJiAob3V0cVswXS5hY3QgPT0gXCJ6b29tc3RhcnRcIiB8fCBvdXRxWzBdLmFjdCA9PSBcInpvb21pbmdcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCBhY3RzID0gcXVldWVbMF07XHJcbiAgICAgICAgICAgIGxldCBhOmlhY3QgPSBhY3RzWzBdO1xyXG4gICAgICAgICAgICBsZXQgYjppYWN0ID0gYWN0c1sxXTtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IE1hdGguc3FydCgoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKSooYi5jcG9zWzBdIC0gYS5jcG9zWzBdKSArIChiLmNwb3NbMV0gLSBhLmNwb3NbMV0pKihiLmNwb3NbMV0gLSBhLmNwb3NbMV0pKTtcclxuICAgICAgICAgICAgbGV0IGFnID0gY2FsY0FuZ2xlKGEsIGIsIGxlbik7IC8vTWF0aC5hY29zKChiLmNwb3NbMF0gLSBhLmNwb3NbMF0pL2xlbikgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgICAgICAgICBsZXQgb3dpZHRoID0gTWF0aC5hYnMoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKTtcclxuICAgICAgICAgICAgbGV0IG9oZWlnaHQgPSBNYXRoLmFicyhiLmNwb3NbMV0gLSBhLmNwb3NbMV0pO1xyXG4gICAgICAgICAgICBsZXQgcjppYWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgYWN0Olwiem9vbWluZ1wiLFxyXG4gICAgICAgICAgICAgICAgY3BvczpbKGEuY3Bvc1swXSArIGIuY3Bvc1swXSkvMiwgKGEuY3Bvc1sxXSArIGIuY3Bvc1sxXSkvMl0sXHJcbiAgICAgICAgICAgICAgICBsZW46bGVuLFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6YWcsXHJcbiAgICAgICAgICAgICAgICBvd2lkdGg6b3dpZHRoLFxyXG4gICAgICAgICAgICAgICAgb2hlaWdodDpvaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgdGltZTphLnRpbWVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFpvb21FbmRQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gb3V0cS5sZW5ndGggPiAwIFxyXG4gICAgICAgICAgICAgICAgJiYgKG91dHFbMF0uYWN0ID09IFwiem9vbXN0YXJ0XCIgfHwgb3V0cVswXS5hY3QgPT0gXCJ6b29taW5nXCIpXHJcbiAgICAgICAgICAgICAgICAmJiBhY3RzLmxlbmd0aCA8PTI7XHJcbiAgICAgICAgICAgIGlmIChybHQpe1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmRpcihhY3RzKTtcclxuICAgICAgICAgICAgICAgIGlmIChhY3RzLmxlbmd0aCA8IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpIG9mIGFjdHMpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaS5hY3QgPT0gXCJ0b3VjaGVuZFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IHI6aWFjdCA9IHtcclxuICAgICAgICAgICAgICAgIGFjdDpcInpvb21lbmRcIixcclxuICAgICAgICAgICAgICAgIGNwb3M6WzAsIDBdLFxyXG4gICAgICAgICAgICAgICAgbGVuOjAsXHJcbiAgICAgICAgICAgICAgICBhbmdsZTowLFxyXG4gICAgICAgICAgICAgICAgb3dpZHRoOjAsXHJcbiAgICAgICAgICAgICAgICBvaGVpZ2h0OjAsXHJcbiAgICAgICAgICAgICAgICB0aW1lOm5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgUGF0dGVybnMuem9vbWVuZCA9IG5ldyBab29tRW5kUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMuem9vbWluZyA9IG5ldyBab29tUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMuem9vbXN0YXJ0ID0gbmV3IFpvb21TdGFydFBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLmRyYWdnaW5nID0gbmV3IERyYWdnaW5nUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMuZHJvcHBlZCA9IG5ldyBEcm9wUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMudG91Y2hlZCA9IG5ldyBUb3VjaGVkUGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMuZGJsdG91Y2hlZCA9IG5ldyBEYmxUb3VjaGVkUGF0dGVybigpO1xyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi93by9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGF0dGVybnMudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIGZpbmdlcnN7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIGlhY3R7XHJcbiAgICAgICAgYWN0OnN0cmluZyxcclxuICAgICAgICBjcG9zOm51bWJlcltdLFxyXG4gICAgICAgIHJwb3M/Om51bWJlcltdLFxyXG4gICAgICAgIG9oZWlnaHQ/Om51bWJlcixcclxuICAgICAgICBvd2lkdGg/Om51bWJlcixcclxuICAgICAgICBsZW4/Om51bWJlcixcclxuICAgICAgICBhbmdsZT86bnVtYmVyLFxyXG4gICAgICAgIHRpbWU/Om51bWJlclxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZWNvZ25pemVye1xyXG4gICAgICAgIGlucXVldWU6YW55W10gPSBbXTtcclxuICAgICAgICBvdXRxdWV1ZTppYWN0W10gPSBbXTtcclxuICAgICAgICBwYXR0ZXJuczppcGF0dGVybltdID0gW107XHJcbiAgICAgICAgY2ZnOmFueTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoY2ZnOmFueSl7XHJcbiAgICAgICAgICAgIGxldCBkZWZwYXR0ZXJucyA9IFtcInpvb21lbmRcIiwgXCJ6b29tc3RhcnRcIiwgXCJ6b29taW5nXCIsIFwiZGJsdG91Y2hlZFwiLCBcInRvdWNoZWRcIiwgXCJkcm9wcGVkXCIsIFwiZHJhZ2dpbmdcIl07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWNmZyl7XHJcbiAgICAgICAgICAgICAgICBjZmcgPSB7cGF0dGVybnM6ZGVmcGF0dGVybnN9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIWNmZy5wYXR0ZXJucyl7XHJcbiAgICAgICAgICAgICAgICBjZmcucGF0dGVybnMgPSBkZWZwYXR0ZXJucztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jZmcgPSBjZmc7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaSBvZiBjZmcucGF0dGVybnMpe1xyXG4gICAgICAgICAgICAgICAgaWYgKFBhdHRlcm5zW2ldKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdHRlcm5zLmFkZChQYXR0ZXJuc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYXJzZShhY3RzOmlhY3RbXSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNmZy5xbGVuKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2ZnLnFsZW4gPSAxMjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pbnF1ZXVlLnNwbGljZSgwLCAwLCBhY3RzKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaW5xdWV1ZS5sZW5ndGggPiB0aGlzLmNmZy5xbGVuKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5xdWV1ZS5zcGxpY2UodGhpcy5pbnF1ZXVlLmxlbmd0aCAtIDEsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5jZmcub24gJiYgdGhpcy5jZmcub24udGFwKXtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSBvZiBhY3RzKXtcclxuICAgICAgICAgICAgICAgICAgICAvL2FjdHMubGVuZ3RoID49IDEgJiYgYWN0c1swXS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIgJiZcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNmZy5vbi50YXAoYWN0c1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBwYXR0ZXJuIG9mIHRoaXMucGF0dGVybnMpe1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhdHRlcm4udmVyaWZ5KGFjdHMsIHRoaXMuaW5xdWV1ZSwgdGhpcy5vdXRxdWV1ZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBybHQgPSBwYXR0ZXJuLnJlY29nbml6ZSh0aGlzLmlucXVldWUsIHRoaXMub3V0cXVldWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChybHQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm91dHF1ZXVlLnNwbGljZSgwLCAwLCBybHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vdXRxdWV1ZS5sZW5ndGggPiB0aGlzLmNmZy5xbGVuKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3V0cXVldWUuc3BsaWNlKHRoaXMub3V0cXVldWUubGVuZ3RoIC0gMSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHEgPSB0aGlzLmlucXVldWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5xdWV1ZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxLmNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNmZy5vbiAmJiB0aGlzLmNmZy5vbltybHQuYWN0XSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNmZy5vbltybHQuYWN0XShybHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNmZy5vbnJlY29nbml6ZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZmcub25yZWNvZ25pemVkKHJsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInJlY29nbml6ZXIudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIGZpbmdlcnN7XHJcbiAgICBsZXQgaW5pdGVkOmJvb2xlYW4gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgY2xhc3Mgem9vbXNpbXtcclxuICAgICAgICBvcHBvOmlhY3Q7XHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZShhY3Q6aWFjdCk6dm9pZHtcclxuICAgICAgICAgICAgbGV0IG0gPSBbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLzIsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQvMl07XHJcbiAgICAgICAgICAgIHRoaXMub3BwbyA9IHthY3Q6YWN0LmFjdCwgY3BvczpbMiptWzBdIC0gYWN0LmNwb3NbMF0sIDIqbVsxXSAtIGFjdC5jcG9zWzFdXSwgdGltZTphY3QudGltZX07XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coYWN0LmNwb3NbMV0sIG1bMV0sIHRoaXMub3Bwby5jcG9zWzFdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhcnQoYWN0OmlhY3QpOmlhY3RbXXtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGUoYWN0KTtcclxuICAgICAgICAgICAgcmV0dXJuIFthY3QsIHRoaXMub3Bwb107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHpvb20oYWN0OmlhY3QpOmlhY3RbXXtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGUoYWN0KTtcclxuICAgICAgICAgICAgcmV0dXJuIFthY3QsIHRoaXMub3Bwb107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVuZChhY3Q6aWFjdCk6aWFjdFtde1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZShhY3QpO1xyXG4gICAgICAgICAgICByZXR1cm4gW2FjdCwgdGhpcy5vcHBvXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIG9mZnNldHNpbSBleHRlbmRzIHpvb21zaW17XHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZShhY3Q6aWFjdCk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy5vcHBvID0ge2FjdDphY3QuYWN0LCBjcG9zOlthY3QuY3Bvc1swXSArIDEwMCwgYWN0LmNwb3NbMV0gKyAxMDBdLCB0aW1lOmFjdC50aW1lfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHpzOnpvb21zaW0gPSBudWxsO1xyXG4gICAgbGV0IG9zOm9mZnNldHNpbSA9IG51bGw7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0b3VjaGVzKGV2ZW50OmFueSwgaXNlbmQ/OmJvb2xlYW4pOmFueXtcclxuICAgICAgICBpZiAoaXNlbmQpe1xyXG4gICAgICAgICAgICByZXR1cm4gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiBldmVudC50b3VjaGVzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdG91Y2goY2ZnOmFueSk6YW55e1xyXG4gICAgICAgIGxldCByZzpSZWNvZ25pemVyID0gbmV3IFJlY29nbml6ZXIoY2ZnKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlQWN0KG5hbWU6c3RyaW5nLCB4Om51bWJlciwgeTpudW1iZXIpOmlhY3R7XHJcbiAgICAgICAgICAgIHJldHVybiB7YWN0Om5hbWUsIGNwb3M6W3gsIHldLCB0aW1lOm5ldyBEYXRlKCkuZ2V0VGltZSgpfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZShjZmc6YW55LCBhY3RzOmlhY3RbXSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKCFjZmcgfHwgIWNmZy5lbmFibGVkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2ZnLm9uYWN0KXtcclxuICAgICAgICAgICAgICAgIGNmZy5vbmFjdChyZy5pbnF1ZXVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZy5wYXJzZShhY3RzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaW5pdGVkKXtcclxuICAgICAgICAgICAgZG9jdW1lbnQub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAoIU1vYmlsZURldmljZS5hbnkpe1xyXG4gICAgICAgICAgICAgICAgenMgPSBuZXcgem9vbXNpbSgpO1xyXG4gICAgICAgICAgICAgICAgb3MgPSBuZXcgb2Zmc2V0c2ltKCk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaHN0YXJ0XCIsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5idXR0b24gPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3RdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9zLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIG9zLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgenMuc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgenMub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNobW92ZVwiLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCBvcy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpzLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIHpzLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdDppYWN0ID0gY3JlYXRlQWN0KFwidG91Y2hlbmRcIiwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PSAwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3Muc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgb3Mub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB6cy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCB6cy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RzOmlhY3RbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3VjaGVzID0gZ2V0b3VjaGVzKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaTx0b3VjaGVzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFjdDppYWN0ID0gY3JlYXRlQWN0KFwidG91Y2hzdGFydFwiLCBpdGVtLmNsaWVudFgsIGl0ZW0uY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHMuYWRkKGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIGFjdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0czppYWN0W10gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG91Y2hlcyA9IGdldG91Y2hlcyhldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7IGkgPCB0b3VjaGVzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFjdDppYWN0ID0gY3JlYXRlQWN0KFwidG91Y2htb3ZlXCIsIGl0ZW0uY2xpZW50WCwgaXRlbS5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0cy5hZGQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgYWN0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEJyb3dzZXIuaXNTYWZhcmkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0czppYWN0W10gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG91Y2hlcyA9IGdldG91Y2hlcyhldmVudCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7IGkgPCB0b3VjaGVzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFjdDppYWN0ID0gY3JlYXRlQWN0KFwidG91Y2hlbmRcIiwgaXRlbS5jbGllbnRYLCBpdGVtLmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RzLmFkZChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBhY3RzKTtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2ZnO1xyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgdG91Y2ggPSBmaW5nZXJzLnRvdWNoOyIsIlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicmVjb2duaXplci50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBab29tZXJ7XHJcbiAgICAgICAgcHJvdGVjdGVkIHNhY3Q6aWFjdDtcclxuICAgICAgICBwcm90ZWN0ZWQgcGFjdDppYWN0O1xyXG4gICAgICAgIHByb3RlY3RlZCBzdGFydGVkOmJvb2xlYW47XHJcbiAgICAgICAgbWFwcGluZzp7fTtcclxuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xyXG4gICAgICAgICAgICBpZiAoIWVsLiR6b29tZXIkKXtcclxuICAgICAgICAgICAgICAgIGVsLiR6b29tZXIkID0gW3RoaXNdO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGVsLiR6b29tZXIkW2VsLiR6b29tZXIkLmxlbmd0aF0gPSB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBEcmFnIGV4dGVuZHMgWm9vbWVye1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGVsOmFueSl7XHJcbiAgICAgICAgICAgIHN1cGVyKGVsKTtcclxuICAgICAgICAgICAgbGV0IHpvb21lciA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMubWFwcGluZyA9IHtcclxuICAgICAgICAgICAgICAgIGRyYWdzdGFydDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcclxuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc2FjdCA9IGFjdDtcclxuICAgICAgICAgICAgICAgICAgICB6b29tZXIucGFjdCA9IGFjdDtcclxuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LCBkcmFnZ2luZzpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoem9vbWVyLnN0YXJ0ZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcCA9IHpvb21lci5wYWN0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gW2FjdC5jcG9zWzBdIC0gcC5jcG9zWzBdLCBhY3QuY3Bvc1sxXSAtIHAuY3Bvc1sxXV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWx0YSA9IHtvZmZzZXQ6IG9mZnNldH07IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbCA9IGVsLmFzdHlsZShbXCJsZWZ0XCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHQgPSBlbC5hc3R5bGUoW1widG9wXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IHBhcnNlSW50KGwpICsgZGVsdGEub2Zmc2V0WzBdICsgXCJweFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBwYXJzZUludCh0KSArIGRlbHRhLm9mZnNldFsxXSArIFwicHhcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgZHJhZ2VuZDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcclxuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBwb2ludE9uRWxlbWVudChlbDphbnksIGV2dDpzdHJpbmcsIHBvczpudW1iZXJbXSl7XHJcbiAgICAgICAgbGV0IHJsdCA9IFswLCAwXTtcclxuICAgICAgICBlbC5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKGV2ZW50OmFueSl7XHJcbiAgICAgICAgICAgIHJsdCA9IFtldmVudC5vZmZzZXRYLCBldmVudC5vZmZzZXRZXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2ltdWxhdGUoZWwsIFwibW91c2VvdmVyXCIsIHBvcyk7XHJcbiAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgWm9vbSBleHRlbmRzIFpvb21lcntcclxuICAgICAgICBwcm90ZWN0ZWQgcm90OmFueTtcclxuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xyXG4gICAgICAgICAgICBzdXBlcihlbCk7XHJcbiAgICAgICAgICAgIGxldCB6b29tZXIgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLm1hcHBpbmcgPSB7XHJcbiAgICAgICAgICAgICAgICB6b29tc3RhcnQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnNhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5yb3QgPSBSb3RhdG9yKGVsKTtcclxuICAgICAgICAgICAgICAgIH0sIHpvb21pbmc6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvb21lci5zdGFydGVkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAgPSB6b29tZXIuc2FjdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IFthY3QuY3Bvc1swXSAtIHAuY3Bvc1swXSwgYWN0LmNwb3NbMV0gLSBwLmNwb3NbMV1dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm90ID0gYWN0LmFuZ2xlIC0gcC5hbmdsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNjYWxlID0gYWN0LmxlbiAvIHAubGVuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGVsdGEgPSB7b2Zmc2V0OiBvZmZzZXQsIGFuZ2xlOnJvdCwgc2NhbGU6c2NhbGV9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2VudGVyID0gcG9pbnRPbkVsZW1lbnQoZWwsIFwibW91c2VvdmVyXCIsIGFjdC5jcG9zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb21lci5yb3Qucm90YXRlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvczpvZmZzZXQsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5nbGU6cm90LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjpjZW50ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2FsZTpzY2FsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgem9vbWVuZDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcclxuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5yb3QuY29tbWl0U3RhdHVzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBjbGFzcyBac2l6ZSBleHRlbmRzIFpvb21lcntcclxuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xyXG4gICAgICAgICAgICBzdXBlcihlbCk7XHJcbiAgICAgICAgICAgIGxldCB6b29tZXIgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLm1hcHBpbmcgPSB7XHJcbiAgICAgICAgICAgICAgICB6b29tc3RhcnQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnNhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSx6b29taW5nOmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh6b29tZXIuc3RhcnRlZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwID0gem9vbWVyLnBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBbYWN0LmNwb3NbMF0gLSBwLmNwb3NbMF0sIGFjdC5jcG9zWzFdIC0gcC5jcG9zWzFdXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlc2l6ZSA9IFthY3Qub3dpZHRoIC0gcC5vd2lkdGgsIGFjdC5vaGVpZ2h0IC0gcC5vaGVpZ2h0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbHRhID0ge29mZnNldDogb2Zmc2V0LCByZXNpemU6cmVzaXplfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3ID0gZWwuYXN0eWxlKFtcIndpZHRoXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGggPSBlbC5hc3R5bGUoW1wiaGVpZ2h0XCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsID0gZWwuYXN0eWxlKFtcImxlZnRcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdCA9IGVsLmFzdHlsZShbXCJ0b3BcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUud2lkdGggPSBwYXJzZUludCh3KSArIGRlbHRhLnJlc2l6ZVswXSArIFwicHhcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUuaGVpZ2h0ID0gcGFyc2VJbnQoaCkgKyBkZWx0YS5yZXNpemVbMV0gKyBcInB4XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gcGFyc2VJbnQobCkgKyBkZWx0YS5vZmZzZXRbMF0gKyBcInB4XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHBhcnNlSW50KHQpICsgZGVsdGEub2Zmc2V0WzFdICsgXCJweFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSx6b29tZW5kOmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2ltdWxhdGUoZWxlbWVudDphbnksIGV2ZW50TmFtZTpzdHJpbmcsIHBvczphbnkpIHtcclxuICAgICAgICBmdW5jdGlvbiBleHRlbmQoZGVzdGluYXRpb246YW55LCBzb3VyY2U6YW55KSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHByb3BlcnR5IGluIHNvdXJjZSlcclxuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uW3Byb3BlcnR5XSA9IHNvdXJjZVtwcm9wZXJ0eV07XHJcbiAgICAgICAgICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBldmVudE1hdGNoZXJzOmFueSA9IHtcclxuICAgICAgICAgICAgJ0hUTUxFdmVudHMnOiAvXig/OmxvYWR8dW5sb2FkfGFib3J0fGVycm9yfHNlbGVjdHxjaGFuZ2V8c3VibWl0fHJlc2V0fGZvY3VzfGJsdXJ8cmVzaXplfHNjcm9sbCkkLyxcclxuICAgICAgICAgICAgJ01vdXNlRXZlbnRzJzogL14oPzpjbGlja3xkYmxjbGlja3xtb3VzZSg/OmRvd258dXB8b3Zlcnxtb3ZlfG91dCkpJC9cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgcG9pbnRlclg6IDEwMCxcclxuICAgICAgICAgICAgcG9pbnRlclk6IDEwMCxcclxuICAgICAgICAgICAgYnV0dG9uOiAwLFxyXG4gICAgICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcclxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocG9zKSB7XHJcbiAgICAgICAgICAgIGRlZmF1bHRPcHRpb25zLnBvaW50ZXJYID0gcG9zWzBdO1xyXG4gICAgICAgICAgICBkZWZhdWx0T3B0aW9ucy5wb2ludGVyWSA9IHBvc1sxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IG9wdGlvbnMgPSBleHRlbmQoZGVmYXVsdE9wdGlvbnMsIGFyZ3VtZW50c1szXSB8fCB7fSk7XHJcbiAgICAgICAgbGV0IG9FdmVudDphbnksIGV2ZW50VHlwZTphbnkgPSBudWxsO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBuYW1lIGluIGV2ZW50TWF0Y2hlcnMpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50TWF0Y2hlcnNbbmFtZV0udGVzdChldmVudE5hbWUpKSB7IGV2ZW50VHlwZSA9IG5hbWU7IGJyZWFrOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWV2ZW50VHlwZSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdPbmx5IEhUTUxFdmVudHMgYW5kIE1vdXNlRXZlbnRzIGludGVyZmFjZXMgYXJlIHN1cHBvcnRlZCcpO1xyXG5cclxuICAgICAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcclxuICAgICAgICAgICAgb0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoZXZlbnRUeXBlKTtcclxuICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PSAnSFRNTEV2ZW50cycpIHtcclxuICAgICAgICAgICAgICAgIG9FdmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCBvcHRpb25zLmJ1YmJsZXMsIG9wdGlvbnMuY2FuY2VsYWJsZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvRXZlbnQuaW5pdE1vdXNlRXZlbnQoZXZlbnROYW1lLCBvcHRpb25zLmJ1YmJsZXMsIG9wdGlvbnMuY2FuY2VsYWJsZSwgZG9jdW1lbnQuZGVmYXVsdFZpZXcsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmJ1dHRvbiwgb3B0aW9ucy5wb2ludGVyWCwgb3B0aW9ucy5wb2ludGVyWSwgb3B0aW9ucy5wb2ludGVyWCwgb3B0aW9ucy5wb2ludGVyWSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuY3RybEtleSwgb3B0aW9ucy5hbHRLZXksIG9wdGlvbnMuc2hpZnRLZXksIG9wdGlvbnMubWV0YUtleSwgb3B0aW9ucy5idXR0b24sIGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChvRXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5jbGllbnRYID0gb3B0aW9ucy5wb2ludGVyWDtcclxuICAgICAgICAgICAgb3B0aW9ucy5jbGllbnRZID0gb3B0aW9ucy5wb2ludGVyWTtcclxuICAgICAgICAgICAgdmFyIGV2dCA9IChkb2N1bWVudCBhcyBhbnkpLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XHJcbiAgICAgICAgICAgIG9FdmVudCA9IGV4dGVuZChldnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmZpcmVFdmVudCgnb24nICsgZXZlbnROYW1lLCBvRXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInRvdWNoLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInpvb21lci50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGZ1bmN0aW9uIGVsQXRQb3MocG9zOm51bWJlcltdKTphbnl7XHJcbiAgICAgICAgbGV0IHJsdDphbnkgPSBudWxsO1xyXG4gICAgICAgIGxldCBjYWNoZTphbnlbXSA9IFtdO1xyXG4gICAgICAgIHdoaWxlKHRydWUpe1xyXG4gICAgICAgICAgICBsZXQgZWw6YW55ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChwb3NbMF0sIHBvc1sxXSk7XHJcbiAgICAgICAgICAgIGlmIChlbCA9PSBkb2N1bWVudC5ib2R5IHx8IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcImh0bWxcIiB8fCBlbCA9PSB3aW5kb3cpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoZWwuJGV2dHJhcCQpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoZWwuJHRvdWNoYWJsZSQpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gZWwuZ2V0YXJnZXQ/ZWwuZ2V0YXJnZXQoKTplbFxyXG4gICAgICAgICAgICAgICAgcmx0LiR0b3VjaGVsJCA9IGVsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgY2FjaGUuYWRkKGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IobGV0IGkgb2YgY2FjaGUpe1xyXG4gICAgICAgICAgICBpLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBhY3RpdmVFbDphbnk7XHJcbiAgICBsZXQgaW5pdGVkOmJvb2xlYW49ZmFsc2U7XHJcbiAgICBsZXQgY2ZnOmFueSA9IG51bGw7XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZpbmdlcihlbDphbnkpOmFueXtcclxuICAgICAgICBpZiAoIWNmZyl7XHJcbiAgICAgICAgICAgIGNmZyA9IHRvdWNoKHtcclxuICAgICAgICAgICAgICAgIG9uOnsgXHJcbiAgICAgICAgICAgICAgICAgICAgdGFwOmZ1bmN0aW9uKGFjdDppYWN0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlRWwgPSBlbEF0UG9zKGFjdC5jcG9zKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LG9uYWN0OmZ1bmN0aW9uKGlucTphbnkpe1xyXG4gICAgICAgICAgICAgICAgfSxvbnJlY29nbml6ZWQ6ZnVuY3Rpb24oYWN0OmlhY3Qpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3RpdmVFbCAmJiBhY3RpdmVFbC4kem9vbWVyJCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB6bSA9IGFjdGl2ZUVsLiR6b29tZXIkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgb2Ygem0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkubWFwcGluZ1thY3QuYWN0XSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS5tYXBwaW5nW2FjdC5hY3RdKGFjdCwgYWN0aXZlRWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2ZnLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbC4kdG91Y2hhYmxlJCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgem9vbWFibGU6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGxldCB6b29tZXIgPSBuZXcgWm9vbShlbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSx6c2l6YWJsZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHpzaXplID0gbmV3IFpzaXplKGVsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9LGRyYWdnYWJsZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbGV0IGRyYWcgPSBuZXcgRHJhZyhlbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBmaW5nZXIgPSBmaW5nZXJzLmZpbmdlcjsiLCJcclxubmFtZXNwYWNlIGZpbmdlcnN7XHJcbiAgICBjbGFzcyBSb3R7XHJcbiAgICAgICAgcHJvdGVjdGVkIG9yaWdpbjphbnk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGNtdDphbnk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGNhY2hlOmFueTtcclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXR1czphbnlbXTtcclxuXHJcbiAgICAgICAgdGFyZ2V0OmFueTtcclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNlbnRlcjphbnk7XHJcbiAgICAgICAgcHJvdGVjdGVkIG9mZnNldDpudW1iZXJbXTtcclxuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xyXG4gICAgICAgICAgICBpZiAoIWVsKXtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IGVsO1xyXG4gICAgICAgICAgICBlbC4kcm90JCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGxldCBwb3MgPSBbZWwuYXN0eWxlKFtcImxlZnRcIl0pLCBlbC5hc3R5bGUoW1widG9wXCJdKV07XHJcbiAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBwb3NbMF07XHJcbiAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHBvc1sxXTtcclxuICAgICAgICAgICAgbGV0IHJjID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luID0ge1xyXG4gICAgICAgICAgICAgICAgY2VudGVyOltyYy53aWR0aC8yLCByYy5oZWlnaHQvMl0sIFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6MCwgXHJcbiAgICAgICAgICAgICAgICBzY2FsZTpbMSwxXSwgXHJcbiAgICAgICAgICAgICAgICBwb3M6W3BhcnNlRmxvYXQocG9zWzBdKSwgcGFyc2VGbG9hdChwb3NbMV0pXSxcclxuICAgICAgICAgICAgICAgIHNpemU6W3JjLndpZHRoLCByYy5oZWlnaHRdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuY210ID0ge1xyXG4gICAgICAgICAgICAgICAgY2VudGVyOltyYy53aWR0aC8yLCByYy5oZWlnaHQvMl0sIFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6MCwgXHJcbiAgICAgICAgICAgICAgICBzY2FsZTpbMSwxXSwgXHJcbiAgICAgICAgICAgICAgICBwb3M6W3BhcnNlRmxvYXQocG9zWzBdKSwgcGFyc2VGbG9hdChwb3NbMV0pXSxcclxuICAgICAgICAgICAgICAgIHNpemU6W3JjLndpZHRoLCByYy5oZWlnaHRdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGUgPSB7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXI6W3JjLndpZHRoLzIsIHJjLmhlaWdodC8yXSwgXHJcbiAgICAgICAgICAgICAgICBhbmdsZTowLCBcclxuICAgICAgICAgICAgICAgIHNjYWxlOlsxLDFdLCBcclxuICAgICAgICAgICAgICAgIHBvczpbcGFyc2VGbG9hdChwb3NbMF0pLCBwYXJzZUZsb2F0KHBvc1sxXSldLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTpbcmMud2lkdGgsIHJjLmhlaWdodF1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gW107XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNlbnRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUubGVmdCA9ICc1MCUnO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlci5zdHlsZS50b3AgPSAnNTAlJztcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUud2lkdGggPSAnMHB4JztcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUuaGVpZ2h0ID0gJzBweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyLnN0eWxlLmJvcmRlciA9ICdzb2xpZCAwcHggYmx1ZSc7XHJcblxyXG4gICAgICAgICAgICBlbC5hcHBlbmRDaGlsZCh0aGlzLmNlbnRlcik7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0T3JpZ2luKHRoaXMub3JpZ2luLmNlbnRlcik7XHJcbiAgICAgICAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9IFwicm90YXRlKDBkZWcpXCI7XHJcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXR1cygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm90YXRlKGFyZzphbnksIHVuZGVmPzphbnkpe1xyXG4gICAgICAgICAgICBpZiAoIWFyZyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gIFx0XHRcdGxldCBjYWNoZSA9IHRoaXMuY2FjaGU7XHJcblx0XHRcdGxldCBvcmlnaW4gPSB0aGlzLmNtdDtcclxuXHRcdFx0bGV0IG9mZnNldCA9IHRoaXMub2Zmc2V0O1xyXG5cdFx0XHRsZXQgYW5nbGUgPSBhcmcuYW5nbGUsIFxyXG4gICAgICAgICAgICAgICAgY2VudGVyID0gYXJnLmNlbnRlciwgXHJcbiAgICAgICAgICAgICAgICBzY2FsZSA9IGFyZy5zY2FsZSwgXHJcbiAgICAgICAgICAgICAgICBwb3MgPSBhcmcucG9zLCBcclxuICAgICAgICAgICAgICAgIHJlc2l6ZSA9IGFyZy5yZXNpemU7XHJcbiAgICAgICAgICAgIGlmICghb2Zmc2V0KXtcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IFswLCAwXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2VudGVyICE9PSB1bmRlZil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hTdGF0dXMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3JpZ2luKGNlbnRlcik7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3N0YXR1cyA9IHRoaXMucHVzaFN0YXR1cygpO1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5jb3JyZWN0KGNzdGF0dXMsIG9mZnNldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFuZ2xlIHx8IGFuZ2xlID09PSAwKXtcclxuICAgICAgICAgICAgICAgIGNhY2hlLmFuZ2xlID0gb3JpZ2luLmFuZ2xlICsgYW5nbGU7XHJcbiAgICAgICAgICAgICAgICBjYWNoZS5hbmdsZSA9IGNhY2hlLmFuZ2xlICUgMzYwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZXNpemUpe1xyXG4gICAgICAgICAgICAgICAgY2FjaGUuc2l6ZSA9IFtvcmlnaW4uc2l6ZVswXSArIHJlc2l6ZVswXSwgb3JpZ2luLnNpemVbMV0gKyByZXNpemVbMV1dO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhY2hlLnNpemVbMF0gPCAxMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuc2l6ZVswXSA9IDEwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhY2hlLnNpemVbMV0gPCAxMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuc2l6ZVsxXSA9IDEwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzY2FsZSl7XHJcbiAgICAgICAgICAgICAgICBpZiAoIShzY2FsZSBpbnN0YW5jZW9mIEFycmF5KSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG4gPSBwYXJzZUZsb2F0KHNjYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZSA9IFtuLCBuXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhY2hlLnNjYWxlID0gW29yaWdpbi5zY2FsZVswXSAqIHNjYWxlWzBdLCBvcmlnaW4uc2NhbGVbMV0gKiBzY2FsZVsxXV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBvcyl7XHJcbiAgICAgICAgICAgICAgICBjYWNoZS5wb3MgPSBbb3JpZ2luLnBvc1swXSArIHBvc1swXSAtIG9mZnNldFswXSwgb3JpZ2luLnBvc1sxXSArIHBvc1sxXSAtIG9mZnNldFsxXV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVooJyArIGNhY2hlLmFuZ2xlICsgJ2RlZykgc2NhbGUoJyArIGNhY2hlLnNjYWxlWzBdICsgJywnICsgY2FjaGUuc2NhbGVbMV0gKyAnKSc7XHJcblx0XHRcdHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQgPSBjYWNoZS5wb3NbMF0gKyAncHgnO1xyXG5cdFx0XHR0aGlzLnRhcmdldC5zdHlsZS50b3AgPSBjYWNoZS5wb3NbMV0gKyAncHgnO1xyXG4gICAgICAgICAgICBpZiAocmVzaXplKXtcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLndpZHRoID0gY2FjaGUuc2l6ZVswXSArICdweCc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5oZWlnaHQgPSBjYWNoZS5zaXplWzFdICsgJ3B4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0dXMoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0Q2VudGVyKCk6bnVtYmVyW117XHJcbiAgICAgICAgICAgIGxldCByYyA9IHRoaXMuY2VudGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gW3JjLmxlZnQsIHJjLnRvcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzZXRPcmlnaW4ocDpudW1iZXJbXSk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gcFswXSArIFwicHggXCIgKyBwWzFdICsgXCJweFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgY29ycmVjdChzdGF0dXM6YW55LCBwb2Zmc2V0PzpudW1iZXJbXSk6bnVtYmVyW117XHJcbiAgICAgICAgICAgIGlmICghcG9mZnNldCl7XHJcbiAgICAgICAgICAgICAgICBwb2Zmc2V0ID0gWzAsIDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBkID0gc3RhdHVzLmRlbHRhO1xyXG4gICAgICAgICAgICBsZXQgeCA9IHBhcnNlRmxvYXQodGhpcy50YXJnZXQuYXN0eWxlW1wibGVmdFwiXSkgLSBkLmNlbnRlclswXTtcclxuICAgICAgICAgICAgbGV0IHkgPSBwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LmFzdHlsZVtcInRvcFwiXSkgLSBkLmNlbnRlclsxXTtcclxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSBbcG9mZnNldFswXSArIGQuY2VudGVyWzBdLCBwb2Zmc2V0WzFdICsgZC5jZW50ZXJbMV1dO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudG9wID0geSArIFwicHhcIjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgY29tbWl0U3RhdHVzKCk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy5jbXQgPSB0aGlzLmNhY2hlO1xyXG4gICAgICAgICAgICB0aGlzLmNtdC5wb3MgPSBbcGFyc2VGbG9hdCh0aGlzLnRhcmdldC5zdHlsZS5sZWZ0KSwgcGFyc2VGbG9hdCh0aGlzLnRhcmdldC5zdHlsZS50b3ApXTtcclxuICAgICAgICAgICAgdGhpcy5jbXQuc2l6ZSA9IFtwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LnN0eWxlLndpZHRoKSwgcGFyc2VGbG9hdCh0aGlzLnRhcmdldC5zdHlsZS5oZWlnaHQpXTtcclxuICAgICAgICAgICAgdGhpcy5jYWNoZSA9IHthbmdsZTowLCBzY2FsZTpbMSwxXSwgcG9zOlswLDBdLCBzaXplOlswLDBdfTtcclxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSBbMCwgMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBwdXNoU3RhdHVzKCk6dm9pZHtcclxuICAgICAgICAgICAgbGV0IGMgPSB0aGlzLmdldENlbnRlcigpO1xyXG4gICAgICAgICAgICBsZXQgbCA9IFtwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LmFzdHlsZShbXCJsZWZ0XCJdKSkscGFyc2VGbG9hdCh0aGlzLnRhcmdldC5hc3R5bGUoW1widG9wXCJdKSldO1xyXG4gICAgICAgICAgICBsZXQgczphbnkgPSB7Y2VudGVyOltjWzBdLCBjWzFdXSwgcG9zOmx9O1xyXG4gICAgICAgICAgICBsZXQgcSA9IHRoaXMuc3RhdHVzO1xyXG4gICAgICAgICAgICBsZXQgcCA9IHEubGVuZ3RoID4gMD9xW3EubGVuZ3RoIC0gMV0gOiBzO1xyXG4gICAgICAgICAgICBzLmRlbHRhID0geyBjZW50ZXI6W3MuY2VudGVyWzBdIC0gcC5jZW50ZXJbMF0sIHMuY2VudGVyWzFdIC0gcC5jZW50ZXJbMV1dLFxyXG4gICAgICAgICAgICAgICAgcG9zOiBbcy5wb3NbMF0gLSBwLnBvc1swXSwgcy5wb3NbMV0gLSBwLnBvc1sxXV19O1xyXG4gICAgICAgICAgICBxW3EubGVuZ3RoXSA9IHM7XHJcbiAgICAgICAgICAgIGlmIChxLmxlbmd0aCA+IDYpe1xyXG4gICAgICAgICAgICAgICAgcS5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIFJvdGF0b3IoZWw6YW55KTphbnl7XHJcbiAgICAgICAgbGV0IHIgPSBlbC4kcm90JCB8fCBuZXcgUm90KGVsKTtcclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH1cclxufVxyXG5cclxuIiwiaW50ZXJmYWNlIFN0cmluZ3tcclxuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XHJcblx0Zm9ybWF0KC4uLnJlc3RBcmdzOmFueVtdKTpzdHJpbmc7XHJcbn1cclxuXHJcblN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aCA9IGZ1bmN0aW9uKHN0cjpzdHJpbmcpOmJvb2xlYW57XHJcblx0cmV0dXJuIHRoaXMuaW5kZXhPZihzdHIpPT0wO1xyXG59XHJcblN0cmluZy5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKCkge1xyXG5cdHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG5cdHZhciBzID0gdGhpcztcclxuXHRpZiAoIWFyZ3MgfHwgYXJncy5sZW5ndGggPCAxKSB7XHJcblx0XHRyZXR1cm4gcztcclxuXHR9XHJcblx0dmFyIHIgPSBzO1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG5cdFx0dmFyIHJlZyA9IG5ldyBSZWdFeHAoJ1xcXFx7JyArIGkgKyAnXFxcXH0nKTtcclxuXHRcdHIgPSByLnJlcGxhY2UocmVnLCBhcmdzW2ldKTtcclxuXHR9XHJcblx0cmV0dXJuIHI7XHJcbn07IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vc3RyaW5nLnRzXCIgLz5cclxuXHJcbkVsZW1lbnQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKHZhbDphbnksIHVuZGVmPzphbnkpOnZvaWR7XHJcbiAgICBpZiAodmFsID09PSB1bmRlZil7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gYWRkKHQ6YW55LCB2OmFueSk6Ym9vbGVhbntcclxuICAgICAgICBmdW5jdGlvbiBfYWRkKHQ6YW55LCB2OmFueSwgbW9kZTpzdHJpbmcpe1xyXG4gICAgICAgICAgICBpZiAodi5tb2RlID09IFwicHJlcGVuZFwiKXtcclxuICAgICAgICAgICAgICAgIHQuaW5zZXJ0QmVmb3JlKHYsIHQuY2hpbGROb2Rlc1swXSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdC5hcHBlbmRDaGlsZCh2KTtcclxuICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblx0XHRpZiAodCl7XHJcbiAgICAgICAgICAgIGlmICh2ID09PSB1bmRlZil7XHJcbiAgICAgICAgICAgICAgICB0LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHRcdFx0aWYgKHR5cGVvZiAodikgPT0gJ29iamVjdCcpe1xyXG5cdFx0XHRcdGxldCB0bXAgPSB3by51c2Uodi50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRtcCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdi50YXJnZXQgPSB0bXA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblx0XHRcdFx0aWYgKCF2Lm1vZGUgfHwgKHYubW9kZSA9PSBcInByZXBlbmRcIiAmJiB0LmNoaWxkTm9kZXMubGVuZ3RoIDwgMSkpe1xyXG5cdFx0XHRcdFx0di5tb2RlID0gXCJhcHBlbmRcIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHYubW9kZSA9PSBcInJlcGxhY2VcIil7XHJcblx0XHRcdFx0XHR0LmlubmVySFRNTCA9IFwiXCI7XHJcblx0XHRcdFx0XHR2Lm1vZGUgPSBcImFwcGVuZFwiO1xyXG5cdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgIGxldCB2YWxzID0gdmFsLnRhcmdldDtcclxuICAgICAgICAgICAgICAgIGlmICghdmFscy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgIF9hZGQodCwgdmFscywgdi5tb2RlKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBvZiB2YWxzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2FkZCh0LCBpLCB2Lm1vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0JCh0KS50ZXh0KHYpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKHdvLnVzYWJsZSh2YWwpKXtcclxuICAgICAgICBhZGQodGhpcywgdmFsKTtcclxuICAgIH1cclxuXHRmb3IobGV0IGkgaW4gdmFsKXtcclxuXHRcdGxldCB2ID0gdmFsW2ldO1xyXG4gICAgXHRsZXQgdCA9IHRoaXNbXCIkXCIgKyBpXTtcclxuICAgICAgICBhZGQodCwgdik7XHJcblx0fSAgICAgICAgICAgIFxyXG59O1xyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgLy8vIENvbnRhaW5zIGNyZWF0b3IgaW5zdGFuY2Ugb2JqZWN0XHJcbiAgICBleHBvcnQgbGV0IENyZWF0b3JzOkNyZWF0b3JbXSA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldChzZWxlY3RvcjphbnkpOmFueXtcclxuICAgICAgICBsZXQgcmx0OmFueSA9IFtdO1xyXG4gICAgICAgIGlmIChzZWxlY3Rvcil7XHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgIHJsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDdXJzb3J7XHJcbiAgICAgICAgcGFyZW50OmFueTtcclxuICAgICAgICBib3JkZXI6YW55O1xyXG4gICAgICAgIHJvb3Q6YW55O1xyXG4gICAgICAgIGN1cnQ6YW55O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDcmVhdG9ye1xyXG4gICAgICAgIGlkOnN0cmluZztcclxuICAgICAgICBnZXQgSWQoKTpzdHJpbmd7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBDcmVhdGUoanNvbjphbnksIGNzPzpDdXJzb3IpOmFueXtcclxuICAgICAgICAgICAgaWYgKCFqc29uKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBvID0gdGhpcy5jcmVhdGUoanNvbik7XHJcbiAgICAgICAgICAgIGlmICghY3Mpe1xyXG4gICAgICAgICAgICAgICAgY3MgPSBuZXcgQ3Vyc29yKCk7XHJcbiAgICAgICAgICAgICAgICBjcy5yb290ID0gbztcclxuICAgICAgICAgICAgICAgIGNzLnBhcmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBjcy5ib3JkZXIgPSBvO1xyXG4gICAgICAgICAgICAgICAgY3MuY3VydCA9IG87XHJcbiAgICAgICAgICAgICAgICBvLmN1cnNvciA9IGNzO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGxldCBuY3MgPSBuZXcgQ3Vyc29yKCk7XHJcbiAgICAgICAgICAgICAgICBuY3Mucm9vdCA9IGNzLnJvb3Q7XHJcbiAgICAgICAgICAgICAgICBuY3MucGFyZW50ID0gY3MuY3VydDtcclxuICAgICAgICAgICAgICAgIG5jcy5ib3JkZXIgPSBjcy5ib3JkZXI7XHJcbiAgICAgICAgICAgICAgICBuY3MuY3VydCA9IG87XHJcbiAgICAgICAgICAgICAgICBvLmN1cnNvciA9IG5jcztcclxuICAgICAgICAgICAgICAgIGNzID0gbmNzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChqc29uLmFsaWFzKXtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5kaXIoanNvbi5hbGlhcyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbiA9IGpzb24uYWxpYXM7XHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5hbGlhcy5zdGFydHNXaXRoKFwiJFwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbiA9IGpzb24uYWxpYXMuc3Vic3RyKDEsIGpzb24uYWxpYXMubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjcy5ib3JkZXJbXCIkXCIgKyBuXSA9IG87XHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5hbGlhcy5zdGFydHNXaXRoKFwiJFwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgY3MuYm9yZGVyID0gbztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGVsZXRlIGpzb25bdGhpcy5JZF07XHJcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5kKG8sIGpzb24pO1xyXG4gICAgICAgICAgICBpZiAoanNvbi5tYWRlKXtcclxuICAgICAgICAgICAgICAgIGpzb24ubWFkZS5jYWxsKG8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG8uJHJvb3QgPSBjcy5yb290O1xyXG4gICAgICAgICAgICBvLiRib3JkZXIgPSBjcy5ib3JkZXI7XHJcbiAgICAgICAgICAgIHJldHVybiBvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgY3JlYXRlKGpzb246YW55KTphbnk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWQ7XHJcbiAgICAgICAgcHJvdGVjdGVkIGFwcGx5YXR0cihlbDphbnksIGpzb246YW55LCBpOnN0cmluZywgY3M6YW55KXtcclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGVsW2ldO1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0KXtcclxuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIHRhcmdldDtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodnR5cGUgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBqZXh0ZW5kLmNhbGwodGhpcywgdGFyZ2V0LCBqc29uW2ldLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIGFwcGx5Y2hpbGQoZWw6YW55LCBqc29uOmFueSwgaTpzdHJpbmcsIGNzOmFueSl7XHJcbiAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIGpzb25baV07XHJcbiAgICAgICAgICAgIGlmIChqc29uW2ldIGluc3RhbmNlb2YgQXJyYXkpe1xyXG4gICAgICAgICAgICAgICAgZm9yKGxldCBqIG9mIGpzb25baV0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqLCBjcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqc29uW2ldLCBjcyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBqc29uW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgYXBwbHlwcm9wKGVsOmFueSwganNvbjphbnksIGk6c3RyaW5nLCBjczphbnkpe1xyXG4gICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpe1xyXG4gICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGlmIChlbFtpXSAmJiB0eXBlb2YoZWxbaV0pID09ICdvYmplY3QnICYmIHR5cGUgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRhdHRyKGVsLCBqc29uLCBpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc2V0YXR0cihlbDphbnksIGpzb246YW55LCBpOnN0cmluZyl7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShpLCBqc29uW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZChlbDphbnksIGNoaWxkOmFueSl7XHJcbiAgICAgICAgaWYgKGVsLmFwcGVuZCAmJiB0eXBlb2YoZWwuYXBwZW5kKSA9PSAnZnVuY3Rpb24nKXtcclxuICAgICAgICAgICAgZWwuYXBwZW5kKGNoaWxkKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdXNhYmxlKGpzb246YW55KTpib29sZWFue1xyXG4gICAgICAgIGZvcih2YXIgaSBvZiBDcmVhdG9ycyl7XHJcbiAgICAgICAgICAgIGlmIChqc29uW2kuSWRdKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdXNlKGpzb246YW55LCBjcz86Q3Vyc29yKTphbnl7XHJcbiAgICAgICAgbGV0IHJsdDphbnkgPSBudWxsO1xyXG4gICAgICAgIGlmICghanNvbiB8fCBqc29uIGluc3RhbmNlb2YgRWxlbWVudCl7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb250YWluZXI6YW55ID0gbnVsbDtcclxuICAgICAgICBpZiAoanNvbi4kY29udGFpbmVyJCl7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGpzb24uJGNvbnRhaW5lciQ7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBqc29uLiRjb250YWluZXIkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIChqc29uKSA9PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgICAgIHJsdCA9IGdldChqc29uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcih2YXIgaSBvZiBDcmVhdG9ycyl7XHJcbiAgICAgICAgICAgIGlmIChqc29uW2kuSWRdKXtcclxuICAgICAgICAgICAgICAgIHJsdCA9IGkuQ3JlYXRlKGpzb24sIGNzKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb250YWluZXIpe1xyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmx0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgIH1cclxuXHJcblxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi91c2UudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgZXhwb3J0IGNsYXNzIERvbUNyZWF0b3IgZXh0ZW5kcyBDcmVhdG9ye1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBcInRhZ1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XHJcbiAgICAgICAgICAgIGlmIChqc29uID09IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHRhZyA9IGpzb25bdGhpcy5pZF07XHJcbiAgICAgICAgICAgIGxldCBlbDpOb2RlO1xyXG4gICAgICAgICAgICBpZiAodGFnID09ICcjdGV4dCcpe1xyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0YWcpO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyBcclxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmVyaWZ5KGk6c3RyaW5nLCBqc29uOmFueSl7XHJcbiAgICAgICAgICAgIGlmIChpLnN0YXJ0c1dpdGgoXCIkJFwiKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBseWF0dHI7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwiJFwiKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFwcGx5Y2hpbGQ7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvYmpleHRlbmQ7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwbHlwcm9wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWR7XHJcbiAgICAgICAgICAgIGlmIChqc29uIGluc3RhbmNlb2YgTm9kZSB8fCBqc29uIGluc3RhbmNlb2YgRWxlbWVudCl7XHJcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XHJcbiAgICAgICAgICAgICAgICAvL2RvbWV4dGVuZChvLCBqc29uKTtcclxuICAgICAgICAgICAgICAgIGpleHRlbmQuY2FsbCh0aGlzLCBvLCBqc29uLCB0aGlzKTtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKGpzb24uJCAmJiBvIGluc3RhbmNlb2YgTm9kZSl7XHJcbiAgICAgICAgICAgICAgICBvLm5vZGVWYWx1ZSA9IGpzb24uJDtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcclxuICAgICAgICAgICAgICAgIG8uZXh0ZW5kKGpzb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi91c2UudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgZXhwb3J0IGNsYXNzIFN2Z0NyZWF0b3IgZXh0ZW5kcyBDcmVhdG9ye1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBcInNnXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZlcmlmeShpOnN0cmluZywganNvbjphbnkpe1xyXG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwbHlhdHRyO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSAnJCcpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwbHljaGlsZDtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKGkuc3RhcnRzV2l0aChcIiRcIikpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iamV4dGVuZDtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBseXByb3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY3JlYXRlKGpzb246YW55KTpOb2Rle1xyXG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB0YWcgPSBqc29uW3RoaXMuaWRdO1xyXG4gICAgICAgICAgICBsZXQgZWw6Tm9kZTtcclxuICAgICAgICAgICAgaWYgKHRhZyA9PSBcInN2Z1wiKXtcclxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgdGFnKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIHRhZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lke1xyXG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBTVkdFbGVtZW50KXtcclxuICAgICAgICAgICAgICAgIC8vc3ZnZXh0ZW5kKG8sIGpzb24pO1xyXG4gICAgICAgICAgICAgICAgamV4dGVuZC5jYWxsKHRoaXMsIG8sIGpzb24sIHRoaXMpO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoanNvbi4kICYmIG8gaW5zdGFuY2VvZiBOb2RlKXtcclxuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xyXG4gICAgICAgICAgICAgICAgby5leHRlbmQoanNvbik7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzZXRhdHRyKGVsOmFueSwganNvbjphbnksIGk6c3RyaW5nKXtcclxuICAgICAgICAgICAgcmV0dXJuIGVsLnNldEF0dHJpYnV0ZU5TKG51bGwsIGksIGpzb25baV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdXNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZG9tY3JlYXRvci50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2Ugd297XHJcbiAgICBleHBvcnQgbGV0IFdpZGdldHM6YW55ID0ge307XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFVpQ3JlYXRvciBleHRlbmRzIENyZWF0b3J7XHJcbiAgICAgICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pZCA9IFwidWlcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3JlYXRlKGpzb246YW55KTpOb2Rle1xyXG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB3ZyA9IGpzb25bdGhpcy5pZF07XHJcbiAgICAgICAgICAgIGlmICghV2lkZ2V0c1t3Z10pe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBlbDpOb2RlID0gdXNlKFdpZGdldHNbd2ddKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gZWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZlcmlmeShpOnN0cmluZywganNvbjphbnkpe1xyXG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwbHlhdHRyO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZihpID09IFwiJFwiKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFwcGx5Y2hpbGQ7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwic3R5bGVcIil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqZXh0ZW5kO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFwcGx5cHJvcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lke1xyXG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XHJcbiAgICAgICAgICAgICAgICBqZXh0ZW5kLmNhbGwodGhpcywgbywganNvbiwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xyXG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChvLmV4dGVuZCl7XHJcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgYXBwbHljaGlsZChlbDphbnksIGpzb246YW55LCBpOnN0cmluZywgY3M6YW55KXtcclxuICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICAgICAgbGV0IGppID0ganNvbltpXTtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcgJiYgIShqaSBpbnN0YW5jZW9mIEFycmF5KSl7XHJcbiAgICAgICAgICAgICAgICBqaSA9IFtqaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGppIGluc3RhbmNlb2YgQXJyYXkpe1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVzID0gZWwuY2hpbGROb2RlcztcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGo8amkubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gamlbal07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvLmlzd2lkZ2V0KGl0ZW0pKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsLnVzZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC51c2UoaXRlbSwgY3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShpdGVtLCBjcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGogPCBub2Rlcy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamV4dGVuZC5jYWxsKHRoaXMsIG5vZGVzW2pdLCBpdGVtLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWwudXNlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC51c2UoaXRlbSwgY3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGl0ZW0sIGNzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBqc29uW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGlzd2lkZ2V0KGpzb246YW55KTpib29sZWFue1xyXG4gICAgICAgIGlmICghanNvbiB8fCAhanNvbi51aSl7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSBpbiBXaWRnZXRzKXtcclxuICAgICAgICAgICAgaWYgKGkgPT0ganNvbi51aSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZm91bmRhdGlvbi9kZWZpbml0aW9ucy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvdXNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVpbGRlci9kb21jcmVhdG9yLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVpbGRlci9zdmdjcmVhdG9yLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxyXG5cclxud28uQ3JlYXRvcnMuYWRkKG5ldyB3by5Eb21DcmVhdG9yKCkpO1xyXG53by5DcmVhdG9ycy5hZGQobmV3IHdvLlN2Z0NyZWF0b3IoKSk7XHJcbndvLkNyZWF0b3JzLmFkZChuZXcgd28uVWlDcmVhdG9yKCkpO1xyXG4iLCJuYW1lc3BhY2Ugd297XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gb2JqZXh0ZW5kKG86YW55LCBqc29uOmFueSl7XHJcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mKGpzb25baV0pID09ICdvYmplY3QnICYmIG9baV0gJiYgdHlwZW9mKG9baV0pID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgIG9iamV4dGVuZChvW2ldLCBqc29uW2ldKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBvW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJvYmpleHRlbmQudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGpleHRlbmQodGFyZ2V0OmFueSwganNvbjphbnksIGJhZzphbnkpe1xyXG4gICAgICAgIGxldCBjcyA9IHRhcmdldC5jdXJzb3I7XHJcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xyXG4gICAgICAgICAgICBsZXQgaGFuZGxlciA9IGJhZy52ZXJpZnkoaSwganNvbik7XHJcbiAgICAgICAgICAgIGlmICghaGFuZGxlcil7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gb2JqZXh0ZW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCB0YXJnZXQsIGpzb24sIGksIGNzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZGVmaW5pdGlvbnMudHNcIiAvPlxyXG5jbGFzcyBNb2JpbGVEZXZpY2V7XHJcblx0c3RhdGljIGdldCBBbmRyb2lkICgpOmJvb2xlYW4ge1xyXG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkL2kpO1xyXG5cdFx0aWYgKHIpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByIT0gbnVsbCAmJiByLmxlbmd0aD4wO1xyXG5cdH1cclxuXHRzdGF0aWMgZ2V0IEJsYWNrQmVycnkoKTpib29sZWFuIHtcclxuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQmxhY2tCZXJyeS9pKTtcclxuXHRcdGlmIChyKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gciE9bnVsbCAmJiByLmxlbmd0aCA+IDA7XHJcblx0fVxyXG5cdHN0YXRpYyBnZXQgaU9TKCk6Ym9vbGVhbiB7XHJcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2lQaG9uZXxpUGFkfGlQb2QvaSk7XHJcblx0XHRpZiAocikge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHIgIT0gbnVsbCAmJiByLmxlbmd0aCA+IDA7XHJcblx0fVxyXG5cdHN0YXRpYyBnZXQgT3BlcmEoKTpib29sZWFuIHtcclxuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvT3BlcmEgTWluaS9pKTtcclxuXHRcdGlmIChyKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gciAhPSBudWxsICYmIHIubGVuZ3RoID4gMDtcclxuXHR9XHJcblx0c3RhdGljIGdldCBXaW5kb3dzKCk6Ym9vbGVhbiB7XHJcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0lFTW9iaWxlL2kpO1xyXG5cdFx0aWYgKHIpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByIT0gbnVsbCAmJiByLmxlbmd0aCA+MDtcclxuXHR9XHJcblx0c3RhdGljIGdldCBhbnkoKTpib29sZWFuIHtcclxuXHRcdHJldHVybiAoTW9iaWxlRGV2aWNlLkFuZHJvaWQgfHwgTW9iaWxlRGV2aWNlLkJsYWNrQmVycnkgfHwgTW9iaWxlRGV2aWNlLmlPUyB8fCBNb2JpbGVEZXZpY2UuT3BlcmEgfHwgTW9iaWxlRGV2aWNlLldpbmRvd3MpO1xyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgQnJvd3NlcntcclxuXHQvLyBPcGVyYSA4LjArXHJcblx0c3RhdGljIGdldCBpc09wZXJhKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiAoISF3aW5kb3cub3ByICYmICEhd2luZG93Lm9wci5hZGRvbnMpIHx8ICEhd2luZG93Lm9wZXJhIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIE9QUi8nKSA+PSAwO1xyXG5cdH1cclxuXHRcclxuXHQvLyBGaXJlZm94IDEuMCtcclxuXHRzdGF0aWMgZ2V0IGlzRmlyZWZveCgpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gdHlwZW9mIHdpbmRvdy5JbnN0YWxsVHJpZ2dlciAhPT0gJ3VuZGVmaW5lZCc7XHJcblx0fVxyXG5cdC8vIEF0IGxlYXN0IFNhZmFyaSAzKzogXCJbb2JqZWN0IEhUTUxFbGVtZW50Q29uc3RydWN0b3JdXCJcclxuXHRzdGF0aWMgZ2V0IGlzU2FmYXJpKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoSFRNTEVsZW1lbnQpLmluZGV4T2YoJ0NvbnN0cnVjdG9yJykgPiAwO1xyXG5cdH0gXHJcblx0Ly8gSW50ZXJuZXQgRXhwbG9yZXIgNi0xMVxyXG5cdHN0YXRpYyBnZXQgaXNJRSgpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gLypAY2Nfb24hQCovZmFsc2UgfHwgISFkb2N1bWVudC5kb2N1bWVudE1vZGU7XHJcblx0fVxyXG5cdC8vIEVkZ2UgMjArXHJcblx0c3RhdGljIGdldCBpc0VkZ2UoKTpib29sZWFue1xyXG5cdFx0cmV0dXJuICFCcm93c2VyLmlzSUUgJiYgISF3aW5kb3cuU3R5bGVNZWRpYTtcclxuXHR9XHJcblx0Ly8gQ2hyb21lIDErXHJcblx0c3RhdGljIGdldCBpc0Nocm9tZSgpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gISF3aW5kb3cuY2hyb21lICYmICEhd2luZG93LmNocm9tZS53ZWJzdG9yZTtcclxuXHR9XHJcblx0Ly8gQmxpbmsgZW5naW5lIGRldGVjdGlvblxyXG5cdHN0YXRpYyBnZXQgaXNCbGluaygpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gKEJyb3dzZXIuaXNDaHJvbWUgfHwgQnJvd3Nlci5pc09wZXJhKSAmJiAhIXdpbmRvdy5DU1M7XHJcblx0fVxyXG59XHJcblxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZGVmaW5pdGlvbnMudHNcIiAvPlxyXG5cclxuRWxlbWVudC5wcm90b3R5cGUuYXN0eWxlID0gZnVuY3Rpb24gYWN0dWFsU3R5bGUocHJvcHM6c3RyaW5nW10pIHtcclxuXHRsZXQgZWw6RWxlbWVudCA9IHRoaXM7XHJcblx0bGV0IGNvbXBTdHlsZTpDU1NTdHlsZURlY2xhcmF0aW9uID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpO1xyXG5cdGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRsZXQgc3R5bGU6c3RyaW5nID0gY29tcFN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcHNbaV0pO1xyXG5cdFx0aWYgKHN0eWxlICE9IG51bGwpIHtcclxuXHRcdFx0cmV0dXJuIHN0eWxlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbm5hbWVzcGFjZSB3b3tcclxuXHRjbGFzcyBEZXN0cm95ZXJ7XHJcblx0XHRkaXNwb3Npbmc6Ym9vbGVhbjtcclxuXHRcdGRlc3Ryb3lpbmc6Ym9vbGVhbjtcclxuXHRcdHN0YXRpYyBjb250YWluZXI6SFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cdFx0c3RhdGljIGRlc3Ryb3kodGFyZ2V0OkVsZW1lbnQpe1xyXG5cdFx0XHRpZiAoIXRhcmdldC5kZXN0cm95U3RhdHVzKXtcclxuXHRcdFx0XHR0YXJnZXQuZGVzdHJveVN0YXR1cyA9IG5ldyBEZXN0cm95ZXIoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodGFyZ2V0LmRpc3Bvc2UgJiYgIXRhcmdldC5kZXN0cm95U3RhdHVzLmRpc3Bvc2luZyl7XHJcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGlzcG9zaW5nID0gdHJ1ZTtcclxuXHRcdFx0XHR0YXJnZXQuZGlzcG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghdGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGVzdHJveWluZyl7XHJcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGVzdHJveWluZyA9IHRydWU7XHJcblx0XHRcdFx0RGVzdHJveWVyLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0YXJnZXQpO1xyXG5cdFx0XHRcdGZvcihsZXQgaSBpbiB0YXJnZXQpe1xyXG5cdFx0XHRcdFx0aWYgKGkuaW5kZXhPZignJCcpID09IDApe1xyXG5cdFx0XHRcdFx0XHRsZXQgdG1wOmFueSA9IHRhcmdldFtpXTtcclxuXHRcdFx0XHRcdFx0aWYgKHRtcCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcclxuXHRcdFx0XHRcdFx0XHR0YXJnZXRbaV0gPSBudWxsO1xyXG5cdFx0XHRcdFx0XHRcdHRtcCA9IG51bGw7XHJcblx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB0YXJnZXRbaV07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0RGVzdHJveWVyLmNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3kodGFyZ2V0OmFueSk6dm9pZHtcclxuXHRcdGlmICh0YXJnZXQubGVuZ3RoID4gMCB8fCB0YXJnZXQgaW5zdGFuY2VvZiBBcnJheSl7XHJcblx0XHRcdGZvcihsZXQgaSBvZiB0YXJnZXQpe1xyXG5cdFx0XHRcdERlc3Ryb3llci5kZXN0cm95KGkpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpe1xyXG5cdFx0XHRcdERlc3Ryb3llci5kZXN0cm95KHRhcmdldCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRleHBvcnQgZnVuY3Rpb24gY2VudGVyU2NyZWVuKHRhcmdldDphbnkpe1xyXG5cdFx0bGV0IHJlY3QgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblx0XHR0YXJnZXQuc3R5bGUucG9zaXRpb24gPSBcImZpeGVkXCI7XHJcblx0XHR0YXJnZXQuc3R5bGUubGVmdCA9IFwiNTAlXCI7XHJcblx0XHR0YXJnZXQuc3R5bGUudG9wID0gXCI1MCVcIjtcclxuXHRcdHRhcmdldC5zdHlsZS5tYXJnaW5Ub3AgPSAtcmVjdC5oZWlnaHQgLyAyICsgXCJweFwiO1xyXG5cdFx0dGFyZ2V0LnN0eWxlLm1hcmdpbkxlZnQgPSAtcmVjdC53aWR0aCAvIDIgKyBcInB4XCI7XHJcblx0fVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2ZvdW5kYXRpb24vZWxlbWVudHMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgV2lkZ2V0cy5jYXJkID0gZnVuY3Rpb24oKTphbnl7XHJcbiAgICAgICAgcmV0dXJuICB7XHJcbiAgICAgICAgICAgIHRhZzpcImRpdlwiLFxyXG4gICAgICAgICAgICBjbGFzczpcImNhcmRcIixcclxuICAgICAgICAgICAgdXNlOmZ1bmN0aW9uKGpzb246YW55KXtcclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHdvLnVzZShqc29uKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRib2R5KXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRib2R5LmFwcGVuZENoaWxkKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAkOltcclxuICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJ0aXRsZSBub3NlbGVjdFwiLCAkOltcclxuICAgICAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwidHh0XCIsIGFsaWFzOlwidGl0bGVcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcImN0cmxzXCIsICQ6W1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwid2J0blwiLCBvbmNsaWNrOiBmdW5jdGlvbihldmVudDphbnkpe3dvLmRlc3Ryb3kodGhpcy4kYm9yZGVyKTt9LCAkOlwiWFwifVxyXG4gICAgICAgICAgICAgICAgICAgIF19XHJcbiAgICAgICAgICAgICAgICBdfSxcclxuICAgICAgICAgICAgICAgIHsgdGFnOlwiZGl2XCIsIGNsYXNzOlwiYm9keVwiLCBhbGlhczpcImJvZHlcIiB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2ZvdW5kYXRpb24vZWxlbWVudHMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIHdve1xyXG4gICAgV2lkZ2V0cy5jb3ZlciA9IGZ1bmN0aW9uKCk6YW55e1xyXG4gICAgICAgIHJldHVybntcclxuICAgICAgICAgICAgdGFnOlwiZGl2XCIsXHJcbiAgICAgICAgICAgIGNsYXNzOlwiY292ZXJcIixcclxuICAgICAgICAgICAgc3R5bGU6e2Rpc3BsYXk6J25vbmUnfSxcclxuICAgICAgICAgICAgc2hvdzpmdW5jdGlvbihjYWxsYmFjazphbnkpOnZvaWR7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRjaGlsZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kY2hpbGQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spe1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LGhpZGU6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRjaGlsZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgd28uZGVzdHJveSh0aGlzLiRjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuJGNoaWxkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25oaWRlKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LG1hZGU6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3YgPSAoZG9jdW1lbnQuYm9keSBhcyBhbnkpLiRnY3YkO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN2KXtcclxuICAgICAgICAgICAgICAgICAgICB3by5kZXN0cm95KGN2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAoZG9jdW1lbnQuYm9keSBhcyBhbnkpLiRnY3YkID0gdGhpcztcclxuICAgICAgICAgICAgfSxvbmNsaWNrOmZ1bmN0aW9uKGV2ZW50OmFueSl7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kJHRvdWNoY2xvc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LGFwcGVuZDpmdW5jdGlvbihjaGlsZDphbnkpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kY2hpbGQgPSBjaGlsZDtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTsgXHJcbiAgICB9IFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNvdmVyKGpzb246YW55KTphbnl7XHJcbiAgICAgICAgbGV0IGN2ID0gd28udXNlKHtcclxuICAgICAgICAgICAgdWk6J2NvdmVyJyxcclxuICAgICAgICAgICAgJCR0b3VjaGNsb3NlOnRydWUsXHJcbiAgICAgICAgICAgICQ6anNvblxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGN2LnNob3coZnVuY3Rpb24oZWw6YW55KXtcclxuICAgICAgICAgICAgd28uY2VudGVyU2NyZWVuKGVsLiRib3ggfHwgZWwuJGNoaWxkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjdi5vbmhpZGUgPSBqc29uLm9uaGlkZTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9mb3VuZGF0aW9uL2VsZW1lbnRzLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSB3b3tcclxuICAgIFdpZGdldHMuZHJvcGRvd24gPSBmdW5jdGlvbigpOmFueXtcclxuICAgICAgICByZXR1cm4gIHtcclxuICAgICAgICAgICAgdGFnOlwiZGl2XCIsXHJcbiAgICAgICAgICAgIGNsYXNzOlwiZHJvcGRvd25cIixcclxuICAgICAgICAgICAgb25zZXQ6IGZ1bmN0aW9uKHZhbDphbnkpOnZvaWR7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJDpbXHJcbiAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwidGl0bGUgbm9zZWxlY3RcIiwgJDpbXHJcbiAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcInR4dFwiLCBhbGlhczpcInRpdGxlXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJjdHJsc1wiLCAkOltcclxuICAgICAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcIndidG5cIiwgb25jbGljazogZnVuY3Rpb24oZXZlbnQ6YW55KXt3by5kZXN0cm95KHRoaXMuJGJvcmRlcik7fSwgJDpcIlhcIn1cclxuICAgICAgICAgICAgICAgICAgICBdfVxyXG4gICAgICAgICAgICAgICAgXX0sXHJcbiAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwiYm9keVwiLCBhbGlhczpcImJvZHlcIn1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZm91bmRhdGlvbi9lbGVtZW50cy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9idWlsZGVyL3VpY3JlYXRvci50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2Ugd297XHJcbiAgICBXaWRnZXRzLmxvYWRpbmcgPSBmdW5jdGlvbigpOmFueXtcclxuICAgICAgICByZXR1cm57XHJcbiAgICAgICAgICAgIHRhZzpcImRpdlwiLFxyXG4gICAgICAgICAgICBjbGFzczpcImxvYWRpbmdcIixcclxuICAgICAgICAgICAgbWFkZTogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGxldCBwMSA9IHdvLnVzZSh7dWk6XCJhcmNcIn0pO1xyXG4gICAgICAgICAgICAgICAgcDEuc2V0QXR0cmlidXRlTlMobnVsbCwgXCJjbGFzc1wiLCBcImFyYyBwMVwiKTtcclxuICAgICAgICAgICAgICAgIHAxLnVwZGF0ZShbMTYsIDQ4XSwgMTYsIDI3MCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzYm94LmFwcGVuZENoaWxkKHAxKTsgICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHAyID0gd28udXNlKHt1aTpcImFyY1wifSk7XHJcbiAgICAgICAgICAgICAgICBwMi5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcImNsYXNzXCIsIFwiYXJjIHAxXCIpO1xyXG4gICAgICAgICAgICAgICAgcDIudXBkYXRlKFsxNiwgNDhdLCAxNiwgMjcwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNib3guYXBwZW5kQ2hpbGQocDIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vJGVsZW1lbnQudmVsb2NpdHkoeyBvcGFjaXR5OiAxIH0sIHsgZHVyYXRpb246IDEwMDAgfSk7XHJcbiAgICAgICAgICAgICAgICBwMS5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBcIjMycHggMzJweFwiO1xyXG4gICAgICAgICAgICAgICAgcDIuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gXCI1MCUgNTAlXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHQxID0gMjAwMCwgdDI9MTQwMDtcclxuICAgICAgICAgICAgICAgICgkKHAxKSBhcyBhbnkpLnZlbG9jaXR5KHtyb3RhdGVaOlwiLT0zNjBkZWdcIn0sIHtkdXJhdGlvbjp0MSwgZWFzaW5nOlwibGluZWFyXCJ9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGhhbmRsZTEgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKCQocDEpIGFzIGFueSkudmVsb2NpdHkoe3JvdGF0ZVo6XCItPTM2MGRlZ1wifSwge2R1cmF0aW9uOnQxLCBlYXNpbmc6XCJsaW5lYXJcIn0pO1xyXG4gICAgICAgICAgICAgICAgfSwgdDEpO1xyXG4gICAgICAgICAgICAgICAgKCQocDIpIGFzIGFueSkudmVsb2NpdHkoe3JvdGF0ZVo6XCIrPTM2MGRlZ1wifSwge2R1cmF0aW9uOnQyLCBlYXNpbmc6XCJsaW5lYXJcIiwgbG9vcDp0cnVlfSk7XHJcbiAgICAgICAgICAgIH0sJDp7XHJcbiAgICAgICAgICAgICAgICBzZzpcInN2Z1wiLFxyXG4gICAgICAgICAgICAgICAgYWxpYXM6XCJzYm94XCIsXHJcbiAgICAgICAgICAgICAgICBzdHlsZTp7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6NjQsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OjY0XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9OyBcclxuICAgIH07IFxyXG4gICAgV2lkZ2V0cy5hcmMgPSBmdW5jdGlvbigpOmFueXtcclxuICAgICAgICByZXR1cm57XHJcbiAgICAgICAgICAgIHNnOlwicGF0aFwiLFxyXG4gICAgICAgICAgICB1cGRhdGU6ZnVuY3Rpb24oY2VudGVyOm51bWJlcltdLCByYWRpdXM6bnVtYmVyLCBhbmdsZTpudW1iZXIpOnZvaWR7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGVuZCA9IHBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyWzBdLCBjZW50ZXJbMV0sIHJhZGl1cywgYW5nbGUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBzdGFydCA9IFtjZW50ZXJbMF0gKyByYWRpdXMsIGNlbnRlclsxXV07XHJcbiAgICAgICAgICAgICAgICBsZXQgZCA9IFtcIk1cIiArIHBzdGFydFswXSwgcHN0YXJ0WzFdLCBcIkFcIiArIHJhZGl1cywgcmFkaXVzLCBcIjAgMSAwXCIsIHBlbmRbMF0sIHBlbmRbMV1dO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcImRcIiwgZC5qb2luKFwiIFwiKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIHBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyWDpudW1iZXIsIGNlbnRlclk6bnVtYmVyLCByYWRpdXM6bnVtYmVyLCBhbmdsZUluRGVncmVlczpudW1iZXIpIHtcclxuICAgICAgICBsZXQgYW5nbGVJblJhZGlhbnMgPSBhbmdsZUluRGVncmVlcyAqIE1hdGguUEkgLyAxODAuMDtcclxuICAgICAgICBsZXQgeCA9IGNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgICAgbGV0IHkgPSBjZW50ZXJZICsgcmFkaXVzICogTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICAgIHJldHVybiBbeCx5XTtcclxuICAgIH1cclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
