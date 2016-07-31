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
        DomCreator.prototype.extend = function (o, json) {
            if (json instanceof Node || json instanceof Element) {
                debugger;
                return;
            }
            if (o instanceof HTMLElement) {
                wo.domextend(o, json);
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
                wo.domapply(o, json);
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

/// <reference path="use.ts" />
/// <reference path="objextend.ts" />
var wo;
(function (wo) {
    function applyattr(el, i, json) {
        var target = el[i];
        if (target) {
            var type = typeof target;
            if (type == 'object') {
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
        else {
            el[i] = json[i];
        }
    }
    function applychild(el, json, i, cs) {
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
    function domapply(el, json, bag) {
        var cs = el.cursor;
        for (var i in json) {
            if (i.startsWith("$$")) {
                applyattr(el, i, json);
            }
            else if (i == "$") {
                applychild(el, json, i, cs);
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

/// <reference path="use.ts" />
/// <reference path="objextend.ts" />
var wo;
(function (wo) {
    function applyattr(el, i, json) {
        var target = el[i];
        var type = typeof target;
        if (type == 'object') {
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
    function applychild(el, json, i, cs) {
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
    }
    function domextend(el, json, bag) {
        var cs = el.cursor;
        for (var i in json) {
            if (i.startsWith("$$")) {
                applyattr(el, i, json);
            }
            else if (i == "$") {
                applychild(el, json, i, cs);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHMiLCJmaW5nZXJzL3BhdHRlcm5zLnRzIiwiZmluZ2Vycy9yZWNvZ25pemVyLnRzIiwiZmluZ2Vycy90b3VjaC50cyIsImZpbmdlcnMvem9vbWVyLnRzIiwiZmluZ2Vycy9maW5nZXIudHMiLCJmaW5nZXJzL3JvdGF0b3IudHMiLCJ3by9mb3VuZGF0aW9uL3N0cmluZy50cyIsIndvL2J1aWxkZXIvdXNlLnRzIiwid28vYnVpbGRlci9kb21jcmVhdG9yLnRzIiwid28vYnVpbGRlci9zdmdjcmVhdG9yLnRzIiwid28vYnVpbGRlci91aWNyZWF0b3IudHMiLCJ3by93by50cyIsIndvL2J1aWxkZXIvb2JqZXh0ZW5kLnRzIiwid28vYnVpbGRlci9kb21hcHBseS50cyIsIndvL2J1aWxkZXIvZG9tZXh0ZW5kLnRzIiwid28vZm91bmRhdGlvbi9kZXZpY2UudHMiLCJ3by9mb3VuZGF0aW9uL2VsZW1lbnRzLnRzIiwid28vd2lkZ2V0cy9jYXJkL2NhcmQudHMiLCJ3by93aWRnZXRzL2NvdmVyL2NvdmVyLnRzIiwid28vd2lkZ2V0cy9kcm9wZG93bi9kcm9wZG93bi50cyIsIndvL3dpZGdldHMvbG9hZGluZy9sb2FkaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW1DQSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxVQUFVLElBQVE7SUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDMUIsQ0FBQyxDQUFBO0FBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxTQUFrQjtJQUNuRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3BCLEdBQUcsQ0FBQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxDQUFDO1FBQy9CLGlCQUFp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QyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLEdBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxHQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2SCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyx5REFBeUQ7WUFDeEYsSUFBSSxDQUFDLEdBQVE7Z0JBQ1QsR0FBRyxFQUFDLFdBQVc7Z0JBQ2YsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7Z0JBQzNELEdBQUcsRUFBQyxHQUFHO2dCQUNQLEtBQUssRUFBQyxFQUFFO2dCQUNSLE1BQU0sRUFBQyxNQUFNO2dCQUNiLE9BQU8sRUFBQyxPQUFPO2dCQUNmLElBQUksRUFBQyxDQUFDLENBQUMsSUFBSTthQUNkLENBQUM7WUFDRixNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNMLHVCQUFDO0lBQUQsQ0EvQkEsQUErQkMsSUFBQTtJQUVEO1FBQUE7UUE2QkEsQ0FBQztRQTVCRyw0QkFBTSxHQUFOLFVBQU8sSUFBVyxFQUFFLEtBQVcsRUFBRSxJQUFZO1lBQ3pDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQzttQkFDbkIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFVBQVUsQ0FBQzttQkFDeEQsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBQzttQkFDMUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO21CQUNmLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUVELCtCQUFTLEdBQVQsVUFBVSxLQUFXLEVBQUUsSUFBVztZQUM5QixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLEdBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxHQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2SCxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLHlEQUF5RDtZQUN4RixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLEdBQVE7Z0JBQ1QsR0FBRyxFQUFDLFNBQVM7Z0JBQ2IsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FB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QUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDO1NBQ0osQ0FBQztJQUNOLENBQUMsQ0FBQztJQUNGLDBCQUEwQixPQUFjLEVBQUUsT0FBYyxFQUFFLE1BQWEsRUFBRSxjQUFxQjtRQUMxRixJQUFJLGNBQWMsR0FBRyxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDdEQsSUFBSSxDQUFDLEdBQUcsT0FBTyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsQ0FBQztBQUNMLENBQUMsRUFyRFMsRUFBRSxLQUFGLEVBQUUsUUFxRFgiLCJmaWxlIjoid28uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgV2luZG93e1xuXHRvcHI6YW55O1xuXHRvcGVyYTphbnk7XG5cdGNocm9tZTphbnk7XG5cdFN0eWxlTWVkaWE6YW55O1xuXHRJbnN0YWxsVHJpZ2dlcjphbnk7XG5cdENTUzphbnk7XG59XG5cbmludGVyZmFjZSBEb2N1bWVudHtcblx0ZG9jdW1lbnRNb2RlOmFueTtcbn1cblxuLy8gRWxlbWVudC50c1xuaW50ZXJmYWNlIEVsZW1lbnR7XG5cdFtuYW1lOnN0cmluZ106YW55O1xuXHRhc3R5bGUoc3R5bGVzOnN0cmluZ1tdKTpzdHJpbmc7XG5cdHNldCh2YWw6YW55KTp2b2lkO1xuXHRkZXN0cm95U3RhdHVzOmFueTtcblx0ZGlzcG9zZSgpOmFueTtcbn1cblxuaW50ZXJmYWNlIE5vZGV7XG5cdGN1cnNvcjphbnk7XG59XG5cbmludGVyZmFjZSBTdHJpbmd7XG5cdHN0YXJ0c1dpdGgoc3RyOnN0cmluZyk6Ym9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRhZGQoaXRlbTpUKTp2b2lkO1xuXHRjbGVhcihkZWw/OmJvb2xlYW4pOnZvaWQ7XG59XG5cbkFycmF5LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoaXRlbTphbnkpIHtcblx0dGhpc1t0aGlzLmxlbmd0aF0gPSBpdGVtO1xufVxuXG5BcnJheS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoa2VlcGFsaXZlPzpib29sZWFuKSB7XG5cdGxldCBuID0gdGhpcy5sZW5ndGg7XG5cdGZvcihsZXQgaSA9IG4gLSAxOyBpID49IDA7IGktLSl7XG5cdFx0Ly9kZWxldGUgdGhpc1tpXTtcblx0XHRsZXQgdG1wID0gdGhpcy5wb3AoKTtcblx0XHR0bXAgPSBudWxsO1xuXHR9XG59XG4iLCJcclxubmFtZXNwYWNlIGZpbmdlcnN7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbjtcclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6YW55O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgUGF0dGVybnM6YW55ID0ge307XHJcbiAgICBcclxuICAgIGNsYXNzIFRvdWNoZWRQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNoZW5kXCIgJiYgcXVldWUubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSwgb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgbGV0IHByZXYgPSBxdWV1ZVsxXTtcclxuICAgICAgICAgICAgLy9kZWJ1Z2dlcjtcclxuICAgICAgICAgICAgaWYgKHByZXYgJiYgcHJldi5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0ID0gcHJldlswXTtcclxuICAgICAgICAgICAgICAgIGxldCBkcmFnID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAob3V0cSAhPSBudWxsICYmIG91dHEubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhY3Q6YW55ID0gb3V0cVswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFjdCAmJiAocGFjdC5hY3QgPT0gXCJkcmFnZ2luZ1wiIHx8IHBhY3QuYWN0ID09IFwiZHJhZ3N0YXJ0XCIpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFkcmFnKXsgXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7IGk8MzsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHEgPSBxdWV1ZVtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHFbMF0uYWN0ID09IFwidG91Y2hzdGFydFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0OlwidG91Y2hlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xhc3MgRHJhZ2dpbmdQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDEgXHJcbiAgICAgICAgICAgICAgICAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNobW92ZVwiIFxyXG4gICAgICAgICAgICAgICAgJiYgcXVldWUubGVuZ3RoID4gMjtcclxuICAgICAgICAgICAgaWYgKHJsdCl7XHJcbiAgICAgICAgICAgICAgICBybHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGxldCBzMSA9IHF1ZXVlWzJdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHMyID0gcXVldWVbMV07XHJcbiAgICAgICAgICAgICAgICBpZiAoczEubGVuZ3RoID09IDEgJiYgczIubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhMSA9IHMxWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhMiA9IHMyWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhMS5hY3QgPT0gXCJ0b3VjaHN0YXJ0XCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2RlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYTEuYWN0ID09IFwidG91Y2hzdGFydFwiICYmIGEyLmFjdCA9PSBcInRvdWNobW92ZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZiAoYTEuYWN0ID09IFwidG91Y2htb3ZlXCIgJiYgYTIuYWN0ID09IFwidG91Y2htb3ZlXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBybHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlY29nbml6ZShxdWV1ZTphbnlbXSxvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgcHJldiA9IHF1ZXVlWzJdO1xyXG4gICAgICAgICAgICBpZiAocHJldi5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0ID0gcHJldlswXTtcclxuICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChhY3QuYWN0ID09IFwidG91Y2hzdGFydFwiKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJkcmFnc3RhcnRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiAoYWN0LmFjdCA9PSBcInRvdWNobW92ZVwiICYmIG91dHEubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhY3QgPSBvdXRxWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyYWN0LmFjdCA9PSBcImRyYWdzdGFydFwiIHx8IHJhY3QuYWN0ID09IFwiZHJhZ2dpbmdcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJkcmFnZ2luZ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIERyb3BQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMSAmJiBhY3RzWzBdLmFjdCA9PSBcInRvdWNoZW5kXCIgJiYgcXVldWUubGVuZ3RoID4gMCAmJiBvdXRxLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sb3V0cTppYWN0W10pOmFueXtcclxuICAgICAgICAgICAgLy9sZXQgcHJldiA9IHF1ZXVlWzFdO1xyXG4gICAgICAgICAgICBsZXQgYWN0ID0gb3V0cVswXTtcclxuICAgICAgICAgICAgaWYgKGFjdC5hY3QgPT0gXCJkcmFnZ2luZ1wiIHx8IGFjdC5hY3QgPT0gXCJkcmFnc3RhcnRcIil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdDpcImRyb3BwZWRcIixcclxuICAgICAgICAgICAgICAgICAgICBjcG9zOlthY3QuY3Bvc1swXSwgYWN0LmNwb3NbMV1dLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIERibFRvdWNoZWRQYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IGFjdHMubGVuZ3RoID09IDEgJiYgYWN0c1swXS5hY3QgPT0gXCJ0b3VjaGVuZFwiICYmIHF1ZXVlLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIHJldHVybiBybHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCBwcmV2ID0gcXVldWVbMV07XHJcbiAgICAgICAgICAgIGlmIChwcmV2ICYmIHByZXYubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICAgICAgbGV0IGFjdCA9IHByZXZbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAob3V0cSAhPSBudWxsICYmIG91dHEubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhY3Q6YW55ID0gb3V0cVswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFjdCAmJiBwYWN0LmFjdCA9PSBcInRvdWNoZWRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhY3QuYWN0ID09IFwidG91Y2hzdGFydFwiIHx8IGFjdC5hY3QgPT0gXCJ0b3VjaG1vdmVcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0LnRpbWUgLSBwYWN0LnRpbWUgPCA1MDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdDpcImRibHRvdWNoZWRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3BvczpbYWN0LmNwb3NbMF0sIGFjdC5jcG9zWzFdXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZTphY3QudGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Q6XCJ0b3VjaGVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwb3M6W2FjdC5jcG9zWzBdLCBhY3QuY3Bvc1sxXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6YWN0LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYWxjQW5nbGUoYTppYWN0LCBiOmlhY3QsIGxlbjpudW1iZXIpOm51bWJlcntcclxuICAgICAgICBsZXQgYWcgPSBNYXRoLmFjb3MoKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkvbGVuKSAvIE1hdGguUEkgKiAxODA7XHJcbiAgICAgICAgaWYgKGIuY3Bvc1sxXSA8IGEuY3Bvc1sxXSl7XHJcbiAgICAgICAgICAgIGFnKj0tMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFnO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFpvb21TdGFydFBhdHRlcm4gaW1wbGVtZW50cyBpcGF0dGVybntcclxuICAgICAgICB2ZXJpZnkoYWN0czppYWN0W10sIHF1ZXVlOmFueVtdLCBvdXRxPzppYWN0W10pOmJvb2xlYW57XHJcbiAgICAgICAgICAgIGxldCBybHQgPSBhY3RzLmxlbmd0aCA9PSAyIFxyXG4gICAgICAgICAgICAgICAgJiYgKChhY3RzWzBdLmFjdCA9PSBcInRvdWNoc3RhcnRcIiB8fCBhY3RzWzFdLmFjdCA9PSBcInRvdWNoc3RhcnRcIilcclxuICAgICAgICAgICAgICAgICAgICB8fChvdXRxLmxlbmd0aCA+IDAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2htb3ZlXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIGFjdHNbMV0uYWN0ID09IFwidG91Y2htb3ZlXCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIG91dHFbMF0uYWN0ICE9IFwiem9vbWluZ1wiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBvdXRxWzBdLmFjdCAhPSBcInpvb21zdGFydFwiICkpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLCBvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgYWN0cyA9IHF1ZXVlWzBdO1xyXG4gICAgICAgICAgICBsZXQgYTppYWN0ID0gYWN0c1swXTtcclxuICAgICAgICAgICAgbGV0IGI6aWFjdCA9IGFjdHNbMV07XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBNYXRoLnNxcnQoKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkqKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkgKyAoYi5jcG9zWzFdIC0gYS5jcG9zWzFdKSooYi5jcG9zWzFdIC0gYS5jcG9zWzFdKSk7XHJcbiAgICAgICAgICAgIGxldCBvd2lkdGggPSBNYXRoLmFicyhiLmNwb3NbMF0gLSBhLmNwb3NbMF0pO1xyXG4gICAgICAgICAgICBsZXQgb2hlaWdodCA9IE1hdGguYWJzKGIuY3Bvc1sxXSAtIGEuY3Bvc1sxXSk7XHJcbiAgICAgICAgICAgIGxldCBhZyA9IGNhbGNBbmdsZShhLCBiLCBsZW4pOyAvL01hdGguYWNvcygoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKS9sZW4pIC8gTWF0aC5QSSAqIDE4MDtcclxuICAgICAgICAgICAgbGV0IHI6aWFjdCA9IHtcclxuICAgICAgICAgICAgICAgIGFjdDpcInpvb21zdGFydFwiLFxyXG4gICAgICAgICAgICAgICAgY3BvczpbKGEuY3Bvc1swXSArIGIuY3Bvc1swXSkvMiwgKGEuY3Bvc1sxXSArIGIuY3Bvc1sxXSkvMl0sXHJcbiAgICAgICAgICAgICAgICBsZW46bGVuLFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6YWcsXHJcbiAgICAgICAgICAgICAgICBvd2lkdGg6b3dpZHRoLFxyXG4gICAgICAgICAgICAgICAgb2hlaWdodDpvaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgdGltZTphLnRpbWVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFpvb21QYXR0ZXJuIGltcGxlbWVudHMgaXBhdHRlcm57XHJcbiAgICAgICAgdmVyaWZ5KGFjdHM6aWFjdFtdLCBxdWV1ZTphbnlbXSwgb3V0cT86aWFjdFtdKTpib29sZWFue1xyXG4gICAgICAgICAgICBsZXQgcmx0ID0gYWN0cy5sZW5ndGggPT0gMiBcclxuICAgICAgICAgICAgICAgICYmIChhY3RzWzBdLmFjdCAhPSBcInRvdWNoZW5kXCIgJiYgYWN0c1sxXS5hY3QgIT0gXCJ0b3VjaGVuZFwiKVxyXG4gICAgICAgICAgICAgICAgJiYgKGFjdHNbMF0uYWN0ID09IFwidG91Y2htb3ZlXCIgfHwgYWN0c1sxXS5hY3QgPT0gXCJ0b3VjaG1vdmVcIilcclxuICAgICAgICAgICAgICAgICYmIG91dHEubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgICAgJiYgKG91dHFbMF0uYWN0ID09IFwiem9vbXN0YXJ0XCIgfHwgb3V0cVswXS5hY3QgPT0gXCJ6b29taW5nXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVjb2duaXplKHF1ZXVlOmFueVtdLCBvdXRxOmlhY3RbXSk6YW55e1xyXG4gICAgICAgICAgICBsZXQgYWN0cyA9IHF1ZXVlWzBdO1xyXG4gICAgICAgICAgICBsZXQgYTppYWN0ID0gYWN0c1swXTtcclxuICAgICAgICAgICAgbGV0IGI6aWFjdCA9IGFjdHNbMV07XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBNYXRoLnNxcnQoKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkqKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSkgKyAoYi5jcG9zWzFdIC0gYS5jcG9zWzFdKSooYi5jcG9zWzFdIC0gYS5jcG9zWzFdKSk7XHJcbiAgICAgICAgICAgIGxldCBhZyA9IGNhbGNBbmdsZShhLCBiLCBsZW4pOyAvL01hdGguYWNvcygoYi5jcG9zWzBdIC0gYS5jcG9zWzBdKS9sZW4pIC8gTWF0aC5QSSAqIDE4MDtcclxuICAgICAgICAgICAgbGV0IG93aWR0aCA9IE1hdGguYWJzKGIuY3Bvc1swXSAtIGEuY3Bvc1swXSk7XHJcbiAgICAgICAgICAgIGxldCBvaGVpZ2h0ID0gTWF0aC5hYnMoYi5jcG9zWzFdIC0gYS5jcG9zWzFdKTtcclxuICAgICAgICAgICAgbGV0IHI6aWFjdCA9IHtcclxuICAgICAgICAgICAgICAgIGFjdDpcInpvb21pbmdcIixcclxuICAgICAgICAgICAgICAgIGNwb3M6WyhhLmNwb3NbMF0gKyBiLmNwb3NbMF0pLzIsIChhLmNwb3NbMV0gKyBiLmNwb3NbMV0pLzJdLFxyXG4gICAgICAgICAgICAgICAgbGVuOmxlbixcclxuICAgICAgICAgICAgICAgIGFuZ2xlOmFnLFxyXG4gICAgICAgICAgICAgICAgb3dpZHRoOm93aWR0aCxcclxuICAgICAgICAgICAgICAgIG9oZWlnaHQ6b2hlaWdodCxcclxuICAgICAgICAgICAgICAgIHRpbWU6YS50aW1lXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBab29tRW5kUGF0dGVybiBpbXBsZW1lbnRzIGlwYXR0ZXJue1xyXG4gICAgICAgIHZlcmlmeShhY3RzOmlhY3RbXSwgcXVldWU6YW55W10sIG91dHE/OmlhY3RbXSk6Ym9vbGVhbntcclxuICAgICAgICAgICAgbGV0IHJsdCA9IG91dHEubGVuZ3RoID4gMCBcclxuICAgICAgICAgICAgICAgICYmIChvdXRxWzBdLmFjdCA9PSBcInpvb21zdGFydFwiIHx8IG91dHFbMF0uYWN0ID09IFwiem9vbWluZ1wiKVxyXG4gICAgICAgICAgICAgICAgJiYgYWN0cy5sZW5ndGggPD0yO1xyXG4gICAgICAgICAgICBpZiAocmx0KXtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5kaXIoYWN0cyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0cy5sZW5ndGggPCAyKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBvZiBhY3RzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkuYWN0ID09IFwidG91Y2hlbmRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNvZ25pemUocXVldWU6YW55W10sIG91dHE6aWFjdFtdKTphbnl7XHJcbiAgICAgICAgICAgIGxldCByOmlhY3QgPSB7XHJcbiAgICAgICAgICAgICAgICBhY3Q6XCJ6b29tZW5kXCIsXHJcbiAgICAgICAgICAgICAgICBjcG9zOlswLCAwXSxcclxuICAgICAgICAgICAgICAgIGxlbjowLFxyXG4gICAgICAgICAgICAgICAgYW5nbGU6MCxcclxuICAgICAgICAgICAgICAgIG93aWR0aDowLFxyXG4gICAgICAgICAgICAgICAgb2hlaWdodDowLFxyXG4gICAgICAgICAgICAgICAgdGltZTpuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFBhdHRlcm5zLnpvb21lbmQgPSBuZXcgWm9vbUVuZFBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLnpvb21pbmcgPSBuZXcgWm9vbVBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLnpvb21zdGFydCA9IG5ldyBab29tU3RhcnRQYXR0ZXJuKCk7XHJcbiAgICBQYXR0ZXJucy5kcmFnZ2luZyA9IG5ldyBEcmFnZ2luZ1BhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLmRyb3BwZWQgPSBuZXcgRHJvcFBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLnRvdWNoZWQgPSBuZXcgVG91Y2hlZFBhdHRlcm4oKTtcclxuICAgIFBhdHRlcm5zLmRibHRvdWNoZWQgPSBuZXcgRGJsVG91Y2hlZFBhdHRlcm4oKTtcclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vd28vZm91bmRhdGlvbi9kZWZpbml0aW9ucy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhdHRlcm5zLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBmaW5nZXJze1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBpYWN0e1xyXG4gICAgICAgIGFjdDpzdHJpbmcsXHJcbiAgICAgICAgY3BvczpudW1iZXJbXSxcclxuICAgICAgICBycG9zPzpudW1iZXJbXSxcclxuICAgICAgICBvaGVpZ2h0PzpudW1iZXIsXHJcbiAgICAgICAgb3dpZHRoPzpudW1iZXIsXHJcbiAgICAgICAgbGVuPzpudW1iZXIsXHJcbiAgICAgICAgYW5nbGU/Om51bWJlcixcclxuICAgICAgICB0aW1lPzpudW1iZXJcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVjb2duaXplcntcclxuICAgICAgICBpbnF1ZXVlOmFueVtdID0gW107XHJcbiAgICAgICAgb3V0cXVldWU6aWFjdFtdID0gW107XHJcbiAgICAgICAgcGF0dGVybnM6aXBhdHRlcm5bXSA9IFtdO1xyXG4gICAgICAgIGNmZzphbnk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKGNmZzphbnkpe1xyXG4gICAgICAgICAgICBsZXQgZGVmcGF0dGVybnMgPSBbXCJ6b29tZW5kXCIsIFwiem9vbXN0YXJ0XCIsIFwiem9vbWluZ1wiLCBcImRibHRvdWNoZWRcIiwgXCJ0b3VjaGVkXCIsIFwiZHJvcHBlZFwiLCBcImRyYWdnaW5nXCJdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKCFjZmcpe1xyXG4gICAgICAgICAgICAgICAgY2ZnID0ge3BhdHRlcm5zOmRlZnBhdHRlcm5zfTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFjZmcucGF0dGVybnMpe1xyXG4gICAgICAgICAgICAgICAgY2ZnLnBhdHRlcm5zID0gZGVmcGF0dGVybnM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2ZnID0gY2ZnO1xyXG4gICAgICAgICAgICBmb3IobGV0IGkgb2YgY2ZnLnBhdHRlcm5zKXtcclxuICAgICAgICAgICAgICAgIGlmIChQYXR0ZXJuc1tpXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXR0ZXJucy5hZGQoUGF0dGVybnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFyc2UoYWN0czppYWN0W10pOnZvaWR7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jZmcucWxlbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNmZy5xbGVuID0gMTI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5xdWV1ZS5zcGxpY2UoMCwgMCwgYWN0cyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlucXVldWUubGVuZ3RoID4gdGhpcy5jZmcucWxlbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlucXVldWUuc3BsaWNlKHRoaXMuaW5xdWV1ZS5sZW5ndGggLSAxLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2ZnLm9uICYmIHRoaXMuY2ZnLm9uLnRhcCl7XHJcbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgb2YgYWN0cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9hY3RzLmxlbmd0aCA+PSAxICYmIGFjdHNbMF0uYWN0ID09IFwidG91Y2hzdGFydFwiICYmXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkuYWN0ID09IFwidG91Y2hzdGFydFwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZmcub24udGFwKGFjdHNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgcGF0dGVybiBvZiB0aGlzLnBhdHRlcm5zKXtcclxuICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJuLnZlcmlmeShhY3RzLCB0aGlzLmlucXVldWUsIHRoaXMub3V0cXVldWUpKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmx0ID0gcGF0dGVybi5yZWNvZ25pemUodGhpcy5pbnF1ZXVlLCB0aGlzLm91dHF1ZXVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmx0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vdXRxdWV1ZS5zcGxpY2UoMCwgMCwgcmx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3V0cXVldWUubGVuZ3RoID4gdGhpcy5jZmcucWxlbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm91dHF1ZXVlLnNwbGljZSh0aGlzLm91dHF1ZXVlLmxlbmd0aCAtIDEsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBxID0gdGhpcy5pbnF1ZXVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlucXVldWUgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcS5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jZmcub24gJiYgdGhpcy5jZmcub25bcmx0LmFjdF0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZmcub25bcmx0LmFjdF0ocmx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jZmcub25yZWNvZ25pemVkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2ZnLm9ucmVjb2duaXplZChybHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJyZWNvZ25pemVyLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBmaW5nZXJze1xyXG4gICAgbGV0IGluaXRlZDpib29sZWFuID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGNsYXNzIHpvb21zaW17XHJcbiAgICAgICAgb3BwbzppYWN0O1xyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGUoYWN0OmlhY3QpOnZvaWR7XHJcbiAgICAgICAgICAgIGxldCBtID0gW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aC8yLCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LzJdO1xyXG4gICAgICAgICAgICB0aGlzLm9wcG8gPSB7YWN0OmFjdC5hY3QsIGNwb3M6WzIqbVswXSAtIGFjdC5jcG9zWzBdLCAyKm1bMV0gLSBhY3QuY3Bvc1sxXV0sIHRpbWU6YWN0LnRpbWV9O1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFjdC5jcG9zWzFdLCBtWzFdLCB0aGlzLm9wcG8uY3Bvc1sxXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXJ0KGFjdDppYWN0KTppYWN0W117XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKGFjdCk7XHJcbiAgICAgICAgICAgIHJldHVybiBbYWN0LCB0aGlzLm9wcG9dO1xyXG4gICAgICAgIH1cclxuICAgICAgICB6b29tKGFjdDppYWN0KTppYWN0W117XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKGFjdCk7XHJcbiAgICAgICAgICAgIHJldHVybiBbYWN0LCB0aGlzLm9wcG9dO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbmQoYWN0OmlhY3QpOmlhY3RbXXtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGUoYWN0KTtcclxuICAgICAgICAgICAgcmV0dXJuIFthY3QsIHRoaXMub3Bwb107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGFzcyBvZmZzZXRzaW0gZXh0ZW5kcyB6b29tc2lte1xyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGUoYWN0OmlhY3QpOnZvaWR7XHJcbiAgICAgICAgICAgIHRoaXMub3BwbyA9IHthY3Q6YWN0LmFjdCwgY3BvczpbYWN0LmNwb3NbMF0gKyAxMDAsIGFjdC5jcG9zWzFdICsgMTAwXSwgdGltZTphY3QudGltZX07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB6czp6b29tc2ltID0gbnVsbDtcclxuICAgIGxldCBvczpvZmZzZXRzaW0gPSBudWxsO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldG91Y2hlcyhldmVudDphbnksIGlzZW5kPzpib29sZWFuKTphbnl7XHJcbiAgICAgICAgaWYgKGlzZW5kKXtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50LmNoYW5nZWRUb3VjaGVzO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gZXZlbnQudG91Y2hlcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRvdWNoKGNmZzphbnkpOmFueXtcclxuICAgICAgICBsZXQgcmc6UmVjb2duaXplciA9IG5ldyBSZWNvZ25pemVyKGNmZyk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUFjdChuYW1lOnN0cmluZywgeDpudW1iZXIsIHk6bnVtYmVyKTppYWN0e1xyXG4gICAgICAgICAgICByZXR1cm4ge2FjdDpuYW1lLCBjcG9zOlt4LCB5XSwgdGltZTpuZXcgRGF0ZSgpLmdldFRpbWUoKX07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGUoY2ZnOmFueSwgYWN0czppYWN0W10pOnZvaWR7XHJcbiAgICAgICAgICAgIGlmICghY2ZnIHx8ICFjZmcuZW5hYmxlZCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNmZy5vbmFjdCl7XHJcbiAgICAgICAgICAgICAgICBjZmcub25hY3QocmcuaW5xdWV1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmcucGFyc2UoYWN0cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWluaXRlZCl7XHJcbiAgICAgICAgICAgIGRvY3VtZW50Lm9uY29udGV4dG1lbnUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKCFNb2JpbGVEZXZpY2UuYW55KXtcclxuICAgICAgICAgICAgICAgIHpzID0gbmV3IHpvb21zaW0oKTtcclxuICAgICAgICAgICAgICAgIG9zID0gbmV3IG9mZnNldHNpbSgpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdDppYWN0ID0gY3JlYXRlQWN0KFwidG91Y2hzdGFydFwiLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCBvcy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT0gMil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpzLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIHpzLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0OmlhY3QgPSBjcmVhdGVBY3QoXCJ0b3VjaG1vdmVcIiwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PSAwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3Muc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgb3Mub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB6cy5zdGFydChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBbYWN0LCB6cy5vcHBvXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNoZW5kXCIsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5idXR0b24gPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3RdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9zLnN0YXJ0KGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIFthY3QsIG9zLm9wcG9dKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PSAyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgenMuc3RhcnQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgW2FjdCwgenMub3Bwb10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0czppYWN0W10gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG91Y2hlcyA9IGdldG91Y2hlcyhldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7IGk8dG91Y2hlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNoc3RhcnRcIiwgaXRlbS5jbGllbnRYLCBpdGVtLmNsaWVudFkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RzLmFkZChhY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGUoY2ZnLCBhY3RzKTtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdHM6aWFjdFtdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdWNoZXMgPSBnZXRvdWNoZXMoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNobW92ZVwiLCBpdGVtLmNsaWVudFgsIGl0ZW0uY2xpZW50WSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHMuYWRkKGFjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZShjZmcsIGFjdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChCcm93c2VyLmlzU2FmYXJpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdHM6aWFjdFtdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdWNoZXMgPSBnZXRvdWNoZXMoZXZlbnQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhY3Q6aWFjdCA9IGNyZWF0ZUFjdChcInRvdWNoZW5kXCIsIGl0ZW0uY2xpZW50WCwgaXRlbS5jbGllbnRZKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0cy5hZGQoYWN0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGNmZywgYWN0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5pdGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNmZztcclxuICAgIH1cclxufVxyXG5cclxubGV0IHRvdWNoID0gZmluZ2Vycy50b3VjaDsiLCJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJyZWNvZ25pemVyLnRzXCIgLz5cblxubmFtZXNwYWNlIGZpbmdlcnN7XG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFpvb21lcntcbiAgICAgICAgcHJvdGVjdGVkIHNhY3Q6aWFjdDtcbiAgICAgICAgcHJvdGVjdGVkIHBhY3Q6aWFjdDtcbiAgICAgICAgcHJvdGVjdGVkIHN0YXJ0ZWQ6Ym9vbGVhbjtcbiAgICAgICAgbWFwcGluZzp7fTtcbiAgICAgICAgY29uc3RydWN0b3IoZWw6YW55KXtcbiAgICAgICAgICAgIGlmICghZWwuJHpvb21lciQpe1xuICAgICAgICAgICAgICAgIGVsLiR6b29tZXIkID0gW3RoaXNdO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZWwuJHpvb21lciRbZWwuJHpvb21lciQubGVuZ3RoXSA9IHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgRHJhZyBleHRlbmRzIFpvb21lcntcbiAgICAgICAgY29uc3RydWN0b3IoZWw6YW55KXtcbiAgICAgICAgICAgIHN1cGVyKGVsKTtcbiAgICAgICAgICAgIGxldCB6b29tZXIgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5tYXBwaW5nID0ge1xuICAgICAgICAgICAgICAgIGRyYWdzdGFydDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnNhY3QgPSBhY3Q7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5wYWN0ID0gYWN0O1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSwgZHJhZ2dpbmc6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh6b29tZXIuc3RhcnRlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcCA9IHpvb21lci5wYWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IFthY3QuY3Bvc1swXSAtIHAuY3Bvc1swXSwgYWN0LmNwb3NbMV0gLSBwLmNwb3NbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbHRhID0ge29mZnNldDogb2Zmc2V0fTsgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbCA9IGVsLmFzdHlsZShbXCJsZWZ0XCJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ID0gZWwuYXN0eWxlKFtcInRvcFwiXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gcGFyc2VJbnQobCkgKyBkZWx0YS5vZmZzZXRbMF0gKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBwYXJzZUludCh0KSArIGRlbHRhLm9mZnNldFsxXSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb21lci5wYWN0ID0gYWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZHJhZ2VuZDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcG9pbnRPbkVsZW1lbnQoZWw6YW55LCBldnQ6c3RyaW5nLCBwb3M6bnVtYmVyW10pe1xuICAgICAgICBsZXQgcmx0ID0gWzAsIDBdO1xuICAgICAgICBlbC5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKGV2ZW50OmFueSl7XG4gICAgICAgICAgICBybHQgPSBbZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WV07XG4gICAgICAgIH1cbiAgICAgICAgc2ltdWxhdGUoZWwsIFwibW91c2VvdmVyXCIsIHBvcyk7XG4gICAgICAgIHJldHVybiBybHQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIFpvb20gZXh0ZW5kcyBab29tZXJ7XG4gICAgICAgIHByb3RlY3RlZCByb3Q6YW55O1xuICAgICAgICBjb25zdHJ1Y3RvcihlbDphbnkpe1xuICAgICAgICAgICAgc3VwZXIoZWwpO1xuICAgICAgICAgICAgbGV0IHpvb21lciA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLm1hcHBpbmcgPSB7XG4gICAgICAgICAgICAgICAgem9vbXN0YXJ0OmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc2FjdCA9IGFjdDtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnJvdCA9IFJvdGF0b3IoZWwpO1xuICAgICAgICAgICAgICAgIH0sIHpvb21pbmc6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh6b29tZXIuc3RhcnRlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcCA9IHpvb21lci5zYWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IFthY3QuY3Bvc1swXSAtIHAuY3Bvc1swXSwgYWN0LmNwb3NbMV0gLSBwLmNwb3NbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdCA9IGFjdC5hbmdsZSAtIHAuYW5nbGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2NhbGUgPSBhY3QubGVuIC8gcC5sZW47XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGVsdGEgPSB7b2Zmc2V0OiBvZmZzZXQsIGFuZ2xlOnJvdCwgc2NhbGU6c2NhbGV9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNlbnRlciA9IHBvaW50T25FbGVtZW50KGVsLCBcIm1vdXNlb3ZlclwiLCBhY3QuY3Bvcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb21lci5yb3Qucm90YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3M6b2Zmc2V0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmdsZTpyb3QsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjpjZW50ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGU6c2NhbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgem9vbWVyLnBhY3QgPSBhY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB6b29tZW5kOmZ1bmN0aW9uKGFjdDppYWN0LCBlbDphbnkpe1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIuc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIucm90LmNvbW1pdFN0YXR1cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBleHBvcnQgY2xhc3MgWnNpemUgZXh0ZW5kcyBab29tZXJ7XG4gICAgICAgIGNvbnN0cnVjdG9yKGVsOmFueSl7XG4gICAgICAgICAgICBzdXBlcihlbCk7XG4gICAgICAgICAgICBsZXQgem9vbWVyID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMubWFwcGluZyA9IHtcbiAgICAgICAgICAgICAgICB6b29tc3RhcnQ6ZnVuY3Rpb24oYWN0OmlhY3QsIGVsOmFueSl7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lci5zYWN0ID0gYWN0O1xuICAgICAgICAgICAgICAgICAgICB6b29tZXIucGFjdCA9IGFjdDtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sem9vbWluZzpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvb21lci5zdGFydGVkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwID0gem9vbWVyLnBhY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gW2FjdC5jcG9zWzBdIC0gcC5jcG9zWzBdLCBhY3QuY3Bvc1sxXSAtIHAuY3Bvc1sxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVzaXplID0gW2FjdC5vd2lkdGggLSBwLm93aWR0aCwgYWN0Lm9oZWlnaHQgLSBwLm9oZWlnaHRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbHRhID0ge29mZnNldDogb2Zmc2V0LCByZXNpemU6cmVzaXplfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHcgPSBlbC5hc3R5bGUoW1wid2lkdGhcIl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGggPSBlbC5hc3R5bGUoW1wiaGVpZ2h0XCJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGwgPSBlbC5hc3R5bGUoW1wibGVmdFwiXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdCA9IGVsLmFzdHlsZShbXCJ0b3BcIl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS53aWR0aCA9IHBhcnNlSW50KHcpICsgZGVsdGEucmVzaXplWzBdICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUuaGVpZ2h0ID0gcGFyc2VJbnQoaCkgKyBkZWx0YS5yZXNpemVbMV0gKyBcInB4XCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBwYXJzZUludChsKSArIGRlbHRhLm9mZnNldFswXSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHBhcnNlSW50KHQpICsgZGVsdGEub2Zmc2V0WzFdICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tZXIucGFjdCA9IGFjdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sem9vbWVuZDpmdW5jdGlvbihhY3Q6aWFjdCwgZWw6YW55KXtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVyLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaW11bGF0ZShlbGVtZW50OmFueSwgZXZlbnROYW1lOnN0cmluZywgcG9zOmFueSkge1xuICAgICAgICBmdW5jdGlvbiBleHRlbmQoZGVzdGluYXRpb246YW55LCBzb3VyY2U6YW55KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBzb3VyY2UpXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb25bcHJvcGVydHldID0gc291cmNlW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIHJldHVybiBkZXN0aW5hdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBldmVudE1hdGNoZXJzOmFueSA9IHtcbiAgICAgICAgICAgICdIVE1MRXZlbnRzJzogL14oPzpsb2FkfHVubG9hZHxhYm9ydHxlcnJvcnxzZWxlY3R8Y2hhbmdlfHN1Ym1pdHxyZXNldHxmb2N1c3xibHVyfHJlc2l6ZXxzY3JvbGwpJC8sXG4gICAgICAgICAgICAnTW91c2VFdmVudHMnOiAvXig/OmNsaWNrfGRibGNsaWNrfG1vdXNlKD86ZG93bnx1cHxvdmVyfG1vdmV8b3V0KSkkL1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgICAgICAgcG9pbnRlclg6IDEwMCxcbiAgICAgICAgICAgIHBvaW50ZXJZOiAxMDAsXG4gICAgICAgICAgICBidXR0b246IDAsXG4gICAgICAgICAgICBjdHJsS2V5OiBmYWxzZSxcbiAgICAgICAgICAgIGFsdEtleTogZmFsc2UsXG4gICAgICAgICAgICBzaGlmdEtleTogZmFsc2UsXG4gICAgICAgICAgICBtZXRhS2V5OiBmYWxzZSxcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgZGVmYXVsdE9wdGlvbnMucG9pbnRlclggPSBwb3NbMF07XG4gICAgICAgICAgICBkZWZhdWx0T3B0aW9ucy5wb2ludGVyWSA9IHBvc1sxXTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgb3B0aW9ucyA9IGV4dGVuZChkZWZhdWx0T3B0aW9ucywgYXJndW1lbnRzWzNdIHx8IHt9KTtcbiAgICAgICAgbGV0IG9FdmVudDphbnksIGV2ZW50VHlwZTphbnkgPSBudWxsO1xuXG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gZXZlbnRNYXRjaGVycykge1xuICAgICAgICAgICAgaWYgKGV2ZW50TWF0Y2hlcnNbbmFtZV0udGVzdChldmVudE5hbWUpKSB7IGV2ZW50VHlwZSA9IG5hbWU7IGJyZWFrOyB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWV2ZW50VHlwZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignT25seSBIVE1MRXZlbnRzIGFuZCBNb3VzZUV2ZW50cyBpbnRlcmZhY2VzIGFyZSBzdXBwb3J0ZWQnKTtcblxuICAgICAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcbiAgICAgICAgICAgIG9FdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KGV2ZW50VHlwZSk7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09ICdIVE1MRXZlbnRzJykge1xuICAgICAgICAgICAgICAgIG9FdmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCBvcHRpb25zLmJ1YmJsZXMsIG9wdGlvbnMuY2FuY2VsYWJsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvRXZlbnQuaW5pdE1vdXNlRXZlbnQoZXZlbnROYW1lLCBvcHRpb25zLmJ1YmJsZXMsIG9wdGlvbnMuY2FuY2VsYWJsZSwgZG9jdW1lbnQuZGVmYXVsdFZpZXcsXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5idXR0b24sIG9wdGlvbnMucG9pbnRlclgsIG9wdGlvbnMucG9pbnRlclksIG9wdGlvbnMucG9pbnRlclgsIG9wdGlvbnMucG9pbnRlclksXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jdHJsS2V5LCBvcHRpb25zLmFsdEtleSwgb3B0aW9ucy5zaGlmdEtleSwgb3B0aW9ucy5tZXRhS2V5LCBvcHRpb25zLmJ1dHRvbiwgZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQob0V2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9wdGlvbnMuY2xpZW50WCA9IG9wdGlvbnMucG9pbnRlclg7XG4gICAgICAgICAgICBvcHRpb25zLmNsaWVudFkgPSBvcHRpb25zLnBvaW50ZXJZO1xuICAgICAgICAgICAgdmFyIGV2dCA9IChkb2N1bWVudCBhcyBhbnkpLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgICAgICAgICBvRXZlbnQgPSBleHRlbmQoZXZ0LCBvcHRpb25zKTtcbiAgICAgICAgICAgIGVsZW1lbnQuZmlyZUV2ZW50KCdvbicgKyBldmVudE5hbWUsIG9FdmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidG91Y2gudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiem9vbWVyLnRzXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBmaW5nZXJze1xyXG4gICAgZnVuY3Rpb24gZWxBdFBvcyhwb3M6bnVtYmVyW10pOmFueXtcclxuICAgICAgICBsZXQgcmx0OmFueSA9IG51bGw7XHJcbiAgICAgICAgbGV0IGNhY2hlOmFueVtdID0gW107XHJcbiAgICAgICAgd2hpbGUodHJ1ZSl7XHJcbiAgICAgICAgICAgIGxldCBlbDphbnkgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHBvc1swXSwgcG9zWzFdKTtcclxuICAgICAgICAgICAgaWYgKGVsID09IGRvY3VtZW50LmJvZHkgfHwgZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IFwiaHRtbFwiIHx8IGVsID09IHdpbmRvdyl7XHJcbiAgICAgICAgICAgICAgICBybHQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChlbC4kZXZ0cmFwJCl7XHJcbiAgICAgICAgICAgICAgICBybHQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChlbC4kdG91Y2hhYmxlJCl7XHJcbiAgICAgICAgICAgICAgICBybHQgPSBlbC5nZXRhcmdldD9lbC5nZXRhcmdldCgpOmVsXHJcbiAgICAgICAgICAgICAgICBybHQuJHRvdWNoZWwkID0gZWw7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICBjYWNoZS5hZGQoZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvcihsZXQgaSBvZiBjYWNoZSl7XHJcbiAgICAgICAgICAgIGkuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBybHQ7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFjdGl2ZUVsOmFueTtcclxuICAgIGxldCBpbml0ZWQ6Ym9vbGVhbj1mYWxzZTtcclxuICAgIGxldCBjZmc6YW55ID0gbnVsbDtcclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZmluZ2VyKGVsOmFueSk6YW55e1xyXG4gICAgICAgIGlmICghY2ZnKXtcclxuICAgICAgICAgICAgY2ZnID0gdG91Y2goe1xyXG4gICAgICAgICAgICAgICAgb246eyBcclxuICAgICAgICAgICAgICAgICAgICB0YXA6ZnVuY3Rpb24oYWN0OmlhY3Qpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbCA9IGVsQXRQb3MoYWN0LmNwb3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sb25hY3Q6ZnVuY3Rpb24oaW5xOmFueSl7XHJcbiAgICAgICAgICAgICAgICB9LG9ucmVjb2duaXplZDpmdW5jdGlvbihhY3Q6aWFjdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZUVsICYmIGFjdGl2ZUVsLiR6b29tZXIkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHptID0gYWN0aXZlRWwuJHpvb21lciQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBvZiB6bSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaS5tYXBwaW5nW2FjdC5hY3RdKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLm1hcHBpbmdbYWN0LmFjdF0oYWN0LCBhY3RpdmVFbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsLiR0b3VjaGFibGUkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB6b29tYWJsZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHpvb21lciA9IG5ldyBab29tKGVsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9LHpzaXphYmxlOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgenNpemUgPSBuZXcgWnNpemUoZWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH0sZHJhZ2dhYmxlOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHJhZyA9IG5ldyBEcmFnKGVsKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxubGV0IGZpbmdlciA9IGZpbmdlcnMuZmluZ2VyOyIsIlxyXG5uYW1lc3BhY2UgZmluZ2Vyc3tcclxuICAgIGNsYXNzIFJvdHtcclxuICAgICAgICBwcm90ZWN0ZWQgb3JpZ2luOmFueTtcclxuICAgICAgICBwcm90ZWN0ZWQgY210OmFueTtcclxuICAgICAgICBwcm90ZWN0ZWQgY2FjaGU6YW55O1xyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdHVzOmFueVtdO1xyXG5cclxuICAgICAgICB0YXJnZXQ6YW55O1xyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY2VudGVyOmFueTtcclxuICAgICAgICBwcm90ZWN0ZWQgb2Zmc2V0Om51bWJlcltdO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGVsOmFueSl7XHJcbiAgICAgICAgICAgIGlmICghZWwpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gZWw7XHJcbiAgICAgICAgICAgIGVsLiRyb3QkID0gdGhpcztcclxuICAgICAgICAgICAgbGV0IHBvcyA9IFtlbC5hc3R5bGUoW1wibGVmdFwiXSksIGVsLmFzdHlsZShbXCJ0b3BcIl0pXTtcclxuICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IHBvc1swXTtcclxuICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gcG9zWzFdO1xyXG4gICAgICAgICAgICBsZXQgcmMgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW4gPSB7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXI6W3JjLndpZHRoLzIsIHJjLmhlaWdodC8yXSwgXHJcbiAgICAgICAgICAgICAgICBhbmdsZTowLCBcclxuICAgICAgICAgICAgICAgIHNjYWxlOlsxLDFdLCBcclxuICAgICAgICAgICAgICAgIHBvczpbcGFyc2VGbG9hdChwb3NbMF0pLCBwYXJzZUZsb2F0KHBvc1sxXSldLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTpbcmMud2lkdGgsIHJjLmhlaWdodF1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5jbXQgPSB7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXI6W3JjLndpZHRoLzIsIHJjLmhlaWdodC8yXSwgXHJcbiAgICAgICAgICAgICAgICBhbmdsZTowLCBcclxuICAgICAgICAgICAgICAgIHNjYWxlOlsxLDFdLCBcclxuICAgICAgICAgICAgICAgIHBvczpbcGFyc2VGbG9hdChwb3NbMF0pLCBwYXJzZUZsb2F0KHBvc1sxXSldLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTpbcmMud2lkdGgsIHJjLmhlaWdodF1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5jYWNoZSA9IHtcclxuICAgICAgICAgICAgICAgIGNlbnRlcjpbcmMud2lkdGgvMiwgcmMuaGVpZ2h0LzJdLCBcclxuICAgICAgICAgICAgICAgIGFuZ2xlOjAsIFxyXG4gICAgICAgICAgICAgICAgc2NhbGU6WzEsMV0sIFxyXG4gICAgICAgICAgICAgICAgcG9zOltwYXJzZUZsb2F0KHBvc1swXSksIHBhcnNlRmxvYXQocG9zWzFdKV0sXHJcbiAgICAgICAgICAgICAgICBzaXplOltyYy53aWR0aCwgcmMuaGVpZ2h0XVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlci5zdHlsZS5sZWZ0ID0gJzUwJSc7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudGVyLnN0eWxlLnRvcCA9ICc1MCUnO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlci5zdHlsZS53aWR0aCA9ICcwcHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlci5zdHlsZS5oZWlnaHQgPSAnMHB4JztcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXIuc3R5bGUuYm9yZGVyID0gJ3NvbGlkIDBweCBibHVlJztcclxuXHJcbiAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKHRoaXMuY2VudGVyKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRPcmlnaW4odGhpcy5vcmlnaW4uY2VudGVyKTtcclxuICAgICAgICAgICAgZWwuc3R5bGUudHJhbnNmb3JtID0gXCJyb3RhdGUoMGRlZylcIjtcclxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdHVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByb3RhdGUoYXJnOmFueSwgdW5kZWY/OmFueSl7XHJcbiAgICAgICAgICAgIGlmICghYXJnKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgXHRcdFx0bGV0IGNhY2hlID0gdGhpcy5jYWNoZTtcclxuXHRcdFx0bGV0IG9yaWdpbiA9IHRoaXMuY210O1xyXG5cdFx0XHRsZXQgb2Zmc2V0ID0gdGhpcy5vZmZzZXQ7XHJcblx0XHRcdGxldCBhbmdsZSA9IGFyZy5hbmdsZSwgXHJcbiAgICAgICAgICAgICAgICBjZW50ZXIgPSBhcmcuY2VudGVyLCBcclxuICAgICAgICAgICAgICAgIHNjYWxlID0gYXJnLnNjYWxlLCBcclxuICAgICAgICAgICAgICAgIHBvcyA9IGFyZy5wb3MsIFxyXG4gICAgICAgICAgICAgICAgcmVzaXplID0gYXJnLnJlc2l6ZTtcclxuICAgICAgICAgICAgaWYgKCFvZmZzZXQpe1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gWzAsIDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjZW50ZXIgIT09IHVuZGVmKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucHVzaFN0YXR1cygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPcmlnaW4oY2VudGVyKTtcclxuICAgICAgICAgICAgICAgIGxldCBjc3RhdHVzID0gdGhpcy5wdXNoU3RhdHVzKCk7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGlzLmNvcnJlY3QoY3N0YXR1cywgb2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYW5nbGUgfHwgYW5nbGUgPT09IDApe1xyXG4gICAgICAgICAgICAgICAgY2FjaGUuYW5nbGUgPSBvcmlnaW4uYW5nbGUgKyBhbmdsZTtcclxuICAgICAgICAgICAgICAgIGNhY2hlLmFuZ2xlID0gY2FjaGUuYW5nbGUgJSAzNjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlc2l6ZSl7XHJcbiAgICAgICAgICAgICAgICBjYWNoZS5zaXplID0gW29yaWdpbi5zaXplWzBdICsgcmVzaXplWzBdLCBvcmlnaW4uc2l6ZVsxXSArIHJlc2l6ZVsxXV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FjaGUuc2l6ZVswXSA8IDEwKXtcclxuICAgICAgICAgICAgICAgICAgICBjYWNoZS5zaXplWzBdID0gMTA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FjaGUuc2l6ZVsxXSA8IDEwKXtcclxuICAgICAgICAgICAgICAgICAgICBjYWNoZS5zaXplWzFdID0gMTA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHNjYWxlKXtcclxuICAgICAgICAgICAgICAgIGlmICghKHNjYWxlIGluc3RhbmNlb2YgQXJyYXkpKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbiA9IHBhcnNlRmxvYXQoc2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlID0gW24sIG5dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FjaGUuc2NhbGUgPSBbb3JpZ2luLnNjYWxlWzBdICogc2NhbGVbMF0sIG9yaWdpbi5zY2FsZVsxXSAqIHNjYWxlWzFdXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocG9zKXtcclxuICAgICAgICAgICAgICAgIGNhY2hlLnBvcyA9IFtvcmlnaW4ucG9zWzBdICsgcG9zWzBdIC0gb2Zmc2V0WzBdLCBvcmlnaW4ucG9zWzFdICsgcG9zWzFdIC0gb2Zmc2V0WzFdXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWignICsgY2FjaGUuYW5nbGUgKyAnZGVnKSBzY2FsZSgnICsgY2FjaGUuc2NhbGVbMF0gKyAnLCcgKyBjYWNoZS5zY2FsZVsxXSArICcpJztcclxuXHRcdFx0dGhpcy50YXJnZXQuc3R5bGUubGVmdCA9IGNhY2hlLnBvc1swXSArICdweCc7XHJcblx0XHRcdHRoaXMudGFyZ2V0LnN0eWxlLnRvcCA9IGNhY2hlLnBvc1sxXSArICdweCc7XHJcbiAgICAgICAgICAgIGlmIChyZXNpemUpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUud2lkdGggPSBjYWNoZS5zaXplWzBdICsgJ3B4JztcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmhlaWdodCA9IGNhY2hlLnNpemVbMV0gKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXR1cygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBnZXRDZW50ZXIoKTpudW1iZXJbXXtcclxuICAgICAgICAgICAgbGV0IHJjID0gdGhpcy5jZW50ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBbcmMubGVmdCwgcmMudG9wXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHNldE9yaWdpbihwOm51bWJlcltdKTp2b2lke1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBwWzBdICsgXCJweCBcIiArIHBbMV0gKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBjb3JyZWN0KHN0YXR1czphbnksIHBvZmZzZXQ/Om51bWJlcltdKTpudW1iZXJbXXtcclxuICAgICAgICAgICAgaWYgKCFwb2Zmc2V0KXtcclxuICAgICAgICAgICAgICAgIHBvZmZzZXQgPSBbMCwgMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGQgPSBzdGF0dXMuZGVsdGE7XHJcbiAgICAgICAgICAgIGxldCB4ID0gcGFyc2VGbG9hdCh0aGlzLnRhcmdldC5hc3R5bGVbXCJsZWZ0XCJdKSAtIGQuY2VudGVyWzBdO1xyXG4gICAgICAgICAgICBsZXQgeSA9IHBhcnNlRmxvYXQodGhpcy50YXJnZXQuYXN0eWxlW1widG9wXCJdKSAtIGQuY2VudGVyWzFdO1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IFtwb2Zmc2V0WzBdICsgZC5jZW50ZXJbMF0sIHBvZmZzZXRbMV0gKyBkLmNlbnRlclsxXV07XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vZmZzZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBjb21taXRTdGF0dXMoKTp2b2lke1xyXG4gICAgICAgICAgICB0aGlzLmNtdCA9IHRoaXMuY2FjaGU7XHJcbiAgICAgICAgICAgIHRoaXMuY210LnBvcyA9IFtwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQpLCBwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LnN0eWxlLnRvcCldO1xyXG4gICAgICAgICAgICB0aGlzLmNtdC5zaXplID0gW3BhcnNlRmxvYXQodGhpcy50YXJnZXQuc3R5bGUud2lkdGgpLCBwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LnN0eWxlLmhlaWdodCldO1xyXG4gICAgICAgICAgICB0aGlzLmNhY2hlID0ge2FuZ2xlOjAsIHNjYWxlOlsxLDFdLCBwb3M6WzAsMF0sIHNpemU6WzAsMF19O1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IFswLCAwXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHB1c2hTdGF0dXMoKTp2b2lke1xyXG4gICAgICAgICAgICBsZXQgYyA9IHRoaXMuZ2V0Q2VudGVyKCk7XHJcbiAgICAgICAgICAgIGxldCBsID0gW3BhcnNlRmxvYXQodGhpcy50YXJnZXQuYXN0eWxlKFtcImxlZnRcIl0pKSxwYXJzZUZsb2F0KHRoaXMudGFyZ2V0LmFzdHlsZShbXCJ0b3BcIl0pKV07XHJcbiAgICAgICAgICAgIGxldCBzOmFueSA9IHtjZW50ZXI6W2NbMF0sIGNbMV1dLCBwb3M6bH07XHJcbiAgICAgICAgICAgIGxldCBxID0gdGhpcy5zdGF0dXM7XHJcbiAgICAgICAgICAgIGxldCBwID0gcS5sZW5ndGggPiAwP3FbcS5sZW5ndGggLSAxXSA6IHM7XHJcbiAgICAgICAgICAgIHMuZGVsdGEgPSB7IGNlbnRlcjpbcy5jZW50ZXJbMF0gLSBwLmNlbnRlclswXSwgcy5jZW50ZXJbMV0gLSBwLmNlbnRlclsxXV0sXHJcbiAgICAgICAgICAgICAgICBwb3M6IFtzLnBvc1swXSAtIHAucG9zWzBdLCBzLnBvc1sxXSAtIHAucG9zWzFdXX07XHJcbiAgICAgICAgICAgIHFbcS5sZW5ndGhdID0gcztcclxuICAgICAgICAgICAgaWYgKHEubGVuZ3RoID4gNil7XHJcbiAgICAgICAgICAgICAgICBxLnNwbGljZSgwLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gUm90YXRvcihlbDphbnkpOmFueXtcclxuICAgICAgICBsZXQgciA9IGVsLiRyb3QkIHx8IG5ldyBSb3QoZWwpO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCJpbnRlcmZhY2UgU3RyaW5ne1xuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XG5cdGZvcm1hdCguLi5yZXN0QXJnczphbnlbXSk6c3RyaW5nO1xufVxuXG5TdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGggPSBmdW5jdGlvbihzdHI6c3RyaW5nKTpib29sZWFue1xuXHRyZXR1cm4gdGhpcy5pbmRleE9mKHN0cik9PTA7XG59XG5TdHJpbmcucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdHZhciBzID0gdGhpcztcblx0aWYgKCFhcmdzIHx8IGFyZ3MubGVuZ3RoIDwgMSkge1xuXHRcdHJldHVybiBzO1xuXHR9XG5cdHZhciByID0gcztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHJlZyA9IG5ldyBSZWdFeHAoJ1xcXFx7JyArIGkgKyAnXFxcXH0nKTtcblx0XHRyID0gci5yZXBsYWNlKHJlZywgYXJnc1tpXSk7XG5cdH1cblx0cmV0dXJuIHI7XG59OyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9mb3VuZGF0aW9uL3N0cmluZy50c1wiIC8+XG5cbkVsZW1lbnQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKHZhbDphbnkpOnZvaWR7XG4gICAgZnVuY3Rpb24gYWRkKHQ6YW55LCB2OmFueSk6dm9pZHtcblx0XHRpZiAodCl7XG5cdFx0XHRpZiAodHlwZW9mICh2KSA9PSAnb2JqZWN0Jyl7XG5cdFx0XHRcdGxldCB0bXAgPSB3by51c2Uodi50YXJnZXQpO1xuICAgICAgICAgICAgICAgIGlmICh0bXApe1xuICAgICAgICAgICAgICAgICAgICB2LnRhcmdldCA9IHRtcDtcbiAgICAgICAgICAgICAgICB9XG5cdFx0XHRcdGlmICghdi5tb2RlIHx8ICh2Lm1vZGUgPT0gXCJwcmVwZW5kXCIgJiYgdC5jaGlsZE5vZGVzLmxlbmd0aCA8IDEpKXtcblx0XHRcdFx0XHR2Lm1vZGUgPSBcImFwcGVuZFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2Lm1vZGUgPT0gXCJyZXBsYWNlXCIpe1xuXHRcdFx0XHRcdHQuaW5uZXJIVE1MID0gXCJcIjtcblx0XHRcdFx0XHR2Lm1vZGUgPSBcImFwcGVuZFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2Lm1vZGUgPT0gXCJwcmVwZW5kXCIpe1xuXHRcdFx0XHRcdHQuaW5zZXJ0QmVmb3JlKHYudGFyZ2V0LCB0LmNoaWxkTm9kZXNbMF0pO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHR0LmFwcGVuZENoaWxkKHYudGFyZ2V0KTtcblx0XHRcdFx0fSAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblx0XHRcdH1lbHNle1xuXHRcdFx0XHQkKHQpLnRleHQodik7XG5cdFx0XHR9XG5cdFx0fVxuXG4gICAgfVxuICAgIGlmICh3by51c2FibGUodmFsKSl7XG4gICAgICAgIGFkZCh0aGlzLCB2YWwpO1xuICAgIH1cblx0Zm9yKGxldCBpIGluIHZhbCl7XG5cdFx0bGV0IHYgPSB2YWxbaV07XG4gICAgXHRsZXQgdCA9IHRoaXNbXCIkXCIgKyBpXTtcbiAgICAgICAgYWRkKHQsIHYpO1xuXHR9ICAgICAgICAgICAgXG59O1xuXG5uYW1lc3BhY2Ugd297XG4gICAgLy8vIENvbnRhaW5zIGNyZWF0b3IgaW5zdGFuY2Ugb2JqZWN0XG4gICAgZXhwb3J0IGxldCBDcmVhdG9yczpDcmVhdG9yW10gPSBbXTtcblxuICAgIGZ1bmN0aW9uIGdldChzZWxlY3RvcjphbnkpOmFueXtcbiAgICAgICAgbGV0IHJsdDphbnkgPSBbXTtcbiAgICAgICAgaWYgKHNlbGVjdG9yKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBybHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmx0O1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBDdXJzb3J7XG4gICAgICAgIHBhcmVudDphbnk7XG4gICAgICAgIGJvcmRlcjphbnk7XG4gICAgICAgIHJvb3Q6YW55O1xuICAgICAgICBjdXJ0OmFueTtcbiAgICB9XG5cbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgQ3JlYXRvcntcbiAgICAgICAgaWQ6c3RyaW5nO1xuICAgICAgICBnZXQgSWQoKTpzdHJpbmd7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICAgICAgfVxuICAgICAgICBDcmVhdGUoanNvbjphbnksIGNzPzpDdXJzb3IpOmFueXtcbiAgICAgICAgICAgIGlmICghanNvbil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbyA9IHRoaXMuY3JlYXRlKGpzb24pO1xuICAgICAgICAgICAgaWYgKCFjcyl7XG4gICAgICAgICAgICAgICAgY3MgPSBuZXcgQ3Vyc29yKCk7XG4gICAgICAgICAgICAgICAgY3Mucm9vdCA9IG87XG4gICAgICAgICAgICAgICAgY3MucGFyZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBjcy5ib3JkZXIgPSBvO1xuICAgICAgICAgICAgICAgIGNzLmN1cnQgPSBvO1xuICAgICAgICAgICAgICAgIG8uY3Vyc29yID0gY3M7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgbmNzID0gbmV3IEN1cnNvcigpO1xuICAgICAgICAgICAgICAgIG5jcy5yb290ID0gY3Mucm9vdDtcbiAgICAgICAgICAgICAgICBuY3MucGFyZW50ID0gY3MuY3VydDtcbiAgICAgICAgICAgICAgICBuY3MuYm9yZGVyID0gY3MuYm9yZGVyO1xuICAgICAgICAgICAgICAgIG5jcy5jdXJ0ID0gbztcbiAgICAgICAgICAgICAgICBvLmN1cnNvciA9IG5jcztcbiAgICAgICAgICAgICAgICBjcyA9IG5jcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqc29uLmFsaWFzKXtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUuZGlyKGpzb24uYWxpYXMpO1xuICAgICAgICAgICAgICAgIGxldCBuID0ganNvbi5hbGlhcztcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5hbGlhcy5zdGFydHNXaXRoKFwiJFwiKSl7XG4gICAgICAgICAgICAgICAgICAgIG4gPSBqc29uLmFsaWFzLnN1YnN0cigxLCBqc29uLmFsaWFzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcy5ib3JkZXJbXCIkXCIgKyBuXSA9IG87XG4gICAgICAgICAgICAgICAgaWYgKGpzb24uYWxpYXMuc3RhcnRzV2l0aChcIiRcIikpe1xuICAgICAgICAgICAgICAgICAgICBjcy5ib3JkZXIgPSBvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVsZXRlIGpzb25bdGhpcy5JZF07XG4gICAgICAgICAgICB0aGlzLmV4dGVuZChvLCBqc29uKTtcbiAgICAgICAgICAgIGlmIChqc29uLm1hZGUpe1xuICAgICAgICAgICAgICAgIGpzb24ubWFkZS5jYWxsKG8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgby4kcm9vdCA9IGNzLnJvb3Q7XG4gICAgICAgICAgICBvLiRib3JkZXIgPSBjcy5ib3JkZXI7XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgY3JlYXRlKGpzb246YW55KTphbnk7XG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lkO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBhcHBlbmQoZWw6YW55LCBjaGlsZDphbnkpe1xuICAgICAgICBpZiAoZWwuYXBwZW5kICYmIHR5cGVvZihlbC5hcHBlbmQpID09ICdmdW5jdGlvbicpe1xuICAgICAgICAgICAgZWwuYXBwZW5kKGNoaWxkKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBlbC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gdXNhYmxlKGpzb246YW55KTpib29sZWFue1xuICAgICAgICBmb3IodmFyIGkgb2YgQ3JlYXRvcnMpe1xuICAgICAgICAgICAgaWYgKGpzb25baS5JZF0pe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gdXNlKGpzb246YW55LCBjcz86Q3Vyc29yKTphbnl7XG4gICAgICAgIGxldCBybHQ6YW55ID0gbnVsbDtcbiAgICAgICAgaWYgKCFqc29uIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcbiAgICAgICAgICAgIHJldHVybiBybHQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvbnRhaW5lcjphbnkgPSBudWxsO1xuICAgICAgICBpZiAoanNvbi4kY29udGFpbmVyJCl7XG4gICAgICAgICAgICBjb250YWluZXIgPSBqc29uLiRjb250YWluZXIkO1xuICAgICAgICAgICAgZGVsZXRlIGpzb24uJGNvbnRhaW5lciQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiAoanNvbikgPT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgcmx0ID0gZ2V0KGpzb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yKHZhciBpIG9mIENyZWF0b3JzKXtcbiAgICAgICAgICAgIGlmIChqc29uW2kuSWRdKXtcbiAgICAgICAgICAgICAgICBybHQgPSBpLkNyZWF0ZShqc29uLCBjcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnRhaW5lcil7XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmx0O1xuICAgIH1cblxuXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdXNlLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIGV4cG9ydCBjbGFzcyBEb21DcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmlkID0gXCJ0YWdcIjtcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0YWcgPSBqc29uW3RoaXMuaWRdO1xuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XG4gICAgICAgICAgICBpZiAodGFnID09ICcjdGV4dCcpe1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGFnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7IFxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgICAgIGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWR7XG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgZG9tZXh0ZW5kKG8sIGpzb24pO1xuICAgICAgICAgICAgfWVsc2UgaWYgKGpzb24uJCAmJiBvIGluc3RhbmNlb2YgTm9kZSl7XG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xuICAgICAgICAgICAgICAgIG8uZXh0ZW5kKGpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdXNlLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIGV4cG9ydCBjbGFzcyBTdmdDcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmlkID0gXCJzZ1wiO1xuICAgICAgICB9XG4gICAgICAgIGNyZWF0ZShqc29uOmFueSk6Tm9kZXtcbiAgICAgICAgICAgIGlmIChqc29uID09IG51bGwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHRhZyA9IGpzb25bdGhpcy5pZF07XG4gICAgICAgICAgICBsZXQgZWw6Tm9kZTtcbiAgICAgICAgICAgIGlmICh0YWcgPT0gXCJzdmdcIil7XG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCB0YWcpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCB0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgICAgIGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWR7XG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvIGluc3RhbmNlb2YgU1ZHRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgc3ZnZXh0ZW5kKG8sIGpzb24pO1xuICAgICAgICAgICAgfWVsc2UgaWYgKGpzb24uJCAmJiBvIGluc3RhbmNlb2YgTm9kZSl7XG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xuICAgICAgICAgICAgICAgIG8uZXh0ZW5kKGpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3ZnZXh0ZW5kKGVsOmFueSwganNvbjphbnkpe1xuICAgICAgICBsZXQgY3MgPSBlbC5jdXJzb3I7XG4gICAgICAgIGZvcihsZXQgaSBpbiBqc29uKXtcbiAgICAgICAgICAgIGlmIChpLnN0YXJ0c1dpdGgoXCIkJFwiKSl7XG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGVsW2ldO1xuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIHRhcmdldDtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2dHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodnR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnZXh0ZW5kKHRhcmdldCwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcIiRcIil7XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICBpZiAoanNvbltpXSBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBqIG9mIGpzb25baV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGosIGNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2VsLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNlIGlmICh0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGpzb25baV0sIGNzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VsLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcbiAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsW2ldICYmIHR5cGVvZihlbFtpXSkgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZXh0ZW5kKGVsW2ldLCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhudWxsLCBpLCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3VzZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9kb21jcmVhdG9yLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIGV4cG9ydCBsZXQgV2lkZ2V0czphbnkgPSB7fTtcblxuICAgIGV4cG9ydCBjbGFzcyBVaUNyZWF0b3IgZXh0ZW5kcyBDcmVhdG9ye1xuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBcInVpXCI7XG4gICAgICAgIH1cbiAgICAgICAgY3JlYXRlKGpzb246YW55KTpOb2Rle1xuICAgICAgICAgICAgaWYgKGpzb24gPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgd2cgPSBqc29uW3RoaXMuaWRdO1xuICAgICAgICAgICAgaWYgKCFXaWRnZXRzW3dnXSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBlbDpOb2RlID0gdXNlKFdpZGdldHNbd2ddKCkpO1xuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgICAgIGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWR7XG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xuICAgICAgICAgICAgICAgIGRvbWFwcGx5KG8sIGpzb24pO1xuICAgICAgICAgICAgfWVsc2UgaWYgKGpzb24uJCAmJiBvIGluc3RhbmNlb2YgTm9kZSl7XG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xuICAgICAgICAgICAgICAgIG8uZXh0ZW5kKGpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBpc3dpZGdldChqc29uOmFueSk6Ym9vbGVhbntcbiAgICAgICAgaWYgKCFqc29uIHx8ICFqc29uLnVpKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihsZXQgaSBpbiBXaWRnZXRzKXtcbiAgICAgICAgICAgIGlmIChpID09IGpzb24udWkpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvdXNlLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvZG9tY3JlYXRvci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWlsZGVyL3N2Z2NyZWF0b3IudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxuXG53by5DcmVhdG9ycy5hZGQobmV3IHdvLkRvbUNyZWF0b3IoKSk7XG53by5DcmVhdG9ycy5hZGQobmV3IHdvLlN2Z0NyZWF0b3IoKSk7XG53by5DcmVhdG9ycy5hZGQobmV3IHdvLlVpQ3JlYXRvcigpKTtcbiIsIm5hbWVzcGFjZSB3b3tcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBvYmpleHRlbmQobzphbnksIGpzb246YW55KXtcclxuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XHJcbiAgICAgICAgICAgIGlmIChvW2ldICYmIHR5cGVvZihvW2ldKSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICBvYmpleHRlbmQob1tpXSwganNvbltpXSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgb1tpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidXNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm9iamV4dGVuZC50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2Ugd297XHJcbiAgICBmdW5jdGlvbiBhcHBseWF0dHIoZWw6YW55LCBpOnN0cmluZywganNvbjphbnkpe1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSBlbFtpXTtcclxuICAgICAgICBpZiAodGFyZ2V0KXtcclxuICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdGFyZ2V0O1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICAgICAgICAgIGlmICh2dHlwZSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9tYXBwbHkodGFyZ2V0LCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBseWNoaWxkKGVsOmFueSwganNvbjphbnksIGk6c3RyaW5nLCBjczphbnkpe1xyXG4gICAgICAgIGxldCB0eXBlID0gdHlwZW9mIGpzb25baV07XHJcbiAgICAgICAgbGV0IGppID0ganNvbltpXTtcclxuICAgICAgICBpZiAodHlwZSA9PSAnb2JqZWN0JyAmJiAhKGppIGluc3RhbmNlb2YgQXJyYXkpKXtcclxuICAgICAgICAgICAgamkgPSBbamldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoamkgaW5zdGFuY2VvZiBBcnJheSl7XHJcbiAgICAgICAgICAgIGxldCBub2RlcyA9IGVsLmNoaWxkTm9kZXM7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGo8amkubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBqaVtqXTtcclxuICAgICAgICAgICAgICAgIGlmICh3by5pc3dpZGdldChpdGVtKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsLnVzZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnVzZShpdGVtLCBjcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShpdGVtLCBjcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGogPCBub2Rlcy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21hcHBseShub2Rlc1tqXSwgaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbC51c2Upe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwudXNlKGl0ZW0sIGNzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoaXRlbSwgY3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb21hcHBseShlbDphbnksIGpzb246YW55LCBiYWc/OmFueSl7XHJcbiAgICAgICAgbGV0IGNzID0gZWwuY3Vyc29yO1xyXG4gICAgICAgIGZvcihsZXQgaSBpbiBqc29uKXtcclxuICAgICAgICAgICAgaWYgKGkuc3RhcnRzV2l0aChcIiQkXCIpKXtcclxuICAgICAgICAgICAgICAgIGFwcGx5YXR0cihlbCwgaSwganNvbik7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwiJFwiKXtcclxuICAgICAgICAgICAgICAgIGFwcGx5Y2hpbGQoZWwsIGpzb24sIGksIGNzKTtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKGkuc3RhcnRzV2l0aChcIiRcIikpe1xyXG4gICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcInN0eWxlXCIpe1xyXG4gICAgICAgICAgICAgICAgb2JqZXh0ZW5kKGVsW2ldLCBqc29uW2ldKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKXtcclxuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxbaV0gJiYgdHlwZW9mKGVsW2ldKSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShpLCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidXNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm9iamV4dGVuZC50c1wiIC8+XHJcblxyXG5uYW1lc3BhY2Ugd297XHJcbiAgICBmdW5jdGlvbiBhcHBseWF0dHIoZWw6YW55LCBpOnN0cmluZywganNvbjphbnkpe1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSBlbFtpXTtcclxuICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB0YXJnZXQ7XHJcbiAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICAgICAgaWYgKHZ0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgIGRvbWV4dGVuZCh0YXJnZXQsIGpzb25baV0pO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGx5Y2hpbGQoZWw6YW55LCBqc29uOmFueSwgaTpzdHJpbmcsIGNzOmFueSl7XHJcbiAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICBpZiAoanNvbltpXSBpbnN0YW5jZW9mIEFycmF5KXtcclxuICAgICAgICAgICAgZm9yKGxldCBqIG9mIGpzb25baV0pe1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGosIGNzKTtcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNlIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgbGV0IGNoaWxkID0gdXNlKGpzb25baV0sIGNzKTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0ganNvbltpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb21leHRlbmQoZWw6YW55LCBqc29uOmFueSwgYmFnPzphbnkpe1xyXG4gICAgICAgIGxldCBjcyA9IGVsLmN1cnNvcjtcclxuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XHJcbiAgICAgICAgICAgIGlmIChpLnN0YXJ0c1dpdGgoXCIkJFwiKSl7XHJcbiAgICAgICAgICAgICAgICBhcHBseWF0dHIoZWwsIGksIGpzb24pO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcIiRcIil7XHJcbiAgICAgICAgICAgICAgICBhcHBseWNoaWxkKGVsLCBqc29uLCBpLCBjcyk7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcclxuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKXtcclxuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxbaV0gJiYgdHlwZW9mKGVsW2ldKSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShpLCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZGVmaW5pdGlvbnMudHNcIiAvPlxuY2xhc3MgTW9iaWxlRGV2aWNle1xuXHRzdGF0aWMgZ2V0IEFuZHJvaWQgKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkL2kpO1xuXHRcdGlmIChyKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gciE9IG51bGwgJiYgci5sZW5ndGg+MDtcblx0fVxuXHRzdGF0aWMgZ2V0IEJsYWNrQmVycnkoKTpib29sZWFuIHtcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0JsYWNrQmVycnkvaSk7XG5cdFx0aWYgKHIpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XG5cdFx0fVxuXHRcdHJldHVybiByIT1udWxsICYmIHIubGVuZ3RoID4gMDtcblx0fVxuXHRzdGF0aWMgZ2V0IGlPUygpOmJvb2xlYW4ge1xuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVBob25lfGlQYWR8aVBvZC9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIgIT0gbnVsbCAmJiByLmxlbmd0aCA+IDA7XG5cdH1cblx0c3RhdGljIGdldCBPcGVyYSgpOmJvb2xlYW4ge1xuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvT3BlcmEgTWluaS9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIgIT0gbnVsbCAmJiByLmxlbmd0aCA+IDA7XG5cdH1cblx0c3RhdGljIGdldCBXaW5kb3dzKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9JRU1vYmlsZS9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIhPSBudWxsICYmIHIubGVuZ3RoID4wO1xuXHR9XG5cdHN0YXRpYyBnZXQgYW55KCk6Ym9vbGVhbiB7XG5cdFx0cmV0dXJuIChNb2JpbGVEZXZpY2UuQW5kcm9pZCB8fCBNb2JpbGVEZXZpY2UuQmxhY2tCZXJyeSB8fCBNb2JpbGVEZXZpY2UuaU9TIHx8IE1vYmlsZURldmljZS5PcGVyYSB8fCBNb2JpbGVEZXZpY2UuV2luZG93cyk7XG5cdH1cbn1cblxuY2xhc3MgQnJvd3Nlcntcblx0Ly8gT3BlcmEgOC4wK1xuXHRzdGF0aWMgZ2V0IGlzT3BlcmEoKTpib29sZWFue1xuXHRcdHJldHVybiAoISF3aW5kb3cub3ByICYmICEhd2luZG93Lm9wci5hZGRvbnMpIHx8ICEhd2luZG93Lm9wZXJhIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIE9QUi8nKSA+PSAwO1xuXHR9XG5cdFxuXHQvLyBGaXJlZm94IDEuMCtcblx0c3RhdGljIGdldCBpc0ZpcmVmb3goKTpib29sZWFue1xuXHRcdHJldHVybiB0eXBlb2Ygd2luZG93Lkluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJztcblx0fVxuXHQvLyBBdCBsZWFzdCBTYWZhcmkgMys6IFwiW29iamVjdCBIVE1MRWxlbWVudENvbnN0cnVjdG9yXVwiXG5cdHN0YXRpYyBnZXQgaXNTYWZhcmkoKTpib29sZWFue1xuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoSFRNTEVsZW1lbnQpLmluZGV4T2YoJ0NvbnN0cnVjdG9yJykgPiAwO1xuXHR9IFxuXHQvLyBJbnRlcm5ldCBFeHBsb3JlciA2LTExXG5cdHN0YXRpYyBnZXQgaXNJRSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIC8qQGNjX29uIUAqL2ZhbHNlIHx8ICEhZG9jdW1lbnQuZG9jdW1lbnRNb2RlO1xuXHR9XG5cdC8vIEVkZ2UgMjArXG5cdHN0YXRpYyBnZXQgaXNFZGdlKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gIUJyb3dzZXIuaXNJRSAmJiAhIXdpbmRvdy5TdHlsZU1lZGlhO1xuXHR9XG5cdC8vIENocm9tZSAxK1xuXHRzdGF0aWMgZ2V0IGlzQ2hyb21lKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gISF3aW5kb3cuY2hyb21lICYmICEhd2luZG93LmNocm9tZS53ZWJzdG9yZTtcblx0fVxuXHQvLyBCbGluayBlbmdpbmUgZGV0ZWN0aW9uXG5cdHN0YXRpYyBnZXQgaXNCbGluaygpOmJvb2xlYW57XG5cdFx0cmV0dXJuIChCcm93c2VyLmlzQ2hyb21lIHx8IEJyb3dzZXIuaXNPcGVyYSkgJiYgISF3aW5kb3cuQ1NTO1xuXHR9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy50c1wiIC8+XG5cbkVsZW1lbnQucHJvdG90eXBlLmFzdHlsZSA9IGZ1bmN0aW9uIGFjdHVhbFN0eWxlKHByb3BzOnN0cmluZ1tdKSB7XG5cdGxldCBlbDpFbGVtZW50ID0gdGhpcztcblx0bGV0IGNvbXBTdHlsZTpDU1NTdHlsZURlY2xhcmF0aW9uID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpO1xuXHRmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuXHRcdGxldCBzdHlsZTpzdHJpbmcgPSBjb21wU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wc1tpXSk7XG5cdFx0aWYgKHN0eWxlICE9IG51bGwpIHtcblx0XHRcdHJldHVybiBzdHlsZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5uYW1lc3BhY2Ugd297XG5cdGNsYXNzIERlc3Ryb3llcntcblx0XHRkaXNwb3Npbmc6Ym9vbGVhbjtcblx0XHRkZXN0cm95aW5nOmJvb2xlYW47XG5cdFx0c3RhdGljIGNvbnRhaW5lcjpIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0c3RhdGljIGRlc3Ryb3kodGFyZ2V0OkVsZW1lbnQpe1xuXHRcdFx0aWYgKCF0YXJnZXQuZGVzdHJveVN0YXR1cyl7XG5cdFx0XHRcdHRhcmdldC5kZXN0cm95U3RhdHVzID0gbmV3IERlc3Ryb3llcigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRhcmdldC5kaXNwb3NlICYmICF0YXJnZXQuZGVzdHJveVN0YXR1cy5kaXNwb3Npbmcpe1xuXHRcdFx0XHR0YXJnZXQuZGVzdHJveVN0YXR1cy5kaXNwb3NpbmcgPSB0cnVlO1xuXHRcdFx0XHR0YXJnZXQuZGlzcG9zZSgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0YXJnZXQuZGVzdHJveVN0YXR1cy5kZXN0cm95aW5nKXtcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGVzdHJveWluZyA9IHRydWU7XG5cdFx0XHRcdERlc3Ryb3llci5jb250YWluZXIuYXBwZW5kQ2hpbGQodGFyZ2V0KTtcblx0XHRcdFx0Zm9yKGxldCBpIGluIHRhcmdldCl7XG5cdFx0XHRcdFx0aWYgKGkuaW5kZXhPZignJCcpID09IDApe1xuXHRcdFx0XHRcdFx0bGV0IHRtcDphbnkgPSB0YXJnZXRbaV07XG5cdFx0XHRcdFx0XHRpZiAodG1wIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRbaV0gPSBudWxsO1xuXHRcdFx0XHRcdFx0XHR0bXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB0YXJnZXRbaV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdERlc3Ryb3llci5jb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3kodGFyZ2V0OmFueSk6dm9pZHtcblx0XHRpZiAodGFyZ2V0Lmxlbmd0aCA+IDAgfHwgdGFyZ2V0IGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdFx0Zm9yKGxldCBpIG9mIHRhcmdldCl7XG5cdFx0XHRcdERlc3Ryb3llci5kZXN0cm95KGkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCl7XG5cdFx0XHRcdERlc3Ryb3llci5kZXN0cm95KHRhcmdldCk7XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGNlbnRlclNjcmVlbih0YXJnZXQ6YW55KXtcblx0XHRsZXQgcmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHR0YXJnZXQuc3R5bGUucG9zaXRpb24gPSBcImZpeGVkXCI7XG5cdFx0dGFyZ2V0LnN0eWxlLmxlZnQgPSBcIjUwJVwiO1xuXHRcdHRhcmdldC5zdHlsZS50b3AgPSBcIjUwJVwiO1xuXHRcdHRhcmdldC5zdHlsZS5tYXJnaW5Ub3AgPSAtcmVjdC5oZWlnaHQgLyAyICsgXCJweFwiO1xuXHRcdHRhcmdldC5zdHlsZS5tYXJnaW5MZWZ0ID0gLXJlY3Qud2lkdGggLyAyICsgXCJweFwiO1xuXHR9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2ZvdW5kYXRpb24vZWxlbWVudHMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIFdpZGdldHMuY2FyZCA9IGZ1bmN0aW9uKCk6YW55e1xuICAgICAgICByZXR1cm4gIHtcbiAgICAgICAgICAgIHRhZzpcImRpdlwiLFxuICAgICAgICAgICAgY2xhc3M6XCJjYXJkXCIsXG4gICAgICAgICAgICB1c2U6ZnVuY3Rpb24oanNvbjphbnkpe1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHdvLnVzZShqc29uKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kYm9keSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGJvZHkuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJDpbXG4gICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcInRpdGxlIG5vc2VsZWN0XCIsICQ6W1xuICAgICAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwidHh0XCIsIGFsaWFzOlwidGl0bGVcIn0sXG4gICAgICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJjdHJsc1wiLCAkOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJ3YnRuXCIsIG9uY2xpY2s6IGZ1bmN0aW9uKGV2ZW50OmFueSl7d28uZGVzdHJveSh0aGlzLiRib3JkZXIpO30sICQ6XCJYXCJ9XG4gICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgXX0sXG4gICAgICAgICAgICAgICAgeyB0YWc6XCJkaXZcIiwgY2xhc3M6XCJib2R5XCIsIGFsaWFzOlwiYm9keVwiIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2ZvdW5kYXRpb24vZWxlbWVudHMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIFdpZGdldHMuY292ZXIgPSBmdW5jdGlvbigpOmFueXtcbiAgICAgICAgcmV0dXJue1xuICAgICAgICAgICAgdGFnOlwiZGl2XCIsXG4gICAgICAgICAgICBjbGFzczpcImNvdmVyXCIsXG4gICAgICAgICAgICBzdHlsZTp7ZGlzcGxheTonbm9uZSd9LFxuICAgICAgICAgICAgc2hvdzpmdW5jdGlvbihjYWxsYmFjazphbnkpOnZvaWR7XG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJGNoaWxkKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kY2hpbGQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0saGlkZTpmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRjaGlsZCl7XG4gICAgICAgICAgICAgICAgICAgIHdvLmRlc3Ryb3kodGhpcy4kY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy4kY2hpbGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbmhpZGUpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sbWFkZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBsZXQgY3YgPSAoZG9jdW1lbnQuYm9keSBhcyBhbnkpLiRnY3YkO1xuICAgICAgICAgICAgICAgIGlmIChjdil7XG4gICAgICAgICAgICAgICAgICAgIHdvLmRlc3Ryb3koY3YpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMpO1xuICAgICAgICAgICAgICAgIChkb2N1bWVudC5ib2R5IGFzIGFueSkuJGdjdiQgPSB0aGlzO1xuICAgICAgICAgICAgfSxvbmNsaWNrOmZ1bmN0aW9uKGV2ZW50OmFueSl7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJCR0b3VjaGNsb3NlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxhcHBlbmQ6ZnVuY3Rpb24oY2hpbGQ6YW55KXtcbiAgICAgICAgICAgICAgICB0aGlzLiRjaGlsZCA9IGNoaWxkO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9OyBcbiAgICB9IFxuICAgIGV4cG9ydCBmdW5jdGlvbiBjb3Zlcihqc29uOmFueSk6YW55e1xuICAgICAgICBsZXQgY3YgPSB3by51c2Uoe1xuICAgICAgICAgICAgdWk6J2NvdmVyJyxcbiAgICAgICAgICAgICQkdG91Y2hjbG9zZTp0cnVlLFxuICAgICAgICAgICAgJDpqc29uXG4gICAgICAgIH0pO1xuICAgICAgICBjdi5zaG93KGZ1bmN0aW9uKGVsOmFueSl7XG4gICAgICAgICAgICB3by5jZW50ZXJTY3JlZW4oZWwuJGJveCB8fCBlbC4kY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgICAgY3Yub25oaWRlID0ganNvbi5vbmhpZGU7XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9mb3VuZGF0aW9uL2VsZW1lbnRzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9idWlsZGVyL3VpY3JlYXRvci50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBXaWRnZXRzLmRyb3Bkb3duID0gZnVuY3Rpb24oKTphbnl7XG4gICAgICAgIHJldHVybiAge1xuICAgICAgICAgICAgdGFnOlwiZGl2XCIsXG4gICAgICAgICAgICBjbGFzczpcImRyb3Bkb3duXCIsXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbDphbnkpOnZvaWR7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpIGluIHZhbCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2ID0gdmFsW2ldO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdCA9IHRoaXNbXCIkXCIgKyBpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAodikgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdi5tb2RlIHx8ICh2Lm1vZGUgPT0gXCJwcmVwZW5kXCIgJiYgdC5jaGlsZE5vZGVzLmxlbmd0aCA8IDEpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdi5tb2RlID0gXCJhcHBlbmRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYubW9kZSA9PSBcInJlcGxhY2VcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdi5tb2RlID0gXCJhcHBlbmRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYubW9kZSA9PSBcInByZXBlbmRcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuaW5zZXJ0QmVmb3JlKHYudGFyZ2V0LCB0LmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmFwcGVuZENoaWxkKHYudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0KS50ZXh0KHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICQ6W1xuICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJ0aXRsZSBub3NlbGVjdFwiLCAkOltcbiAgICAgICAgICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcInR4dFwiLCBhbGlhczpcInRpdGxlXCJ9LFxuICAgICAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwiY3RybHNcIiwgJDpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwid2J0blwiLCBvbmNsaWNrOiBmdW5jdGlvbihldmVudDphbnkpe3dvLmRlc3Ryb3kodGhpcy4kYm9yZGVyKTt9LCAkOlwiWFwifVxuICAgICAgICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgICAgIF19LFxuICAgICAgICAgICAgICAgIHt0YWc6XCJkaXZcIiwgY2xhc3M6XCJib2R5XCIsIGFsaWFzOlwiYm9keVwifVxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZm91bmRhdGlvbi9lbGVtZW50cy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxuXG5uYW1lc3BhY2Ugd297XG4gICAgV2lkZ2V0cy5sb2FkaW5nID0gZnVuY3Rpb24oKTphbnl7XG4gICAgICAgIHJldHVybntcbiAgICAgICAgICAgIHRhZzpcImRpdlwiLFxuICAgICAgICAgICAgY2xhc3M6XCJsb2FkaW5nXCIsXG4gICAgICAgICAgICBtYWRlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCBwMSA9IHdvLnVzZSh7dWk6XCJhcmNcIn0pO1xuICAgICAgICAgICAgICAgIHAxLnNldEF0dHJpYnV0ZU5TKG51bGwsIFwiY2xhc3NcIiwgXCJhcmMgcDFcIik7XG4gICAgICAgICAgICAgICAgcDEudXBkYXRlKFsxNiwgNDhdLCAxNiwgMjcwKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRzYm94LmFwcGVuZENoaWxkKHAxKTsgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICBsZXQgcDIgPSB3by51c2Uoe3VpOlwiYXJjXCJ9KTtcbiAgICAgICAgICAgICAgICBwMi5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcImNsYXNzXCIsIFwiYXJjIHAxXCIpO1xuICAgICAgICAgICAgICAgIHAyLnVwZGF0ZShbMTYsIDQ4XSwgMTYsIDI3MCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2JveC5hcHBlbmRDaGlsZChwMik7XG5cbiAgICAgICAgICAgICAgICAvLyRlbGVtZW50LnZlbG9jaXR5KHsgb3BhY2l0eTogMSB9LCB7IGR1cmF0aW9uOiAxMDAwIH0pO1xuICAgICAgICAgICAgICAgIHAxLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IFwiMzJweCAzMnB4XCI7XG4gICAgICAgICAgICAgICAgcDIuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gXCI1MCUgNTAlXCI7XG5cbiAgICAgICAgICAgICAgICBsZXQgdDEgPSAyMDAwLCB0Mj0xNDAwO1xuICAgICAgICAgICAgICAgICgkKHAxKSBhcyBhbnkpLnZlbG9jaXR5KHtyb3RhdGVaOlwiLT0zNjBkZWdcIn0sIHtkdXJhdGlvbjp0MSwgZWFzaW5nOlwibGluZWFyXCJ9KTtcbiAgICAgICAgICAgICAgICB0aGlzLiRoYW5kbGUxID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAoJChwMSkgYXMgYW55KS52ZWxvY2l0eSh7cm90YXRlWjpcIi09MzYwZGVnXCJ9LCB7ZHVyYXRpb246dDEsIGVhc2luZzpcImxpbmVhclwifSk7XG4gICAgICAgICAgICAgICAgfSwgdDEpO1xuICAgICAgICAgICAgICAgICgkKHAyKSBhcyBhbnkpLnZlbG9jaXR5KHtyb3RhdGVaOlwiKz0zNjBkZWdcIn0sIHtkdXJhdGlvbjp0MiwgZWFzaW5nOlwibGluZWFyXCIsIGxvb3A6dHJ1ZX0pO1xuICAgICAgICAgICAgfSwkOntcbiAgICAgICAgICAgICAgICBzZzpcInN2Z1wiLFxuICAgICAgICAgICAgICAgIGFsaWFzOlwic2JveFwiLFxuICAgICAgICAgICAgICAgIHN0eWxlOntcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6NjQsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDo2NFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTsgXG4gICAgfTsgXG4gICAgV2lkZ2V0cy5hcmMgPSBmdW5jdGlvbigpOmFueXtcbiAgICAgICAgcmV0dXJue1xuICAgICAgICAgICAgc2c6XCJwYXRoXCIsXG4gICAgICAgICAgICB1cGRhdGU6ZnVuY3Rpb24oY2VudGVyOm51bWJlcltdLCByYWRpdXM6bnVtYmVyLCBhbmdsZTpudW1iZXIpOnZvaWR7XG4gICAgICAgICAgICAgICAgbGV0IHBlbmQgPSBwb2xhclRvQ2FydGVzaWFuKGNlbnRlclswXSwgY2VudGVyWzFdLCByYWRpdXMsIGFuZ2xlKTtcbiAgICAgICAgICAgICAgICBsZXQgcHN0YXJ0ID0gW2NlbnRlclswXSArIHJhZGl1cywgY2VudGVyWzFdXTtcbiAgICAgICAgICAgICAgICBsZXQgZCA9IFtcIk1cIiArIHBzdGFydFswXSwgcHN0YXJ0WzFdLCBcIkFcIiArIHJhZGl1cywgcmFkaXVzLCBcIjAgMSAwXCIsIHBlbmRbMF0sIHBlbmRbMV1dO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlTlMobnVsbCwgXCJkXCIsIGQuam9pbihcIiBcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG4gICAgZnVuY3Rpb24gcG9sYXJUb0NhcnRlc2lhbihjZW50ZXJYOm51bWJlciwgY2VudGVyWTpudW1iZXIsIHJhZGl1czpudW1iZXIsIGFuZ2xlSW5EZWdyZWVzOm51bWJlcikge1xuICAgICAgICBsZXQgYW5nbGVJblJhZGlhbnMgPSBhbmdsZUluRGVncmVlcyAqIE1hdGguUEkgLyAxODAuMDtcbiAgICAgICAgbGV0IHggPSBjZW50ZXJYICsgcmFkaXVzICogTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xuICAgICAgICBsZXQgeSA9IGNlbnRlclkgKyByYWRpdXMgKiBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XG4gICAgICAgIHJldHVybiBbeCx5XTtcbiAgICB9XG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
