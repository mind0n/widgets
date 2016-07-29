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

function testfunc() {
    return true;
}

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
                                domapply(nodes[j], item);
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

/// <reference path="./foundation/definitions.ts" />
/// <reference path="./builder/use.ts" />
/// <reference path="./builder/domcreator.ts" />
/// <reference path="./builder/svgcreator.ts" />
/// <reference path="./builder/uicreator.ts" />
wo.Creators.add(new wo.DomCreator());
wo.Creators.add(new wo.SvgCreator());
wo.Creators.add(new wo.UiCreator());

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
                this.$body.appendChild(child);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHMiLCJmaW5nZXJzL3BhdHRlcm5zLnRzIiwiZmluZ2Vycy9yZWNvZ25pemVyLnRzIiwiZmluZ2Vycy90b3VjaC50cyIsImZpbmdlcnMvem9vbWVyLnRzIiwiZmluZ2Vycy9maW5nZXIudHMiLCJmaW5nZXJzL3JvdGF0b3IudHMiLCJ1dC91dGFyZ2V0LnRzIiwid28vZm91bmRhdGlvbi9zdHJpbmcudHMiLCJ3by9idWlsZGVyL3VzZS50cyIsIndvL2J1aWxkZXIvZG9tY3JlYXRvci50cyIsIndvL2J1aWxkZXIvc3ZnY3JlYXRvci50cyIsIndvL2J1aWxkZXIvdWljcmVhdG9yLnRzIiwid28vd28udHMiLCJ3by9mb3VuZGF0aW9uL2RldmljZS50cyIsIndvL2ZvdW5kYXRpb24vZWxlbWVudHMudHMiLCJ3by93aWRnZXRzL2NhcmQvY2FyZC50cyIsIndvL3dpZGdldHMvY292ZXIvY292ZXIudHMiLCJ3by93aWRnZXRzL2Ryb3Bkb3duL2Ryb3Bkb3duLnRzIiwid28vd2lkZ2V0cy9sb2FkaW5nL2xvYWRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBbUNBLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVUsSUFBUTtJQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMxQixDQUFDLENBQUE7QUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLFNBQWtCO0lBQ25ELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDcEIsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUM7UUFDL0IsaUJBQWlCO1FBQ2pCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixHQUFHLEdB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ckIsSUFBSSxDQUFDLEdBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZILElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLHlEQUF5RDtZQUN4RixJQUFJLENBQUMsR0FBUTtnQkFDVCxHQUFHLEVBQUMsV0FBVztnQkFDZixJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FB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Q0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzlELElBQUksS0FBSyxHQUFHLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsTUFBTSxFQUFDLENBQUM7d0JBRTVDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3dCQUM3QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFFOUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQzVCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUUzQixFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ3RELEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzt3QkFFdkQsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO3dCQUNyRCxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMs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QUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ1Msd0JBQVUsR0FBcEI7WUFDSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0YsSUFBSSxDQUFDLEdBQU8sRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFDLENBQUMsRUFBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxL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LENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RGLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEQsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDLENBQUM7SUFDRiwwQkFBMEIsT0FBYyxFQUFFLE9BQWMsRUFBRSxNQUFhLEVBQUUsY0FBcUI7UUFDMUYsSUFBSSxjQUFjLEdBQUcsY0FBYyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ3RELElBQUksQ0FBQyxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsR0FBRyxPQUFPLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLENBQUM7QUFDTCxDQUFDLEVBckRTLEVBQUUsS0FBRixFQUFFLFFBcURYIiwiZmlsZSI6IndvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW50ZXJmYWNlIFdpbmRvd3tcblx0b3ByOmFueTtcblx0b3BlcmE6YW55O1xuXHRjaHJvbWU6YW55O1xuXHRTdHlsZU1lZGlhOmFueTtcblx0SW5zdGFsbFRyaWdnZXI6YW55O1xuXHRDU1M6YW55O1xufVxuXG5pbnRlcmZhY2UgRG9jdW1lbnR7XG5cdGRvY3VtZW50TW9kZTphbnk7XG59XG5cbi8vIEVsZW1lbnQudHNcbmludGVyZmFjZSBFbGVtZW50e1xuXHRbbmFtZTpzdHJpbmddOmFueTtcblx0YXN0eWxlKHN0eWxlczpzdHJpbmdbXSk6c3RyaW5nO1xuXHRzZXQodmFsOmFueSk6dm9pZDtcblx0ZGVzdHJveVN0YXR1czphbnk7XG5cdGRpc3Bvc2UoKTphbnk7XG59XG5cbmludGVyZmFjZSBOb2Rle1xuXHRjdXJzb3I6YW55O1xufVxuXG5pbnRlcmZhY2UgU3RyaW5ne1xuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XG59XG5cbmludGVyZmFjZSBBcnJheTxUPntcblx0YWRkKGl0ZW06VCk6dm9pZDtcblx0Y2xlYXIoZGVsPzpib29sZWFuKTp2b2lkO1xufVxuXG5BcnJheS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGl0ZW06YW55KSB7XG5cdHRoaXNbdGhpcy5sZW5ndGhdID0gaXRlbTtcbn1cblxuQXJyYXkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKGtlZXBhbGl2ZT86Ym9vbGVhbikge1xuXHRsZXQgbiA9IHRoaXMubGVuZ3RoO1xuXHRmb3IobGV0IGkgPSBuIC0gMTsgaSA+PSAwOyBpLS0pe1xuXHRcdC8vZGVsZXRlIHRoaXNbaV07XG5cdFx0bGV0IHRtcCA9IHRoaXMucG9wKCk7XG5cdFx0dG1wID0gbnVsbDtcblx0fVxufVxuIiwiXHJcbm5hbWVzcGFjZSBmaW5nZXJze1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW47XHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmFueTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgbGV0IFBhdHRlcm5zOmFueSA9IHt9O1xyXG4gICAgXHJcbiAgICBjbGFzcyBUb3VjaGVkUGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDEgJiYgYWN0c1swXS5hY3QgPT0gXCJ0b3VjaGVuZFwiICYmIHF1ZXVlLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCBwcmV2ID0gcXVldWVbMV07XHJcbiAgICAgICAgICAgIC8vZGVidWdnZXI7XHJcbiAgICAgICAgICAgIGlmIChwcmV2ICYmIHByZXYubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICAgICAgbGV0IGFjdCA9IHByZXZbMF07XHJcbiAgICAgICAgICAgICAgICBsZXQgZHJhZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKG91dHEgIT0gbnVsbCAmJiBvdXRxLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWN0OmFueSA9IG91dHFbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhY3QgJiYgKHBhY3QuYWN0ID09IFwiZHJhZ2dpbmdcIiB8fCBwYWN0LmFjdCA9PSBcImRyYWdzdGFydFwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghZHJhZyl7IFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpPDM7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBxID0gcXVldWVbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxWzBdLmFjdCA9PSBcInRvdWNoc3RhcnRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdDpcInRvdWNoZWRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsYXNzIERyYWdnaW5nUGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAxIFxyXG4gICAgICAgICAgICAgICAgJiYgYWN0c1swXS5hY3QgPT0gXCJ0b3VjaG1vdmVcIiBcclxuICAgICAgICAgICAgICAgICYmIHF1ZXVlLmxlbmd0aCA+IDI7XHJcbiAgICAgICAgICAgIGlmIChybHQpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBsZXQgczEgPSBxdWV1ZVsyXTtcclxuICAgICAgICAgICAgICAgIGxldCBzMiA9IHF1ZXVlWzFdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHMxLmxlbmd0aCA9PSAxICYmIHMyLmxlbmd0aCA9PSAxKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYTEgPSBzMVswXTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYTIgPSBzMlswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYTEuYWN0ID09IFwidG91Y2hzdGFydFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9kZWJ1Z2dlcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGExLmFjdCA9PSBcInRvdWNoc3RhcnRcIiAmJiBhMi5hY3QgPT0gXCJ0b3VjaG1vdmVcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2UgaWYgKGExLmFjdCA9PSBcInRvdWNobW92ZVwiICYmIGEyLmFjdCA9PSBcInRvdWNobW92ZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IHByZXYgPSBxdWV1ZVsyXTtcclxuICAgICAgICAgICAgaWYgKHByZXYubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICAgICAgbGV0IGFjdCA9IHByZXZbMF07XHJcbiAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0LmFjdCA9PSBcInRvdWNoc3RhcnRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0OlwiZHJhZ3N0YXJ0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKGFjdC5hY3QgPT0gXCJ0b3VjaG1vdmVcIiAmJiBvdXRxLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByYWN0ID0gb3V0cVswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmFjdC5hY3QgPT0gXCJkcmFnc3RhcnRcIiB8fCByYWN0LmFjdCA9PSBcImRyYWdnaW5nXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0OlwiZHJhZ2dpbmdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBEcm9wUGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDEgJiYgYWN0c1swXS5hY3QgPT0gXCJ0b3VjaGVuZFwiICYmIHF1ZXVlLmxlbmd0aCA+IDAgJiYgb3V0cS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIC8vbGV0IHByZXYgPSBxdWV1ZVsxXTtcclxuICAgICAgICAgICAgbGV0IGFjdCA9IG91dHFbMF07XHJcbiAgICAgICAgICAgIGlmIChhY3QuYWN0ID09IFwiZHJhZ2dpbmdcIiB8fCBhY3QuYWN0ID09IFwiZHJhZ3N0YXJ0XCIpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Q6XCJkcm9wcGVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBEYmxUb3VjaGVkUGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAxICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2hlbmRcIiAmJiBxdWV1ZS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLCBvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgcHJldiA9IHF1ZXVlWzFdO1xyXG4gICAgICAgICAgICBpZiAocHJldiAmJiBwcmV2Lmxlbmd0aCA9PSAxKXtcclxuICAgICAgICAgICAgICAgIGxldCBhY3QgPSBwcmV2WzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKG91dHEgIT0gbnVsbCAmJiBvdXRxLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWN0OmFueSA9IG91dHFbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhY3QgJiYgcGFjdC5hY3QgPT0gXCJ0b3VjaGVkXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0LmFjdCA9PSBcInRvdWNoc3RhcnRcIiB8fCBhY3QuYWN0ID09IFwidG91Y2htb3ZlXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjdC50aW1lIC0gcGFjdC50aW1lIDwgNTAwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJkYmx0b3VjaGVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0OlwidG91Y2hlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lOmFjdC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2FsY0FuZ2xlKGE6aWFjdCwgYjppYWN0LCBsZW46bnVtYmVyKTpudW1iZXJ7XHJcbiAgICAgICAgbGV0IGFnID0gTWF0aC5hY29zKChiLmNwb3NbMF0gLSBhLmNwb3NbMF0pL2xlbikgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgICAgIGlmIChiLmNwb3NbMV0gPCBhLmNwb3NbMV0pe1xyXG4gICAgICAgICAgICBhZyo9LTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhZztcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBab29tU3RhcnRQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMiBcclxuICAgICAgICAgICAgICAgICYmICgoYWN0c1swXS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIgfHwgYWN0c1sxXS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgfHwob3V0cS5sZW5ndGggPiAwIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNobW92ZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBhY3RzWzFdLmFjdCA9PSBcInRvdWNobW92ZVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBvdXRxWzBdLmFjdCAhPSBcInpvb21pbmdcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgb3V0cVswXS5hY3QgIT0gXCJ6b29tc3RhcnRcIiApKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IGFjdHMgPSBxdWV1ZVswXTtcclxuICAgICAgICAgICAgbGV0IGE6aWFjdCA9IGFjdHNbMF07XHJcbiAgICAgICAgICAgIGxldCBiOmlhY3QgPSBhY3RzWzFdO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gTWF0aC5zcXJ0KChiLmNwb3NbMF0gLSBhLmNwb3NbMF0pKihiLmNwb3NbMF0gLSBhLmNwb3NbMF0pICsgKGIuY3Bvc1sxXSAtIGEuY3Bvc1sxXSkqKGIuY3Bvc1sxXSAtIGEuY3Bvc1sxXSkpO1xyXG4gICAgICAgICAgICBsZXQgb3dpZHRoID0gTWF0aC5hYnMoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKTtcclxuICAgICAgICAgICAgbGV0IG9oZWlnaHQgPSBNYXRoLmFicyhiLmNwb3NbMV0gLSBhLmNwb3NbMV0pO1xyXG4gICAgICAgICAgICBsZXQgYWcgPSBjYWxjQW5nbGUoYSwgYiwgbGVuKTsgLy9NYXRoLmFjb3MoKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkvbGVuKSAvIE1hdGguUEkgKiAxODA7XHJcbiAgICAgICAgICAgIGxldCByOmlhY3QgPSB7XHJcbiAgICAgICAgICAgICAgICBhY3Q6XCJ6b29tc3RhcnRcIixcclxuICAgICAgICAgICAgICAgIGNwb3M6WyhhLmNwb3NbMF0gKyBiLmNwb3NbMF0pLzIsIChhLmNwb3NbMV0gKyBiLmNwb3NbMV0pLzJdLFxyXG4gICAgICAgICAgICAgICAgbGVuOmxlbixcclxuICAgICAgICAgICAgICAgIGFuZ2xlOmFnLFxyXG4gICAgICAgICAgICAgICAgb3dpZHRoOm93aWR0aCxcclxuICAgICAgICAgICAgICAgIG9oZWlnaHQ6b2hlaWdodCxcclxuICAgICAgICAgICAgICAgIHRpbWU6YS50aW1lXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBab29tUGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDIgXHJcbiAgICAgICAgICAgICAgICAmJiAoYWN0c1swXS5hY3QgIT0gXCJ0b3VjaGVuZFwiICYmIGFjdHNbMV0uYWN0ICE9IFwidG91Y2hlbmRcIilcclxuICAgICAgICAgICAgICAgICYmIChhY3RzWzBdLmFjdCA9PSBcInRvdWNobW92ZVwiIHx8IGFjdHNbMV0uYWN0ID09IFwidG91Y2htb3ZlXCIpXHJcbiAgICAgICAgICAgICAgICAmJiBvdXRxLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgICYmIChvdXRxWzBdLmFjdCA9PSBcInpvb21zdGFydFwiIHx8IG91dHFbMF0uYWN0ID09IFwiem9vbWluZ1wiKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IGFjdHMgPSBxdWV1ZVswXTtcclxuICAgICAgICAgICAgbGV0IGE6aWFjdCA9IGFjdHNbMF07XHJcbiAgICAgICAgICAgIGxldCBiOmlhY3QgPSBhY3RzWzFdO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gTWF0aC5zcXJ0KChiLmNwb3NbMF0gLSBhLmNwb3NbMF0pKihiLmNwb3NbMF0gLSBhLmNwb3NbMF0pICsgKGIuY3Bvc1sxXSAtIGEuY3Bvc1sxXSkqKGIuY3Bvc1sxXSAtIGEuY3Bvc1sxXSkpO1xyXG4gICAgICAgICAgICBsZXQgYWcgPSBjYWxjQW5nbGUoYSwgYiwgbGVuKTsgLy9NYXRoLmFjb3MoKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkvbGVuKSAvIE1hdGguUEkgKiAxODA7XHJcbiAgICAgICAgICAgIGxldCBvd2lkdGggPSBNYXRoLmFicyhiLmNwb3NbMF0gLSBhLmNwb3NbMF0pO1xyXG4gICAgICAgICAgICBsZXQgb2hlaWdodCA9IE1hdGguYWJzKGIuY3Bvc1sxXSAtIGEuY3Bvc1sxXSk7XHJcbiAgICAgICAgICAgIGxldCByOmlhY3QgPSB7XHJcbiAgICAgICAgICAgICAgICBhY3Q6XCJ6b29taW5nXCIsXHJcbiAgICAgICAgICAgICAgICBjcG9zOlsoYS5jcG9zWzBdICsgYi5jcG9zWzBdKS8yLCAoYS5jcG9zWzFdICsgYi5jcG9zWzFdKS8yXSxcclxuICAgICAgICAgICAgICAgIGxlbjpsZW4sXHJcbiAgICAgICAgICAgICAgICBhbmdsZTphZyxcclxuICAgICAgICAgICAgICAgIG93aWR0aDpvd2lkdGgsXHJcbiAgICAgICAgICAgICAgICBvaGVpZ2h0Om9oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB0aW1lOmEudGltZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgWm9vbUVuZFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBvdXRxLmxlbmd0aCA+IDAgXHJcbiAgICAgICAgICAgICAgICAmJiAob3V0cVswXS5hY3QgPT0gXCJ6b29tc3RhcnRcIiB8fCBvdXRxWzBdLmFjdCA9PSBcInpvb21pbmdcIilcclxuICAgICAgICAgICAgICAgICYmIGFjdHMubGVuZ3RoIDw9MjtcclxuICAgICAgICAgICAgaWYgKHJsdCl7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUuZGlyKGFjdHMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFjdHMubGVuZ3RoIDwgMil7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgb2YgYWN0cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpLmFjdCA9PSBcInRvdWNoZW5kXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLCBvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgcjppYWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgYWN0Olwiem9vbWVuZFwiLFxyXG4gICAgICAgICAgICAgICAgY3BvczpbMCwgMF0sXHJcbiAgICAgICAgICAgICAgICBsZW46MCxcclxuICAgICAgICAgICAgICAgIGFuZ2xlOjAsXHJcbiAgICAgICAgICAgICAgICBvd2lkdGg6MCxcclxuICAgICAgICAgICAgICAgIG9oZWlnaHQ6MCxcclxuICAgICAgICAgICAgICAgIHRpbWU6bmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBQYXR0ZXJucy56b29tZW5kID0gbmV3IFpvb21FbmRQYXR0ZXJuKCk7XHJcbiAgICBQYXR0ZXJucy56b29taW5nID0gbmV3IFpvb21QYXR0ZXJuKCk7XHJcbiAgICBQYXR0ZXJucy56b29tc3RhcnQgPSBuZXcgWm9vbVN0YXJ0UGF0dGVybigpO1xyXG4gICAgUGF0dGVybnMuZHJhZ2dpbmcgPSBuZXcgRHJhZ2dpbmdQYXR0ZXJuKCk7XHJcbiAgICBQYXR0ZXJucy5kcm9wcGVkID0gbmV3IERyb3BQYXR0ZXJuKCk7XHJcbiAgICBQYXR0ZXJucy50b3VjaGVkID0gbmV3IFRvdWNoZWRQYXR0ZXJuKCk7XHJcbiAgICBQYXR0ZXJucy5kYmx0b3VjaGVkID0gbmV3IERibFRvdWNoZWRQYXR0ZXJuKCk7XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3dvL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXR0ZXJucy50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgaWFjdHtcclxuICAgICAgICBhY3Q6c3RyaW5nLFxyXG4gICAgICAgIGNwb3M6bnVtYmVyW10sXHJcbiAgICAgICAgcnBvcz86bnVtYmVyW10sXHJcbiAgICAgICAgb2hlaWdodD86bnVtYmVyLFxyXG4gICAgICAgIG93aWR0aD86bnVtYmVyLFxyXG4gICAgICAgIGxlbj86bnVtYmVyLFxyXG4gICAgICAgIGFuZ2xlPzpudW1iZXIsXHJcbiAgICAgICAgdGltZT86bnVtYmVyXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFJlY29nbml6ZXJ7XHJcbiAgICAgICAgaW5xdWV1ZTphbnlbXSA9IFtdO1xyXG4gICAgICAgIG91dHF1ZXVlOmlhY3RbXSA9IFtdO1xyXG4gICAgICAgIHBhdHRlcm5zOmlwYXR0ZXJuW10gPSBbXTtcclxuICAgICAgICBjZmc6YW55O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihjZmc6YW55KXtcclxuICAgICAgICAgICAgbGV0IGRlZnBhdHRlcm5zID0gW1wiem9vbWVuZFwiLCBcInpvb21zdGFydFwiLCBcInpvb21pbmdcIiwgXCJkYmx0b3VjaGVkXCIsIFwidG91Y2hlZFwiLCBcImRyb3BwZWRcIiwgXCJkcmFnZ2luZ1wiXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICghY2ZnKXtcclxuICAgICAgICAgICAgICAgIGNmZyA9IHtwYXR0ZXJuczpkZWZwYXR0ZXJuc307XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghY2ZnLnBhdHRlcm5zKXtcclxuICAgICAgICAgICAgICAgIGNmZy5wYXR0ZXJucyA9IGRlZnBhdHRlcm5zO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNmZyA9IGNmZztcclxuICAgICAgICAgICAgZm9yKGxldCBpIG9mIGNmZy5wYXR0ZXJucyl7XHJcbiAgICAgICAgICAgICAgICBpZiAoUGF0dGVybnNbaV0pe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGF0dGVybnMuYWRkKFBhdHRlcm5zW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhcnNlKGFjdHM6aWFjdFtdKTp2b2lke1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY2ZnLnFsZW4pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZmcucWxlbiA9IDEyO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlucXVldWUuc3BsaWNlKDAsIDAsIGFjdHMpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pbnF1ZXVlLmxlbmd0aCA+IHRoaXMuY2ZnLnFsZW4pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnF1ZXVlLnNwbGljZSh0aGlzLmlucXVldWUubGVuZ3RoIC0gMSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNmZy5vbiAmJiB0aGlzLmNmZy5vbi50YXApe1xyXG4gICAgICAgICAgICAgICAgZm9yKGxldCBpIG9mIGFjdHMpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vYWN0cy5sZW5ndGggPj0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNoc3RhcnRcIiAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpLmFjdCA9PSBcInRvdWNoc3RhcnRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2ZnLm9uLnRhcChhY3RzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IHBhdHRlcm4gb2YgdGhpcy5wYXR0ZXJucyl7XHJcbiAgICAgICAgICAgICAgICBpZiAocGF0dGVybi52ZXJpZnkoYWN0cywgdGhpcy5pbnF1ZXVlLCB0aGlzLm91dHF1ZXVlKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJsdCA9IHBhdHRlcm4ucmVjb2duaXplKHRoaXMuaW5xdWV1ZSwgdGhpcy5vdXRxdWV1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJsdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3V0cXVldWUuc3BsaWNlKDAsIDAsIHJsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm91dHF1ZXVlLmxlbmd0aCA+IHRoaXMuY2ZnLnFsZW4pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vdXRxdWV1ZS5zcGxpY2UodGhpcy5vdXRxdWV1ZS5sZW5ndGggLSAxLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcSA9IHRoaXMuaW5xdWV1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnF1ZXVlID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHEuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2ZnLm9uICYmIHRoaXMuY2ZnLm9uW3JsdC5hY3RdKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2ZnLm9uW3JsdC5hY3RdKHJsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2ZnLm9ucmVjb2duaXplZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNmZy5vbnJlY29nbml6ZWQocmx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicmVjb2duaXplci50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGxldCBpbml0ZWQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBjbGFzcyB6b29tc2lte1xyXG4gICAgICAgIG9wcG86aWFjdDtcclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlKGFjdDppYWN0KTp2b2lke1xyXG4gICAgICAgICAgICBsZXQgbSA9IFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgvMiwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodC8yXTtcclxuICAgICAgICAgICAgdGhpcy5vcHBvID0ge2FjdDphY3QuYWN0LCBjcG9zOlsyKm1bMF0gLSBhY3QuY3Bvc1swXSwgMiptWzFdIC0gYWN0LmNwb3NbMV1dLCB0aW1lOmFjdC50aW1lfTtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhY3QuY3Bvc1sxXSwgbVsxXSwgdGhpcy5vcHBvLmNwb3NbMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdGFydChhY3Q6aWFjdCk6aWFjdFtde1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZShhY3QpO1xyXG4gICAgICAgICAgICByZXR1cm4gW2FjdCwgdGhpcy5vcHBvXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgem9vbShhY3Q6aWFjdCk6aWFjdFtde1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZShhY3QpO1xyXG4gICAgICAgICAgICByZXR1cm4gW2FjdCwgdGhpcy5vcHBvXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW5kKGFjdDppYWN0KTppYWN0W117XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKGFjdCk7XHJcbiAgICAgICAgICAgIHJldHVybiBbYWN0LCB0aGlzLm9wcG9dO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3Mgb2Zmc2V0c2ltIGV4dGVuZHMgem9vbXNpbXtcclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlKGFjdDppYWN0KTp2b2lke1xyXG4gICAgICAgICAgICB0aGlzLm9wcG8gPSB7YWN0OmFjdC5hY3QsIGNwb3M6W2FjdC5jcG9zWzBdICsgMTAwLCBhY3QuY3Bvc1sxXSArIDEwMF0sIHRpbWU6YWN0LnRpbWV9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgenM6em9vbXNpbSA9IG51bGw7XHJcbiAgICBsZXQgb3M6b2Zmc2V0c2ltID0gbnVsbDtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRvdWNoZXMoZXZlbnQ6YW55LCBpc2VuZD86Ym9vbGVhbik6YW55e1xyXG4gICAgICAgIGlmIChpc2VuZCl7XHJcbiAgICAgICAgICAgIHJldHVybiBldmVudC5jaGFuZ2VkVG91Y2hlcztcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50LnRvdWNoZXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0b3VjaChjZmc6YW55KTphbnl7XHJcbiAgICAgICAgbGV0IHJnOlJlY29nbml6ZXIgPSBuZXcgUmVjb2duaXplcihjZmcpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVBY3QobmFtZTpzdHJpbmcsIHg6bnVtYmVyLCB5Om51bWJlcik6aWFjdHtcclxuICAgICAgICAgICAgcmV0dXJuIHthY3Q6bmFtZSwgY3BvczpbeCwgeV0sIHRpbWU6bmV3IERhdGUoKS5nZXRUaW1lKCl9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlKGNmZzphbnksIGFjdHM6aWFjdFtdKTp2b2lke1xyXG4gICAgICAgICAgICBpZiAoIWNmZyB8fCAhY2ZnLmVuYWJsZWQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjZmcub25hY3Qpe1xyXG4gICAgICAgICAgICAgICAgY2ZnLm9uYWN0KHJnLmlucXVldWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJnLnBhcnNlKGFjdHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFpbml0ZWQpe1xyXG4gICAgICAgICAgICBkb2N1bWVudC5vbmNvbnRleHRtZW51ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICghTW9iaWxlRGV2aWNlLmFueSl7XHJcbiAgICAgICAgICAgICAgICB6cyA9IG5ldyB6b29tc2ltKCk7XHJcbiAgICAgICAgICAgICAgICBvcyA9IG5ldyBvZmZzZXRzaW0oKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNoc3RhcnRcIiwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PSAwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3Muc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgb3Mub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB6cy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCB6cy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdDppYWN0ID0gY3JlYXRlQWN0KFwidG91Y2htb3ZlXCIsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5idXR0b24gPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3RdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9zLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIG9zLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgenMuc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgenMub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaGVuZFwiLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCBvcy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpzLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIHpzLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdHM6aWFjdFtdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdWNoZXMgPSBnZXRvdWNoZXMoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpPHRvdWNoZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaHN0YXJ0XCIsIGl0ZW0uY2xpZW50WCwgaXRlbS5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0cy5hZGQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgYWN0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RzOmlhY3RbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3VjaGVzID0gZ2V0b3VjaGVzKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaG1vdmVcIiwgaXRlbS5jbGllbnRYLCBpdGVtLmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RzLmFkZChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBhY3RzKTtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQnJvd3Nlci5pc1NhZmFyaSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RzOmlhY3RbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3VjaGVzID0gZ2V0b3VjaGVzKGV2ZW50LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaGVuZFwiLCBpdGVtLmNsaWVudFgsIGl0ZW0uY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHMuYWRkKGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIGFjdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluaXRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjZmc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCB0b3VjaCA9IGZpbmdlcnMudG91Y2g7IiwiXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicmVjb2duaXplci50c1wiIC8+XG5cbm5hbWVzcGFjZSBmaW5nZXJze1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBab29tZXJ7XG4gICAgICAgIHByb3RlY3RlZCBzYWN0OmlhY3Q7XG4gICAgICAgIHByb3RlY3RlZCBwYWN0OmlhY3Q7XG4gICAgICAgIHByb3RlY3RlZCBzdGFydGVkOmJvb2xlYW47XG4gICAgICAgIG1hcHBpbmc6e307XG4gICAgICAgIGNvbnN0cnVjdG9yKGVsOmFueSl7XG4gICAgICAgICAgICBpZiAoIWVsLiR6b29tZXIkKXtcbiAgICAgICAgICAgICAgICBlbC4kem9vbWVyJCA9IFt0aGlzXTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGVsLiR6b29tZXIkW2VsLiR6b29tZXIkLmxlbmd0aF0gPSB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIERyYWcgZXh0ZW5kcyBab29tZXJ7XG4gICAgICAgIGNvbnN0cnVjdG9yKGVsOmFueSl7XG4gICAgICAgICAgICBzdXBlcihlbCk7XG4gICAgICAgICAgICBsZXQgem9vbWVyID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMubWFwcGluZyA9IHtcbiAgICAgICAgICAgICAgICBkcmFnc3RhcnQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zYWN0ID0gYWN0O1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIucGFjdCA9IGFjdDtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sIGRyYWdnaW5nOmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoem9vbWVyLnN0YXJ0ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAgPSB6b29tZXIucGFjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBbYWN0LmNwb3NbMF0gLSBwLmNwb3NbMF0sIGFjdC5jcG9zWzFdIC0gcC5jcG9zWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWx0YSA9IHtvZmZzZXQ6IG9mZnNldH07IFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGwgPSBlbC5hc3R5bGUoW1wibGVmdFwiXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdCA9IGVsLmFzdHlsZShbXCJ0b3BcIl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IHBhcnNlSW50KGwpICsgZGVsdGEub2Zmc2V0WzBdICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gcGFyc2VJbnQodCkgKyBkZWx0YS5vZmZzZXRbMV0gKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tZXIucGFjdCA9IGFjdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGRyYWdlbmQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zdGFydGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHBvaW50T25FbGVtZW50KGVsOmFueSwgZXZ0OnN0cmluZywgcG9zOm51bWJlcltdKXtcbiAgICAgICAgbGV0IHJsdCA9IFswLCAwXTtcbiAgICAgICAgZWwub25tb3VzZW92ZXIgPSBmdW5jdGlvbihldmVudDphbnkpe1xuICAgICAgICAgICAgcmx0ID0gW2V2ZW50Lm9mZnNldFgsIGV2ZW50Lm9mZnNldFldO1xuICAgICAgICB9XG4gICAgICAgIHNpbXVsYXRlKGVsLCBcIm1vdXNlb3ZlclwiLCBwb3MpO1xuICAgICAgICByZXR1cm4gcmx0O1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBab29tIGV4dGVuZHMgWm9vbWVye1xuICAgICAgICBwcm90ZWN0ZWQgcm90OmFueTtcbiAgICAgICAgY29uc3RydWN0b3IoZWw6YW55KXtcbiAgICAgICAgICAgIHN1cGVyKGVsKTtcbiAgICAgICAgICAgIGxldCB6b29tZXIgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5tYXBwaW5nID0ge1xuICAgICAgICAgICAgICAgIHpvb21zdGFydDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnNhY3QgPSBhY3Q7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5wYWN0ID0gYWN0O1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5yb3QgPSBSb3RhdG9yKGVsKTtcbiAgICAgICAgICAgICAgICB9LCB6b29taW5nOmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoem9vbWVyLnN0YXJ0ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAgPSB6b29tZXIuc2FjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBbYWN0LmNwb3NbMF0gLSBwLmNwb3NbMF0sIGFjdC5jcG9zWzFdIC0gcC5jcG9zWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3QgPSBhY3QuYW5nbGUgLSBwLmFuZ2xlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNjYWxlID0gYWN0LmxlbiAvIHAubGVuO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbHRhID0ge29mZnNldDogb2Zmc2V0LCBhbmdsZTpyb3QsIHNjYWxlOnNjYWxlfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjZW50ZXIgPSBwb2ludE9uRWxlbWVudChlbCwgXCJtb3VzZW92ZXJcIiwgYWN0LmNwb3MpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tZXIucm90LnJvdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zOm9mZnNldCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5nbGU6cm90LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6Y2VudGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlOnNjYWxlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb21lci5wYWN0ID0gYWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgem9vbWVuZDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnJvdC5jb21taXRTdGF0dXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIFpzaXplIGV4dGVuZHMgWm9vbWVye1xuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xuICAgICAgICAgICAgc3VwZXIoZWwpO1xuICAgICAgICAgICAgbGV0IHpvb21lciA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLm1hcHBpbmcgPSB7XG4gICAgICAgICAgICAgICAgem9vbXN0YXJ0OmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc2FjdCA9IGFjdDtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LHpvb21pbmc6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh6b29tZXIuc3RhcnRlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcCA9IHpvb21lci5wYWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IFthY3QuY3Bvc1swXSAtIHAuY3Bvc1swXSwgYWN0LmNwb3NbMV0gLSBwLmNwb3NbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlc2l6ZSA9IFthY3Qub3dpZHRoIC0gcC5vd2lkdGgsIGFjdC5vaGVpZ2h0IC0gcC5vaGVpZ2h0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWx0YSA9IHtvZmZzZXQ6IG9mZnNldCwgcmVzaXplOnJlc2l6ZX07XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3ID0gZWwuYXN0eWxlKFtcIndpZHRoXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBoID0gZWwuYXN0eWxlKFtcImhlaWdodFwiXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsID0gZWwuYXN0eWxlKFtcImxlZnRcIl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHQgPSBlbC5hc3R5bGUoW1widG9wXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUud2lkdGggPSBwYXJzZUludCh3KSArIGRlbHRhLnJlc2l6ZVswXSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLmhlaWdodCA9IHBhcnNlSW50KGgpICsgZGVsdGEucmVzaXplWzFdICsgXCJweFwiO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gcGFyc2VJbnQobCkgKyBkZWx0YS5vZmZzZXRbMF0gKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBwYXJzZUludCh0KSArIGRlbHRhLm9mZnNldFsxXSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LHpvb21lbmQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zdGFydGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2ltdWxhdGUoZWxlbWVudDphbnksIGV2ZW50TmFtZTpzdHJpbmcsIHBvczphbnkpIHtcbiAgICAgICAgZnVuY3Rpb24gZXh0ZW5kKGRlc3RpbmF0aW9uOmFueSwgc291cmNlOmFueSkge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4gc291cmNlKVxuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uW3Byb3BlcnR5XSA9IHNvdXJjZVtwcm9wZXJ0eV07XG4gICAgICAgICAgICByZXR1cm4gZGVzdGluYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZXZlbnRNYXRjaGVyczphbnkgPSB7XG4gICAgICAgICAgICAnSFRNTEV2ZW50cyc6IC9eKD86bG9hZHx1bmxvYWR8YWJvcnR8ZXJyb3J8c2VsZWN0fGNoYW5nZXxzdWJtaXR8cmVzZXR8Zm9jdXN8Ymx1cnxyZXNpemV8c2Nyb2xsKSQvLFxuICAgICAgICAgICAgJ01vdXNlRXZlbnRzJzogL14oPzpjbGlja3xkYmxjbGlja3xtb3VzZSg/OmRvd258dXB8b3Zlcnxtb3ZlfG91dCkpJC9cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHBvaW50ZXJYOiAxMDAsXG4gICAgICAgICAgICBwb2ludGVyWTogMTAwLFxuICAgICAgICAgICAgYnV0dG9uOiAwLFxuICAgICAgICAgICAgY3RybEtleTogZmFsc2UsXG4gICAgICAgICAgICBhbHRLZXk6IGZhbHNlLFxuICAgICAgICAgICAgc2hpZnRLZXk6IGZhbHNlLFxuICAgICAgICAgICAgbWV0YUtleTogZmFsc2UsXG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGlmIChwb3MpIHtcbiAgICAgICAgICAgIGRlZmF1bHRPcHRpb25zLnBvaW50ZXJYID0gcG9zWzBdO1xuICAgICAgICAgICAgZGVmYXVsdE9wdGlvbnMucG9pbnRlclkgPSBwb3NbMV07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG9wdGlvbnMgPSBleHRlbmQoZGVmYXVsdE9wdGlvbnMsIGFyZ3VtZW50c1szXSB8fCB7fSk7XG4gICAgICAgIGxldCBvRXZlbnQ6YW55LCBldmVudFR5cGU6YW55ID0gbnVsbDtcblxuICAgICAgICBmb3IgKGxldCBuYW1lIGluIGV2ZW50TWF0Y2hlcnMpIHtcbiAgICAgICAgICAgIGlmIChldmVudE1hdGNoZXJzW25hbWVdLnRlc3QoZXZlbnROYW1lKSkgeyBldmVudFR5cGUgPSBuYW1lOyBicmVhazsgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFldmVudFR5cGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ09ubHkgSFRNTEV2ZW50cyBhbmQgTW91c2VFdmVudHMgaW50ZXJmYWNlcyBhcmUgc3VwcG9ydGVkJyk7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XG4gICAgICAgICAgICBvRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChldmVudFR5cGUpO1xuICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PSAnSFRNTEV2ZW50cycpIHtcbiAgICAgICAgICAgICAgICBvRXZlbnQuaW5pdEV2ZW50KGV2ZW50TmFtZSwgb3B0aW9ucy5idWJibGVzLCBvcHRpb25zLmNhbmNlbGFibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb0V2ZW50LmluaXRNb3VzZUV2ZW50KGV2ZW50TmFtZSwgb3B0aW9ucy5idWJibGVzLCBvcHRpb25zLmNhbmNlbGFibGUsIGRvY3VtZW50LmRlZmF1bHRWaWV3LFxuICAgICAgICAgICAgICAgIG9wdGlvbnMuYnV0dG9uLCBvcHRpb25zLnBvaW50ZXJYLCBvcHRpb25zLnBvaW50ZXJZLCBvcHRpb25zLnBvaW50ZXJYLCBvcHRpb25zLnBvaW50ZXJZLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMuY3RybEtleSwgb3B0aW9ucy5hbHRLZXksIG9wdGlvbnMuc2hpZnRLZXksIG9wdGlvbnMubWV0YUtleSwgb3B0aW9ucy5idXR0b24sIGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG9FdmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBvcHRpb25zLmNsaWVudFggPSBvcHRpb25zLnBvaW50ZXJYO1xuICAgICAgICAgICAgb3B0aW9ucy5jbGllbnRZID0gb3B0aW9ucy5wb2ludGVyWTtcbiAgICAgICAgICAgIHZhciBldnQgPSAoZG9jdW1lbnQgYXMgYW55KS5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgICAgICAgICAgb0V2ZW50ID0gZXh0ZW5kKGV2dCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBlbGVtZW50LmZpcmVFdmVudCgnb24nICsgZXZlbnROYW1lLCBvRXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInRvdWNoLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInpvb21lci50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGZ1bmN0aW9uIGVsQXRQb3MocG9zOm51bWJlcltdKTphbnl7XHJcbiAgICAgICAgbGV0IHJsdDphbnkgPSBudWxsO1xyXG4gICAgICAgIGxldCBjYWNoZTphbnlbXSA9IFtdO1xyXG4gICAgICAgIHdoaWxlKHRydWUpe1xyXG4gICAgICAgICAgICBsZXQgZWw6YW55ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChwb3NbMF0sIHBvc1sxXSk7XHJcbiAgICAgICAgICAgIGlmIChlbCA9PSBkb2N1bWVudC5ib2R5IHx8IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcImh0bWxcIiB8fCBlbCA9PSB3aW5kb3cpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoZWwuJGV2dHJhcCQpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoZWwuJHRvdWNoYWJsZSQpe1xyXG4gICAgICAgICAgICAgICAgcmx0ID0gZWwuZ2V0YXJnZXQ/ZWwuZ2V0YXJnZXQoKTplbFxyXG4gICAgICAgICAgICAgICAgcmx0LiR0b3VjaGVsJCA9IGVsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgY2FjaGUuYWRkKGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IobGV0IGkgb2YgY2FjaGUpe1xyXG4gICAgICAgICAgICBpLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBhY3RpdmVFbDphbnk7XHJcbiAgICBsZXQgaW5pdGVkOmJvb2xlYW49ZmFsc2U7XHJcbiAgICBsZXQgY2ZnOmFueSA9IG51bGw7XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZpbmdlcihlbDphbnkpOmFueXtcclxuICAgICAgICBpZiAoIWNmZyl7XHJcbiAgICAgICAgICAgIGNmZyA9IHRvdWNoKHtcclxuICAgICAgICAgICAgICAgIG9uOnsgXHJcbiAgICAgICAgICAgICAgICAgICAgdGFwOmZ1bmN0aW9uKGFjdDppYWN0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlRWwgPSBlbEF0UG9zKGFjdC5jcG9zKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LG9uYWN0OmZ1bmN0aW9uKGlucTphbnkpe1xyXG4gICAgICAgICAgICAgICAgfSxvbnJlY29nbml6ZWQ6ZnVuY3Rpb24oYWN0OmlhY3Qpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3RpdmVFbCAmJiBhY3RpdmVFbC4kem9vbWVyJCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB6bSA9IGFjdGl2ZUVsLiR6b29tZXIkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgb2Ygem0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkubWFwcGluZ1thY3QuYWN0XSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS5tYXBwaW5nW2FjdC5hY3RdKGFjdCwgYWN0aXZlRWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2ZnLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbC4kdG91Y2hhYmxlJCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgem9vbWFibGU6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGxldCB6b29tZXIgPSBuZXcgWm9vbShlbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfSx6c2l6YWJsZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHpzaXplID0gbmV3IFpzaXplKGVsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9LGRyYWdnYWJsZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbGV0IGRyYWcgPSBuZXcgRHJhZyhlbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBmaW5nZXIgPSBmaW5nZXJzLmZpbmdlcjsiLCJcclxubmFtZXNwYWNlIGZpbmdlcnN7XHJcbiAgICBjbGFzcyBSb3R7XHJcbiAgICAgICAgcHJvdGVjdGVkIG9yaWdpbjphbnk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGNtdDphbnk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGNhY2hlOmFueTtcclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXR1czphbnlbXTtcclxuXHJcbiAgICAgICAgdGFyZ2V0OmFueTtcclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNlbnRlcjphbnk7XHJcbiAgICAgICAgcHJvdGVjdGVkIG9mZnNldDpudW1iZXJbXTtcclxuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xyXG4gICAgICAgICAgICBpZiAoIWVsKXtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IGVsO1xyXG4gICAgICAgICAgICBlbC4kcm90JCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGxldCBwb3MgPSBbZWwuYXN0eWxlKFtcImxlZnRcIl0pLCBlbC5hc3R5bGUoW1widG9wXCJdKV07XHJcbiAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBwb3NbMF07XHJcbiAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHBvc1sxXTtcclxuICAgICAgICAgICAgbGV0IHJjID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luID0ge1xyXG4gICAgICAgICAgICAgICAgY2VudGVyOltyYy53aWR0aC8yLCByYy5oZWlnaHQvMl0sIFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6MCwgXHJcbiAgICAgICAgICAgICAgICBzY2FsZTpbMSwxXSwgXHJcbiAgICAgICAgICAgICAgICBwb3M6W3BhcnNlRmxvYXQocG9zWzBdKSwgcGFyc2VGbG9hdChwb3NbMV0pXSxcclxuICAgICAgICAgICAgICAgIHNpemU6W3JjLndpZHRoLCByYy5oZWlnaHRdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuY210ID0ge1xyXG4gICAgICAgICAgICAgICAgY2VudGVyOltyYy53aWR0aC8yLCByYy5oZWlnaHQvMl0sIFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6MCwgXHJcbiAgICAgICAgICAgICAgICBzY2FsZTpbMSwxXSwgXHJcbiAgICAgICAgICAgICAgICBwb3M6W3BhcnNlRmxvYXQocG9zWzBdKSwgcGFyc2VGbG9hdChwb3NbMV0pXSxcclxuICAgICAgICAgICAgICAgIHNpemU6W3JjLndpZHRoLCByYy5oZWlnaHRdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGUgPSB7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXI6W3JjLndpZHRoLzIsIHJjLmhlaWdodC8yXSwgXHJcbiAgICAgICAgICAgICAgICBhbmdsZTowLCBcclxuICAgICAgICAgICAgICAgIHNjYWxlOlsxLDFdLCBcclxuICAgICAgICAgICAgICAgIHBvczpbcGFyc2VGbG9hdChwb3NbMF0pLCBwYXJzZUZsb2F0KHBvc1sxXSldLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTpbcmMud2lkdGgsIHJjLmhlaWdodF1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gW107XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNlbnRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUubGVmdCA9ICc1MCUnO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlci5zdHlsZS50b3AgPSAnNTAlJztcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUud2lkdGggPSAnMHB4JztcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUuaGVpZ2h0ID0gJzBweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyLnN0eWxlLmJvcmRlciA9ICdzb2xpZCAwcHggYmx1ZSc7XHJcblxyXG4gICAgICAgICAgICBlbC5hcHBlbmRDaGlsZCh0aGlzLmNlbnRlcik7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0T3JpZ2luKHRoaXMub3JpZ2luLmNlbnRlcik7XHJcbiAgICAgICAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9IFwicm90YXRlKDBkZWcpXCI7XHJcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXR1cygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm90YXRlKGFyZzphbnksIHVuZGVmPzphbnkpe1xyXG4gICAgICAgICAgICBpZiAoIWFyZyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gIFx0XHRcdGxldCBjYWNoZSA9IHRoaXMuY2FjaGU7XHJcblx0XHRcdGxldCBvcmlnaW4gPSB0aGlzLmNtdDtcclxuXHRcdFx0bGV0IG9mZnNldCA9IHRoaXMub2Zmc2V0O1xyXG5cdFx0XHRsZXQgYW5nbGUgPSBhcmcuYW5nbGUsIFxyXG4gICAgICAgICAgICAgICAgY2VudGVyID0gYXJnLmNlbnRlciwgXHJcbiAgICAgICAgICAgICAgICBzY2FsZSA9IGFyZy5zY2FsZSwgXHJcbiAgICAgICAgICAgICAgICBwb3MgPSBhcmcucG9zLCBcclxuICAgICAgICAgICAgICAgIHJlc2l6ZSA9IGFyZy5yZXNpemU7XHJcbiAgICAgICAgICAgIGlmICghb2Zmc2V0KXtcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IFswLCAwXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2VudGVyICE9PSB1bmRlZil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hTdGF0dXMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3JpZ2luKGNlbnRlcik7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3N0YXR1cyA9IHRoaXMucHVzaFN0YXR1cygpO1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5jb3JyZWN0KGNzdGF0dXMsIG9mZnNldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFuZ2xlIHx8IGFuZ2xlID09PSAwKXtcclxuICAgICAgICAgICAgICAgIGNhY2hlLmFuZ2xlID0gb3JpZ2luLmFuZ2xlICsgYW5nbGU7XHJcbiAgICAgICAgICAgICAgICBjYWNoZS5hbmdsZSA9IGNhY2hlLmFuZ2xlICUgMzYwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZXNpemUpe1xyXG4gICAgICAgICAgICAgICAgY2FjaGUuc2l6ZSA9IFtvcmlnaW4uc2l6ZVswXSArIHJlc2l6ZVswXSwgb3JpZ2luLnNpemVbMV0gKyByZXNpemVbMV1dO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhY2hlLnNpemVbMF0gPCAxMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuc2l6ZVswXSA9IDEwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhY2hlLnNpemVbMV0gPCAxMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuc2l6ZVsxXSA9IDEwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzY2FsZSl7XHJcbiAgICAgICAgICAgICAgICBpZiAoIShzY2FsZSBpbnN0YW5jZW9mIEFycmF5KSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG4gPSBwYXJzZUZsb2F0KHNjYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZSA9IFtuLCBuXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhY2hlLnNjYWxlID0gW29yaWdpbi5zY2FsZVswXSAqIHNjYWxlWzBdLCBvcmlnaW4uc2NhbGVbMV0gKiBzY2FsZVsxXV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBvcyl7XHJcbiAgICAgICAgICAgICAgICBjYWNoZS5wb3MgPSBbb3JpZ2luLnBvc1swXSArIHBvc1swXSAtIG9mZnNldFswXSwgb3JpZ2luLnBvc1sxXSArIHBvc1sxXSAtIG9mZnNldFsxXV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVooJyArIGNhY2hlLmFuZ2xlICsgJ2RlZykgc2NhbGUoJyArIGNhY2hlLnNjYWxlWzBdICsgJywnICsgY2FjaGUuc2NhbGVbMV0gKyAnKSc7XHJcblx0XHRcdHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQgPSBjYWNoZS5wb3NbMF0gKyAncHgnO1xyXG5cdFx0XHR0aGlzLnRhcmdldC5zdHlsZS50b3AgPSBjYWNoZS5wb3NbMV0gKyAncHgnO1xyXG4gICAgICAgICAgICBpZiAocmVzaXplKXtcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLndpZHRoID0gY2FjaGUuc2l6ZVswXSArICdweCc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5oZWlnaHQgPSBjYWNoZS5zaXplWzFdICsgJ3B4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0dXMoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgZ2V0Q2VudGVyKCk6bnVtYmVyW117XHJcbiAgICAgICAgICAgIGxldCByYyA9IHRoaXMuY2VudGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gW3JjLmxlZnQsIHJjLnRvcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzZXRPcmlnaW4ocDpudW1iZXJbXSk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gcFswXSArIFwicHggXCIgKyBwWzFdICsgXCJweFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgY29ycmVjdChzdGF0dXM6YW55LCBwb2Zmc2V0PzpudW1iZXJbXSk6bnVtYmVyW117XHJcbiAgICAgICAgICAgIGlmICghcG9mZnNldCl7XHJcbiAgICAgICAgICAgICAgICBwb2Zmc2V0ID0gWzAsIDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBkID0gc3RhdHVzLmRlbHRhO1xyXG4gICAgICAgICAgICBsZXQgeCA9IHBhcnNlRmxvYXQodGhpcy50YXJnZXQuYXN0eWxlW1wibGVmdFwiXSkgLSBkLmNlbnRlclswXTtcclxuICAgICAgICAgICAgbGV0IHkgPSBwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LmFzdHlsZVtcInRvcFwiXSkgLSBkLmNlbnRlclsxXTtcclxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSBbcG9mZnNldFswXSArIGQuY2VudGVyWzBdLCBwb2Zmc2V0WzFdICsgZC5jZW50ZXJbMV1dO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudG9wID0geSArIFwicHhcIjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgY29tbWl0U3RhdHVzKCk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy5jbXQgPSB0aGlzLmNhY2hlO1xyXG4gICAgICAgICAgICB0aGlzLmNtdC5wb3MgPSBbcGFyc2VGbG9hdCh0aGlzLnRhcmdldC5zdHlsZS5sZWZ0KSwgcGFyc2VGbG9hdCh0aGlzLnRhcmdldC5zdHlsZS50b3ApXTtcclxuICAgICAgICAgICAgdGhpcy5jbXQuc2l6ZSA9IFtwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LnN0eWxlLndpZHRoKSwgcGFyc2VGbG9hdCh0aGlzLnRhcmdldC5zdHlsZS5oZWlnaHQpXTtcclxuICAgICAgICAgICAgdGhpcy5jYWNoZSA9IHthbmdsZTowLCBzY2FsZTpbMSwxXSwgcG9zOlswLDBdLCBzaXplOlswLDBdfTtcclxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSBbMCwgMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBwdXNoU3RhdHVzKCk6dm9pZHtcclxuICAgICAgICAgICAgbGV0IGMgPSB0aGlzLmdldENlbnRlcigpO1xyXG4gICAgICAgICAgICBsZXQgbCA9IFtwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LmFzdHlsZShbXCJsZWZ0XCJdKSkscGFyc2VGbG9hdCh0aGlzLnRhcmdldC5hc3R5bGUoW1widG9wXCJdKSldO1xyXG4gICAgICAgICAgICBsZXQgczphbnkgPSB7Y2VudGVyOltjWzBdLCBjWzFdXSwgcG9zOmx9O1xyXG4gICAgICAgICAgICBsZXQgcSA9IHRoaXMuc3RhdHVzO1xyXG4gICAgICAgICAgICBsZXQgcCA9IHEubGVuZ3RoID4gMD9xW3EubGVuZ3RoIC0gMV0gOiBzO1xyXG4gICAgICAgICAgICBzLmRlbHRhID0geyBjZW50ZXI6W3MuY2VudGVyWzBdIC0gcC5jZW50ZXJbMF0sIHMuY2VudGVyWzFdIC0gcC5jZW50ZXJbMV1dLFxyXG4gICAgICAgICAgICAgICAgcG9zOiBbcy5wb3NbMF0gLSBwLnBvc1swXSwgcy5wb3NbMV0gLSBwLnBvc1sxXV19O1xyXG4gICAgICAgICAgICBxW3EubGVuZ3RoXSA9IHM7XHJcbiAgICAgICAgICAgIGlmIChxLmxlbmd0aCA+IDYpe1xyXG4gICAgICAgICAgICAgICAgcS5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIFJvdGF0b3IoZWw6YW55KTphbnl7XHJcbiAgICAgICAgbGV0IHIgPSBlbC4kcm90JCB8fCBuZXcgUm90KGVsKTtcclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH1cclxufVxyXG5cclxuIiwiZnVuY3Rpb24gdGVzdGZ1bmMoKXtcclxuICAgIHJldHVybiB0cnVlO1xyXG59IiwiaW50ZXJmYWNlIFN0cmluZ3tcblx0c3RhcnRzV2l0aChzdHI6c3RyaW5nKTpib29sZWFuO1xuXHRmb3JtYXQoLi4ucmVzdEFyZ3M6YW55W10pOnN0cmluZztcbn1cblxuU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoID0gZnVuY3Rpb24oc3RyOnN0cmluZyk6Ym9vbGVhbntcblx0cmV0dXJuIHRoaXMuaW5kZXhPZihzdHIpPT0wO1xufVxuU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHR2YXIgcyA9IHRoaXM7XG5cdGlmICghYXJncyB8fCBhcmdzLmxlbmd0aCA8IDEpIHtcblx0XHRyZXR1cm4gcztcblx0fVxuXHR2YXIgciA9IHM7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciByZWcgPSBuZXcgUmVnRXhwKCdcXFxceycgKyBpICsgJ1xcXFx9Jyk7XG5cdFx0ciA9IHIucmVwbGFjZShyZWcsIGFyZ3NbaV0pO1xuXHR9XG5cdHJldHVybiByO1xufTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZm91bmRhdGlvbi9zdHJpbmcudHNcIiAvPlxuXG5FbGVtZW50LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbih2YWw6YW55KTp2b2lke1xuICAgIGZ1bmN0aW9uIGFkZCh0OmFueSwgdjphbnkpOnZvaWR7XG5cdFx0aWYgKHQpe1xuXHRcdFx0aWYgKHR5cGVvZiAodikgPT0gJ29iamVjdCcpe1xuXHRcdFx0XHRsZXQgdG1wID0gd28udXNlKHYudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBpZiAodG1wKXtcbiAgICAgICAgICAgICAgICAgICAgdi50YXJnZXQgPSB0bXA7XG4gICAgICAgICAgICAgICAgfVxuXHRcdFx0XHRpZiAoIXYubW9kZSB8fCAodi5tb2RlID09IFwicHJlcGVuZFwiICYmIHQuY2hpbGROb2Rlcy5sZW5ndGggPCAxKSl7XG5cdFx0XHRcdFx0di5tb2RlID0gXCJhcHBlbmRcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodi5tb2RlID09IFwicmVwbGFjZVwiKXtcblx0XHRcdFx0XHR0LmlubmVySFRNTCA9IFwiXCI7XG5cdFx0XHRcdFx0di5tb2RlID0gXCJhcHBlbmRcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodi5tb2RlID09IFwicHJlcGVuZFwiKXtcblx0XHRcdFx0XHR0Lmluc2VydEJlZm9yZSh2LnRhcmdldCwgdC5jaGlsZE5vZGVzWzBdKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0dC5hcHBlbmRDaGlsZCh2LnRhcmdldCk7XG5cdFx0XHRcdH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0JCh0KS50ZXh0KHYpO1xuXHRcdFx0fVxuXHRcdH1cblxuICAgIH1cbiAgICBpZiAod28udXNhYmxlKHZhbCkpe1xuICAgICAgICBhZGQodGhpcywgdmFsKTtcbiAgICB9XG5cdGZvcihsZXQgaSBpbiB2YWwpe1xuXHRcdGxldCB2ID0gdmFsW2ldO1xuICAgIFx0bGV0IHQgPSB0aGlzW1wiJFwiICsgaV07XG4gICAgICAgIGFkZCh0LCB2KTtcblx0fSAgICAgICAgICAgIFxufTtcblxubmFtZXNwYWNlIHdve1xuICAgIC8vLyBDb250YWlucyBjcmVhdG9yIGluc3RhbmNlIG9iamVjdFxuICAgIGV4cG9ydCBsZXQgQ3JlYXRvcnM6Q3JlYXRvcltdID0gW107XG5cbiAgICBmdW5jdGlvbiBnZXQoc2VsZWN0b3I6YW55KTphbnl7XG4gICAgICAgIGxldCBybHQ6YW55ID0gW107XG4gICAgICAgIGlmIChzZWxlY3Rvcil7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJsdDtcbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgQ3Vyc29ye1xuICAgICAgICBwYXJlbnQ6YW55O1xuICAgICAgICBib3JkZXI6YW55O1xuICAgICAgICByb290OmFueTtcbiAgICAgICAgY3VydDphbnk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIENyZWF0b3J7XG4gICAgICAgIGlkOnN0cmluZztcbiAgICAgICAgZ2V0IElkKCk6c3RyaW5ne1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XG4gICAgICAgIH1cbiAgICAgICAgQ3JlYXRlKGpzb246YW55LCBjcz86Q3Vyc29yKTphbnl7XG4gICAgICAgICAgICBpZiAoIWpzb24pe1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG8gPSB0aGlzLmNyZWF0ZShqc29uKTtcbiAgICAgICAgICAgIGlmICghY3Mpe1xuICAgICAgICAgICAgICAgIGNzID0gbmV3IEN1cnNvcigpO1xuICAgICAgICAgICAgICAgIGNzLnJvb3QgPSBvO1xuICAgICAgICAgICAgICAgIGNzLnBhcmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgY3MuYm9yZGVyID0gbztcbiAgICAgICAgICAgICAgICBjcy5jdXJ0ID0gbztcbiAgICAgICAgICAgICAgICBvLmN1cnNvciA9IGNzO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgbGV0IG5jcyA9IG5ldyBDdXJzb3IoKTtcbiAgICAgICAgICAgICAgICBuY3Mucm9vdCA9IGNzLnJvb3Q7XG4gICAgICAgICAgICAgICAgbmNzLnBhcmVudCA9IGNzLmN1cnQ7XG4gICAgICAgICAgICAgICAgbmNzLmJvcmRlciA9IGNzLmJvcmRlcjtcbiAgICAgICAgICAgICAgICBuY3MuY3VydCA9IG87XG4gICAgICAgICAgICAgICAgby5jdXJzb3IgPSBuY3M7XG4gICAgICAgICAgICAgICAgY3MgPSBuY3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoanNvbi5hbGlhcyl7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSBqc29uLmFsaWFzO1xuICAgICAgICAgICAgICAgIGlmIChqc29uLmFsaWFzLnN0YXJ0c1dpdGgoXCIkXCIpKXtcbiAgICAgICAgICAgICAgICAgICAgbiA9IGpzb24uYWxpYXMuc3Vic3RyKDEsIGpzb24uYWxpYXMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNzLmJvcmRlcltcIiRcIiArIG5dID0gbztcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5hbGlhcy5zdGFydHNXaXRoKFwiJFwiKSl7XG4gICAgICAgICAgICAgICAgICAgIGNzLmJvcmRlciA9IG87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkZWxldGUganNvblt0aGlzLklkXTtcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5kKG8sIGpzb24pO1xuICAgICAgICAgICAgaWYgKGpzb24ubWFkZSl7XG4gICAgICAgICAgICAgICAganNvbi5tYWRlLmNhbGwobyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvLiRyb290ID0gY3Mucm9vdDtcbiAgICAgICAgICAgIG8uJGJvcmRlciA9IGNzLmJvcmRlcjtcbiAgICAgICAgICAgIHJldHVybiBvO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGUoanNvbjphbnkpOmFueTtcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZChlbDphbnksIGNoaWxkOmFueSl7XG4gICAgICAgIGlmIChlbC5hcHBlbmQgJiYgdHlwZW9mKGVsLmFwcGVuZCkgPT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgICAgICBlbC5hcHBlbmQoY2hpbGQpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiB1c2FibGUoanNvbjphbnkpOmJvb2xlYW57XG4gICAgICAgIGZvcih2YXIgaSBvZiBDcmVhdG9ycyl7XG4gICAgICAgICAgICBpZiAoanNvbltpLklkXSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiB1c2UoanNvbjphbnksIGNzPzpDdXJzb3IpOmFueXtcbiAgICAgICAgbGV0IHJsdDphbnkgPSBudWxsO1xuICAgICAgICBpZiAoIWpzb24gfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xuICAgICAgICAgICAgcmV0dXJuIHJsdDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29udGFpbmVyOmFueSA9IG51bGw7XG4gICAgICAgIGlmIChqc29uLiRjb250YWluZXIkKXtcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGpzb24uJGNvbnRhaW5lciQ7XG4gICAgICAgICAgICBkZWxldGUganNvbi4kY29udGFpbmVyJDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIChqc29uKSA9PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICBybHQgPSBnZXQoanNvbik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IodmFyIGkgb2YgQ3JlYXRvcnMpe1xuICAgICAgICAgICAgaWYgKGpzb25baS5JZF0pe1xuICAgICAgICAgICAgICAgIHJsdCA9IGkuQ3JlYXRlKGpzb24sIGNzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udGFpbmVyKXtcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChybHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBybHQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG9iamV4dGVuZChvOmFueSwganNvbjphbnkpe1xuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XG4gICAgICAgICAgICBpZiAob1tpXSAmJiB0eXBlb2Yob1tpXSkgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIG9iamV4dGVuZChvW2ldLCBqc29uW2ldKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIG9baV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdXNlLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIGV4cG9ydCBjbGFzcyBEb21DcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmlkID0gXCJ0YWdcIjtcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0YWcgPSBqc29uW3RoaXMuaWRdO1xuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XG4gICAgICAgICAgICBpZiAodGFnID09ICcjdGV4dCcpe1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGFnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7IFxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgICAgIGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWR7XG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgZG9tZXh0ZW5kKG8sIGpzb24pO1xuICAgICAgICAgICAgfWVsc2UgaWYgKGpzb24uJCAmJiBvIGluc3RhbmNlb2YgTm9kZSl7XG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xuICAgICAgICAgICAgICAgIG8uZXh0ZW5kKGpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb21leHRlbmQoZWw6YW55LCBqc29uOmFueSl7XG4gICAgICAgIGxldCBjcyA9IGVsLmN1cnNvcjtcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xuICAgICAgICAgICAgaWYgKGkuc3RhcnRzV2l0aChcIiQkXCIpKXtcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZWxbaV07XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdGFyZ2V0O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZ0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh2dHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb21leHRlbmQodGFyZ2V0LCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwiJFwiKXtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgIGlmIChqc29uW2ldIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGogb2YganNvbltpXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoaiwgY3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoanNvbltpXSwgY3MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VsLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2UgaWYgKGkuc3RhcnRzV2l0aChcIiRcIikpe1xuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxbaV0gJiYgdHlwZW9mKGVsW2ldKSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpleHRlbmQoZWxbaV0sIGpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShpLCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3VzZS50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBleHBvcnQgY2xhc3MgU3ZnQ3JlYXRvciBleHRlbmRzIENyZWF0b3J7XG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IFwic2dcIjtcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0YWcgPSBqc29uW3RoaXMuaWRdO1xuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XG4gICAgICAgICAgICBpZiAodGFnID09IFwic3ZnXCIpe1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgdGFnKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgdGFnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgfVxuICAgICAgICBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lke1xuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobyBpbnN0YW5jZW9mIFNWR0VsZW1lbnQpe1xuICAgICAgICAgICAgICAgIHN2Z2V4dGVuZChvLCBqc29uKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN2Z2V4dGVuZChlbDphbnksIGpzb246YW55KXtcbiAgICAgICAgbGV0IGNzID0gZWwuY3Vyc29yO1xuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBlbFtpXTtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZ0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z2V4dGVuZCh0YXJnZXQsIGpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2UgaWYgKGkgPT0gXCIkXCIpe1xuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgaWYgKGpzb25baV0gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaiBvZiBqc29uW2ldKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqLCBjcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9lbC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqc29uW2ldLCBjcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9lbC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZSBpZiAoaS5zdGFydHNXaXRoKFwiJFwiKSl7XG4gICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbFtpXSAmJiB0eXBlb2YoZWxbaV0pID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMobnVsbCwgaSwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZm91bmRhdGlvbi9kZWZpbml0aW9ucy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi91c2UudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZG9tY3JlYXRvci50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBleHBvcnQgbGV0IFdpZGdldHM6YW55ID0ge307XG5cbiAgICBleHBvcnQgY2xhc3MgVWlDcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmlkID0gXCJ1aVwiO1xuICAgICAgICB9XG4gICAgICAgIGNyZWF0ZShqc29uOmFueSk6Tm9kZXtcbiAgICAgICAgICAgIGlmIChqc29uID09IG51bGwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHdnID0ganNvblt0aGlzLmlkXTtcbiAgICAgICAgICAgIGlmICghV2lkZ2V0c1t3Z10pe1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZWw6Tm9kZSA9IHVzZShXaWRnZXRzW3dnXSgpKTtcbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgfVxuICAgICAgICBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lke1xuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBkb21hcHBseShvLCBqc29uKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBleHBvcnQgZnVuY3Rpb24gaXN3aWRnZXQoanNvbjphbnkpOmJvb2xlYW57XG4gICAgICAgIGlmICghanNvbiB8fCAhanNvbi51aSl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IobGV0IGkgaW4gV2lkZ2V0cyl7XG4gICAgICAgICAgICBpZiAoaSA9PSBqc29uLnVpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvbWFwcGx5KGVsOmFueSwganNvbjphbnkpe1xuICAgICAgICBsZXQgY3MgPSBlbC5jdXJzb3I7XG4gICAgICAgIGZvcihsZXQgaSBpbiBqc29uKXtcbiAgICAgICAgICAgIGlmIChpLnN0YXJ0c1dpdGgoXCIkJFwiKSl7XG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGVsW2ldO1xuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIHRhcmdldDtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2dHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodnR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYXBwbHkodGFyZ2V0LCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwiJFwiKXtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgIGxldCBqaSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBqaSA9IFtqaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChqaSBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGVzID0gZWwuY2hpbGROb2RlcztcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgajxqaS5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGppW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdvLmlzd2lkZ2V0KGl0ZW0pKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWwudXNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwudXNlKGl0ZW0sIGNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGl0ZW0sIGNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaiA8IG5vZGVzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFwcGx5KG5vZGVzW2pdLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsLnVzZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC51c2UoaXRlbSwgY3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShpdGVtLCBjcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcbiAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcInN0eWxlXCIpe1xuICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsW2ldICYmIHR5cGVvZihlbFtpXSkgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZXh0ZW5kKGVsW2ldLCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoaSwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZm91bmRhdGlvbi9kZWZpbml0aW9ucy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWlsZGVyL3VzZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWlsZGVyL2RvbWNyZWF0b3IudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVpbGRlci9zdmdjcmVhdG9yLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cblxud28uQ3JlYXRvcnMuYWRkKG5ldyB3by5Eb21DcmVhdG9yKCkpO1xud28uQ3JlYXRvcnMuYWRkKG5ldyB3by5TdmdDcmVhdG9yKCkpO1xud28uQ3JlYXRvcnMuYWRkKG5ldyB3by5VaUNyZWF0b3IoKSk7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZGVmaW5pdGlvbnMudHNcIiAvPlxuY2xhc3MgTW9iaWxlRGV2aWNle1xuXHRzdGF0aWMgZ2V0IEFuZHJvaWQgKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkL2kpO1xuXHRcdGlmIChyKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gciE9IG51bGwgJiYgci5sZW5ndGg+MDtcblx0fVxuXHRzdGF0aWMgZ2V0IEJsYWNrQmVycnkoKTpib29sZWFuIHtcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0JsYWNrQmVycnkvaSk7XG5cdFx0aWYgKHIpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XG5cdFx0fVxuXHRcdHJldHVybiByIT1udWxsICYmIHIubGVuZ3RoID4gMDtcblx0fVxuXHRzdGF0aWMgZ2V0IGlPUygpOmJvb2xlYW4ge1xuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVBob25lfGlQYWR8aVBvZC9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIgIT0gbnVsbCAmJiByLmxlbmd0aCA+IDA7XG5cdH1cblx0c3RhdGljIGdldCBPcGVyYSgpOmJvb2xlYW4ge1xuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvT3BlcmEgTWluaS9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIgIT0gbnVsbCAmJiByLmxlbmd0aCA+IDA7XG5cdH1cblx0c3RhdGljIGdldCBXaW5kb3dzKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9JRU1vYmlsZS9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIhPSBudWxsICYmIHIubGVuZ3RoID4wO1xuXHR9XG5cdHN0YXRpYyBnZXQgYW55KCk6Ym9vbGVhbiB7XG5cdFx0cmV0dXJuIChNb2JpbGVEZXZpY2UuQW5kcm9pZCB8fCBNb2JpbGVEZXZpY2UuQmxhY2tCZXJyeSB8fCBNb2JpbGVEZXZpY2UuaU9TIHx8IE1vYmlsZURldmljZS5PcGVyYSB8fCBNb2JpbGVEZXZpY2UuV2luZG93cyk7XG5cdH1cbn1cblxuY2xhc3MgQnJvd3Nlcntcblx0Ly8gT3BlcmEgOC4wK1xuXHRzdGF0aWMgZ2V0IGlzT3BlcmEoKTpib29sZWFue1xuXHRcdHJldHVybiAoISF3aW5kb3cub3ByICYmICEhd2luZG93Lm9wci5hZGRvbnMpIHx8ICEhd2luZG93Lm9wZXJhIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIE9QUi8nKSA+PSAwO1xuXHR9XG5cdFxuXHQvLyBGaXJlZm94IDEuMCtcblx0c3RhdGljIGdldCBpc0ZpcmVmb3goKTpib29sZWFue1xuXHRcdHJldHVybiB0eXBlb2Ygd2luZG93Lkluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJztcblx0fVxuXHQvLyBBdCBsZWFzdCBTYWZhcmkgMys6IFwiW29iamVjdCBIVE1MRWxlbWVudENvbnN0cnVjdG9yXVwiXG5cdHN0YXRpYyBnZXQgaXNTYWZhcmkoKTpib29sZWFue1xuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoSFRNTEVsZW1lbnQpLmluZGV4T2YoJ0NvbnN0cnVjdG9yJykgPiAwO1xuXHR9IFxuXHQvLyBJbnRlcm5ldCBFeHBsb3JlciA2LTExXG5cdHN0YXRpYyBnZXQgaXNJRSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIC8qQGNjX29uIUAqL2ZhbHNlIHx8ICEhZG9jdW1lbnQuZG9jdW1lbnRNb2RlO1xuXHR9XG5cdC8vIEVkZ2UgMjArXG5cdHN0YXRpYyBnZXQgaXNFZGdlKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gIUJyb3dzZXIuaXNJRSAmJiAhIXdpbmRvdy5TdHlsZU1lZGlhO1xuXHR9XG5cdC8vIENocm9tZSAxK1xuXHRzdGF0aWMgZ2V0IGlzQ2hyb21lKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gISF3aW5kb3cuY2hyb21lICYmICEhd2luZG93LmNocm9tZS53ZWJzdG9yZTtcblx0fVxuXHQvLyBCbGluayBlbmdpbmUgZGV0ZWN0aW9uXG5cdHN0YXRpYyBnZXQgaXNCbGluaygpOmJvb2xlYW57XG5cdFx0cmV0dXJuIChCcm93c2VyLmlzQ2hyb21lIHx8IEJyb3dzZXIuaXNPcGVyYSkgJiYgISF3aW5kb3cuQ1NTO1xuXHR9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy50c1wiIC8+XG5cbkVsZW1lbnQucHJvdG90eXBlLmFzdHlsZSA9IGZ1bmN0aW9uIGFjdHVhbFN0eWxlKHByb3BzOnN0cmluZ1tdKSB7XG5cdGxldCBlbDpFbGVtZW50ID0gdGhpcztcblx0bGV0IGNvbXBTdHlsZTpDU1NTdHlsZURlY2xhcmF0aW9uID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpO1xuXHRmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuXHRcdGxldCBzdHlsZTpzdHJpbmcgPSBjb21wU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wc1tpXSk7XG5cdFx0aWYgKHN0eWxlICE9IG51bGwpIHtcblx0XHRcdHJldHVybiBzdHlsZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5uYW1lc3BhY2Ugd297XG5cdGNsYXNzIERlc3Ryb3llcntcblx0XHRkaXNwb3Npbmc6Ym9vbGVhbjtcblx0XHRkZXN0cm95aW5nOmJvb2xlYW47XG5cdFx0c3RhdGljIGNvbnRhaW5lcjpIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0c3RhdGljIGRlc3Ryb3kodGFyZ2V0OkVsZW1lbnQpe1xuXHRcdFx0aWYgKCF0YXJnZXQuZGVzdHJveVN0YXR1cyl7XG5cdFx0XHRcdHRhcmdldC5kZXN0cm95U3RhdHVzID0gbmV3IERlc3Ryb3llcigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRhcmdldC5kaXNwb3NlICYmICF0YXJnZXQuZGVzdHJveVN0YXR1cy5kaXNwb3Npbmcpe1xuXHRcdFx0XHR0YXJnZXQuZGVzdHJveVN0YXR1cy5kaXNwb3NpbmcgPSB0cnVlO1xuXHRcdFx0XHR0YXJnZXQuZGlzcG9zZSgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0YXJnZXQuZGVzdHJveVN0YXR1cy5kZXN0cm95aW5nKXtcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGVzdHJveWluZyA9IHRydWU7XG5cdFx0XHRcdERlc3Ryb3llci5jb250YWluZXIuYXBwZW5kQ2hpbGQodGFyZ2V0KTtcblx0XHRcdFx0Zm9yKGxldCBpIGluIHRhcmdldCl7XG5cdFx0XHRcdFx0aWYgKGkuaW5kZXhPZignJCcpID09IDApe1xuXHRcdFx0XHRcdFx0bGV0IHRtcDphbnkgPSB0YXJnZXRbaV07XG5cdFx0XHRcdFx0XHRpZiAodG1wIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRbaV0gPSBudWxsO1xuXHRcdFx0XHRcdFx0XHR0bXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB0YXJnZXRbaV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdERlc3Ryb3llci5jb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3kodGFyZ2V0OmFueSk6dm9pZHtcblx0XHRpZiAodGFyZ2V0Lmxlbmd0aCA+IDAgfHwgdGFyZ2V0IGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdFx0Zm9yKGxldCBpIG9mIHRhcmdldCl7XG5cdFx0XHRcdERlc3Ryb3llci5kZXN0cm95KGkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCl7XG5cdFx0XHRcdERlc3Ryb3llci5kZXN0cm95KHRhcmdldCk7XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGNlbnRlclNjcmVlbih0YXJnZXQ6YW55KXtcblx0XHRsZXQgcmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHR0YXJnZXQuc3R5bGUucG9zaXRpb24gPSBcImZpeGVkXCI7XG5cdFx0dGFyZ2V0LnN0eWxlLmxlZnQgPSBcIjUwJVwiO1xuXHRcdHRhcmdldC5zdHlsZS50b3AgPSBcIjUwJVwiO1xuXHRcdHRhcmdldC5zdHlsZS5tYXJnaW5Ub3AgPSAtcmVjdC5oZWlnaHQgLyAyICsgXCJweFwiO1xuXHRcdHRhcmdldC5zdHlsZS5tYXJnaW5MZWZ0ID0gLXJlY3Qud2lkdGggLyAyICsgXCJweFwiO1xuXHR9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2ZvdW5kYXRpb24vZWxlbWVudHMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIFdpZGdldHMuY2FyZCA9IGZ1bmN0aW9uKCk6YW55e1xuICAgICAgICByZXR1cm4gIHtcbiAgICAgICAgICAgIHRhZzpcImRpdlwiLFxuICAgICAgICAgICAgY2xhc3M6XCJjYXJkXCIsXG4gICAgICAgICAgICB1c2U6ZnVuY3Rpb24oanNvbjphbnkpe1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHdvLnVzZShqc29uKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRib2R5LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAkOltcbiAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwidGl0bGUgbm9zZWxlY3RcIiwgJDpbXG4gICAgICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJ0eHRcIiwgYWxpYXM6XCJ0aXRsZVwifSxcbiAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcImN0cmxzXCIsICQ6W1xuICAgICAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcIndidG5cIiwgb25jbGljazogZnVuY3Rpb24oZXZlbnQ6YW55KXt3by5kZXN0cm95KHRoaXMuJGJvcmRlcik7fSwgJDpcIlhcIn1cbiAgICAgICAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgICAgICBdfSxcbiAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwiYm9keVwiLCBhbGlhczpcImJvZHlcIn1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2ZvdW5kYXRpb24vZWxlbWVudHMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIFdpZGdldHMuY292ZXIgPSBmdW5jdGlvbigpOmFueXtcbiAgICAgICAgcmV0dXJue1xuICAgICAgICAgICAgdGFnOlwiZGl2XCIsXG4gICAgICAgICAgICBjbGFzczpcImNvdmVyXCIsXG4gICAgICAgICAgICBzdHlsZTp7ZGlzcGxheTonbm9uZSd9LFxuICAgICAgICAgICAgc2hvdzpmdW5jdGlvbihjYWxsYmFjazphbnkpOnZvaWR7XG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJGNoaWxkKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kY2hpbGQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0saGlkZTpmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRjaGlsZCl7XG4gICAgICAgICAgICAgICAgICAgIHdvLmRlc3Ryb3kodGhpcy4kY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy4kY2hpbGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbmhpZGUpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sbWFkZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBsZXQgY3YgPSAoZG9jdW1lbnQuYm9keSBhcyBhbnkpLiRnY3YkO1xuICAgICAgICAgICAgICAgIGlmIChjdil7XG4gICAgICAgICAgICAgICAgICAgIHdvLmRlc3Ryb3koY3YpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMpO1xuICAgICAgICAgICAgICAgIChkb2N1bWVudC5ib2R5IGFzIGFueSkuJGdjdiQgPSB0aGlzO1xuICAgICAgICAgICAgfSxvbmNsaWNrOmZ1bmN0aW9uKGV2ZW50OmFueSl7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJCR0b3VjaGNsb3NlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxhcHBlbmQ6ZnVuY3Rpb24oY2hpbGQ6YW55KXtcbiAgICAgICAgICAgICAgICB0aGlzLiRjaGlsZCA9IGNoaWxkO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9OyBcbiAgICB9IFxuICAgIGV4cG9ydCBmdW5jdGlvbiBjb3Zlcihqc29uOmFueSk6YW55e1xuICAgICAgICBsZXQgY3YgPSB3by51c2Uoe1xuICAgICAgICAgICAgdWk6J2NvdmVyJyxcbiAgICAgICAgICAgICQkdG91Y2hjbG9zZTp0cnVlLFxuICAgICAgICAgICAgJDpqc29uXG4gICAgICAgIH0pO1xuICAgICAgICBjdi5zaG93KGZ1bmN0aW9uKGVsOmFueSl7XG4gICAgICAgICAgICB3by5jZW50ZXJTY3JlZW4oZWwuJGJveCB8fCBlbC4kY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgICAgY3Yub25oaWRlID0ganNvbi5vbmhpZGU7XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9mb3VuZGF0aW9uL2VsZW1lbnRzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9idWlsZGVyL3VpY3JlYXRvci50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBXaWRnZXRzLmRyb3Bkb3duID0gZnVuY3Rpb24oKTphbnl7XG4gICAgICAgIHJldHVybiAge1xuICAgICAgICAgICAgdGFnOlwiZGl2XCIsXG4gICAgICAgICAgICBjbGFzczpcImRyb3Bkb3duXCIsXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbDphbnkpOnZvaWR7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpIGluIHZhbCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2ID0gdmFsW2ldO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdCA9IHRoaXNbXCIkXCIgKyBpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAodikgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdi5tb2RlIHx8ICh2Lm1vZGUgPT0gXCJwcmVwZW5kXCIgJiYgdC5jaGlsZE5vZGVzLmxlbmd0aCA8IDEpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdi5tb2RlID0gXCJhcHBlbmRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYubW9kZSA9PSBcInJlcGxhY2VcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdi5tb2RlID0gXCJhcHBlbmRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYubW9kZSA9PSBcInByZXBlbmRcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuaW5zZXJ0QmVmb3JlKHYudGFyZ2V0LCB0LmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmFwcGVuZENoaWxkKHYudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0KS50ZXh0KHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICQ6W1xuICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJ0aXRsZSBub3NlbGVjdFwiLCAkOltcbiAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcInR4dFwiLCBhbGlhczpcInRpdGxlXCJ9LFxuICAgICAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwiY3RybHNcIiwgJDpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwid2J0blwiLCBvbmNsaWNrOiBmdW5jdGlvbihldmVudDphbnkpe3dvLmRlc3Ryb3kodGhpcy4kYm9yZGVyKTt9LCAkOlwiWFwifVxuICAgICAgICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgICAgIF19LFxuICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJib2R5XCIsIGFsaWFzOlwiYm9keVwifVxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZm91bmRhdGlvbi9lbGVtZW50cy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxuXG5uYW1lc3BhY2Ugd297XG4gICAgV2lkZ2V0cy5sb2FkaW5nID0gZnVuY3Rpb24oKTphbnl7XG4gICAgICAgIHJldHVybntcbiAgICAgICAgICAgIHRhZzpcImRpdlwiLFxuICAgICAgICAgICAgY2xhc3M6XCJsb2FkaW5nXCIsXG4gICAgICAgICAgICBtYWRlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCBwMSA9IHdvLnVzZSh7dWk6XCJhcmNcIn0pO1xuICAgICAgICAgICAgICAgIHAxLnNldEF0dHJpYnV0ZU5TKG51bGwsIFwiY2xhc3NcIiwgXCJhcmMgcDFcIik7XG4gICAgICAgICAgICAgICAgcDEudXBkYXRlKFsxNiwgNDhdLCAxNiwgMjcwKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRzYm94LmFwcGVuZENoaWxkKHAxKTsgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICBsZXQgcDIgPSB3by51c2Uoe3VpOlwiYXJjXCJ9KTtcbiAgICAgICAgICAgICAgICBwMi5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcImNsYXNzXCIsIFwiYXJjIHAxXCIpO1xuICAgICAgICAgICAgICAgIHAyLnVwZGF0ZShbMTYsIDQ4XSwgMTYsIDI3MCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2JveC5hcHBlbmRDaGlsZChwMik7XG5cbiAgICAgICAgICAgICAgICAvLyRlbGVtZW50LnZlbG9jaXR5KHsgb3BhY2l0eTogMSB9LCB7IGR1cmF0aW9uOiAxMDAwIH0pO1xuICAgICAgICAgICAgICAgIHAxLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IFwiMzJweCAzMnB4XCI7XG4gICAgICAgICAgICAgICAgcDIuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gXCI1MCUgNTAlXCI7XG5cbiAgICAgICAgICAgICAgICBsZXQgdDEgPSAyMDAwLCB0Mj0xNDAwO1xuICAgICAgICAgICAgICAgICgkKHAxKSBhcyBhbnkpLnZlbG9jaXR5KHtyb3RhdGVaOlwiLT0zNjBkZWdcIn0sIHtkdXJhdGlvbjp0MSwgZWFzaW5nOlwibGluZWFyXCJ9KTtcbiAgICAgICAgICAgICAgICB0aGlzLiRoYW5kbGUxID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAoJChwMSkgYXMgYW55KS52ZWxvY2l0eSh7cm90YXRlWjpcIi09MzYwZGVnXCJ9LCB7ZHVyYXRpb246dDEsIGVhc2luZzpcImxpbmVhclwifSk7XG4gICAgICAgICAgICAgICAgfSwgdDEpO1xuICAgICAgICAgICAgICAgICgkKHAyKSBhcyBhbnkpLnZlbG9jaXR5KHtyb3RhdGVaOlwiKz0zNjBkZWdcIn0sIHtkdXJhdGlvbjp0MiwgZWFzaW5nOlwibGluZWFyXCIsIGxvb3A6dHJ1ZX0pO1xuICAgICAgICAgICAgfSwkOntcbiAgICAgICAgICAgICAgICBzZzpcInN2Z1wiLFxuICAgICAgICAgICAgICAgIGFsaWFzOlwic2JveFwiLFxuICAgICAgICAgICAgICAgIHN0eWxlOntcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6NjQsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDo2NFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTsgXG4gICAgfTsgXG4gICAgV2lkZ2V0cy5hcmMgPSBmdW5jdGlvbigpOmFueXtcbiAgICAgICAgcmV0dXJue1xuICAgICAgICAgICAgc2c6XCJwYXRoXCIsXG4gICAgICAgICAgICB1cGRhdGU6ZnVuY3Rpb24oY2VudGVyOm51bWJlcltdLCByYWRpdXM6bnVtYmVyLCBhbmdsZTpudW1iZXIpOnZvaWR7XG4gICAgICAgICAgICAgICAgbGV0IHBlbmQgPSBwb2xhclRvQ2FydGVzaWFuKGNlbnRlclswXSwgY2VudGVyWzFdLCByYWRpdXMsIGFuZ2xlKTtcbiAgICAgICAgICAgICAgICBsZXQgcHN0YXJ0ID0gW2NlbnRlclswXSArIHJhZGl1cywgY2VudGVyWzFdXTtcbiAgICAgICAgICAgICAgICBsZXQgZCA9IFtcIk1cIiArIHBzdGFydFswXSwgcHN0YXJ0WzFdLCBcIkFcIiArIHJhZGl1cywgcmFkaXVzLCBcIjAgMSAwXCIsIHBlbmRbMF0sIHBlbmRbMV1dO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlTlMobnVsbCwgXCJkXCIsIGQuam9pbihcIiBcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG4gICAgZnVuY3Rpb24gcG9sYXJUb0NhcnRlc2lhbihjZW50ZXJYOm51bWJlciwgY2VudGVyWTpudW1iZXIsIHJhZGl1czpudW1iZXIsIGFuZ2xlSW5EZWdyZWVzOm51bWJlcikge1xuICAgICAgICBsZXQgYW5nbGVJblJhZGlhbnMgPSBhbmdsZUluRGVncmVlcyAqIE1hdGguUEkgLyAxODAuMDtcbiAgICAgICAgbGV0IHggPSBjZW50ZXJYICsgcmFkaXVzICogTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xuICAgICAgICBsZXQgeSA9IGNlbnRlclkgKyByYWRpdXMgKiBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XG4gICAgICAgIHJldHVybiBbeCx5XTtcbiAgICB9XG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
