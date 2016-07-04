Array.prototype.add = function (item) {
    this[this.length] = item;
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
        Destroyer.destroy(target);
    }
    wo.destroy = destroy;
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
        for (var _i = 0, Creators_1 = wo.Creators; _i < Creators_1.length; _i++) {
            var i = Creators_1[_i];
            if (json[i.Id]) {
                return i.Create(json, cs);
            }
        }
        return null;
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
            var el = wo.use(wo.Widgets[wg]);
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
                        var item = json[j];
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

wo.Creators.add(new wo.DomCreator());
wo.Creators.add(new wo.SvgCreator());
wo.Creators.add(new wo.UiCreator());

var wo;
(function (wo) {
    wo.Widgets.cover = {
        tag: "div",
        class: "cover",
        style: { display: 'none' },
        show: function () {
            this.style.display = '';
        }, hide: function () {
            this.style.display = 'none';
        }, made: function () {
            var cv = document.body.$gcv$;
            if (cv) {
                wo.destroy(cv);
            }
            document.body.appendChild(this);
            document.body.$gcv$ = this;
        }
    };
})(wo || (wo = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHMiLCJmb3VuZGF0aW9uL2RldmljZS50cyIsImZvdW5kYXRpb24vZWxlbWVudHMudHMiLCJmb3VuZGF0aW9uL3N0cmluZy50cyIsImJ1aWxkZXIvdXNlLnRzIiwiYnVpbGRlci9kb21jcmVhdG9yLnRzIiwiYnVpbGRlci9zdmdjcmVhdG9yLnRzIiwiYnVpbGRlci91aWNyZWF0b3IudHMiLCJ3by50cyIsIndpZGdldHMvY292ZXIvY292ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZ0NBLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVUsSUFBUTtJQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMxQixDQUFDLENBQUE7O0FDbENEO0lBQUE7SUF1Q0EsQ0FBQztJQXRDQSxzQkFBVyx1QkFBTzthQUFsQjtZQUNDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBQ0QsTUFBTSxDQUFDLENBQUMsSUFBRyxJQUFJLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQzs7O09BQUE7SUFDRCxzQkFBVywwQkFBVTthQUFyQjtZQUNDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBQ0QsTUFBTSxDQUFDLENBQUMsSUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLE1BQU0s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LENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUNoQyxDQUFDLEVBQUMsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLEdBQUksUUFBUSxDQUFDLElBQVksQ0FBQyxLQUFLLENBQUM7WUFDdEMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUEsQ0FBQztnQkFDSixFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLENBQUM7WUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixRQUFRLENBQUMsSUFBWSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDeEMsQ0FBQztLQUNKLENBQUE7QUFDTCxDQUFDLEVBbEJNLEVBQUUsS0FBRixFQUFFLFFBa0JSIiwiZmlsZSI6IndvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW50ZXJmYWNlIFdpbmRvd3tcclxuXHRvcHI6YW55O1xyXG5cdG9wZXJhOmFueTtcclxuXHRjaHJvbWU6YW55O1xyXG5cdFN0eWxlTWVkaWE6YW55O1xyXG5cdEluc3RhbGxUcmlnZ2VyOmFueTtcclxuXHRDU1M6YW55O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRG9jdW1lbnR7XHJcblx0ZG9jdW1lbnRNb2RlOmFueTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEVsZW1lbnR7XHJcblx0W25hbWU6c3RyaW5nXTphbnk7XHJcblx0YXN0eWxlKHN0eWxlczpzdHJpbmdbXSk6c3RyaW5nO1xyXG5cdGRlc3Ryb3lTdGF0dXM6YW55O1xyXG5cdGRpc3Bvc2UoKTphbnk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBOb2Rle1xyXG5cdGN1cnNvcjphbnk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBTdHJpbmd7XHJcblx0c3RhcnRzV2l0aChzdHI6c3RyaW5nKTpib29sZWFuO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQXJyYXk8VD57XHJcblx0YWRkKGl0ZW06VCk6dm9pZDtcclxufVxyXG5cclxuQXJyYXkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChpdGVtOmFueSkge1xyXG5cdHRoaXNbdGhpcy5sZW5ndGhdID0gaXRlbTtcclxufSIsImNsYXNzIE1vYmlsZURldmljZXtcclxuXHRzdGF0aWMgZ2V0IEFuZHJvaWQgKCk6Ym9vbGVhbiB7XHJcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0FuZHJvaWQvaSk7XHJcblx0XHRpZiAocikge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHIhPSBudWxsICYmIHIubGVuZ3RoPjA7XHJcblx0fVxyXG5cdHN0YXRpYyBnZXQgQmxhY2tCZXJyeSgpOmJvb2xlYW4ge1xyXG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9CbGFja0JlcnJ5L2kpO1xyXG5cdFx0aWYgKHIpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByIT1udWxsICYmIHIubGVuZ3RoID4gMDtcclxuXHR9XHJcblx0c3RhdGljIGdldCBpT1MoKTpib29sZWFuIHtcclxuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVBob25lfGlQYWR8aVBvZC9pKTtcclxuXHRcdGlmIChyKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gciAhPSBudWxsICYmIHIubGVuZ3RoID4gMDtcclxuXHR9XHJcblx0c3RhdGljIGdldCBPcGVyYSgpOmJvb2xlYW4ge1xyXG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9PcGVyYSBNaW5pL2kpO1xyXG5cdFx0aWYgKHIpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByICE9IG51bGwgJiYgci5sZW5ndGggPiAwO1xyXG5cdH1cclxuXHRzdGF0aWMgZ2V0IFdpbmRvd3MoKTpib29sZWFuIHtcclxuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvSUVNb2JpbGUvaSk7XHJcblx0XHRpZiAocikge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHIhPSBudWxsICYmIHIubGVuZ3RoID4wO1xyXG5cdH1cclxuXHRzdGF0aWMgZ2V0IGFueSgpOmJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIChNb2JpbGVEZXZpY2UuQW5kcm9pZCB8fCBNb2JpbGVEZXZpY2UuQmxhY2tCZXJyeSB8fCBNb2JpbGVEZXZpY2UuaU9TIHx8IE1vYmlsZURldmljZS5PcGVyYSB8fCBNb2JpbGVEZXZpY2UuV2luZG93cyk7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBCcm93c2Vye1xyXG5cdHN0YXRpYyBnZXQgaXNPcGVyYSgpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gKCEhd2luZG93Lm9wciAmJiAhIXdpbmRvdy5vcHIuYWRkb25zKSB8fCAhIXdpbmRvdy5vcGVyYSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBPUFIvJykgPj0gMDtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBnZXQgaXNGaXJlZm94KCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiB0eXBlb2Ygd2luZG93Lkluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJztcclxuXHR9XHJcblx0c3RhdGljIGdldCBpc1NhZmFyaSgpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKEhUTUxFbGVtZW50KS5pbmRleE9mKCdDb25zdHJ1Y3RvcicpID4gMDtcclxuXHR9IFxyXG5cdHN0YXRpYyBnZXQgaXNJRSgpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gZmFsc2UgfHwgISFkb2N1bWVudC5kb2N1bWVudE1vZGU7XHJcblx0fVxyXG5cdHN0YXRpYyBnZXQgaXNFZGdlKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiAhQnJvd3Nlci5pc0lFICYmICEhd2luZG93LlN0eWxlTWVkaWE7XHJcblx0fVxyXG5cdHN0YXRpYyBnZXQgaXNDaHJvbWUoKTpib29sZWFue1xyXG5cdFx0cmV0dXJuICEhd2luZG93LmNocm9tZSAmJiAhIXdpbmRvdy5jaHJvbWUud2Vic3RvcmU7XHJcblx0fVxyXG5cdHN0YXRpYyBnZXQgaXNCbGluaygpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gKEJyb3dzZXIuaXNDaHJvbWUgfHwgQnJvd3Nlci5pc09wZXJhKSAmJiAhIXdpbmRvdy5DU1M7XHJcblx0fVxyXG59XHJcblxyXG4iLCJcclxuRWxlbWVudC5wcm90b3R5cGUuYXN0eWxlID0gZnVuY3Rpb24gYWN0dWFsU3R5bGUocHJvcHM6c3RyaW5nW10pIHtcclxuXHRsZXQgZWw6RWxlbWVudCA9IHRoaXM7XHJcblx0bGV0IGNvbXBTdHlsZTpDU1NTdHlsZURlY2xhcmF0aW9uID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpO1xyXG5cdGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRsZXQgc3R5bGU6c3RyaW5nID0gY29tcFN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcHNbaV0pO1xyXG5cdFx0aWYgKHN0eWxlICE9IG51bGwpIHtcclxuXHRcdFx0cmV0dXJuIHN0eWxlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbm1vZHVsZSB3b3tcclxuXHRjbGFzcyBEZXN0cm95ZXJ7XHJcblx0XHRkaXNwb3Npbmc6Ym9vbGVhbjtcclxuXHRcdGRlc3Ryb3lpbmc6Ym9vbGVhbjtcclxuXHRcdHN0YXRpYyBjb250YWluZXI6SFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cdFx0c3RhdGljIGRlc3Ryb3kodGFyZ2V0OkVsZW1lbnQpe1xyXG5cdFx0XHRpZiAoIXRhcmdldC5kZXN0cm95U3RhdHVzKXtcclxuXHRcdFx0XHR0YXJnZXQuZGVzdHJveVN0YXR1cyA9IG5ldyBEZXN0cm95ZXIoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodGFyZ2V0LmRpc3Bvc2UgJiYgIXRhcmdldC5kZXN0cm95U3RhdHVzLmRpc3Bvc2luZyl7XHJcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGlzcG9zaW5nID0gdHJ1ZTtcclxuXHRcdFx0XHR0YXJnZXQuZGlzcG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghdGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGVzdHJveWluZyl7XHJcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMuZGVzdHJveWluZyA9IHRydWU7XHJcblx0XHRcdFx0RGVzdHJveWVyLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0YXJnZXQpO1xyXG5cdFx0XHRcdGZvcihsZXQgaSBpbiB0YXJnZXQpe1xyXG5cdFx0XHRcdFx0aWYgKGkuaW5kZXhPZignJCcpID09IDApe1xyXG5cdFx0XHRcdFx0XHRsZXQgdG1wOmFueSA9IHRhcmdldFtpXTtcclxuXHRcdFx0XHRcdFx0aWYgKHRtcCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcclxuXHRcdFx0XHRcdFx0XHR0YXJnZXRbaV0gPSBudWxsO1xyXG5cdFx0XHRcdFx0XHRcdHRtcCA9IG51bGw7XHJcblx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB0YXJnZXRbaV07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0RGVzdHJveWVyLmNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3kodGFyZ2V0OkVsZW1lbnQpOnZvaWR7XHJcblx0XHREZXN0cm95ZXIuZGVzdHJveSh0YXJnZXQpO1xyXG5cdH1cclxuXHJcbn0iLCJpbnRlcmZhY2UgU3RyaW5ne1xyXG5cdHN0YXJ0c1dpdGgoc3RyOnN0cmluZyk6Ym9vbGVhbjtcclxuXHRmb3JtYXQoLi4ucmVzdEFyZ3M6YW55W10pOnN0cmluZztcclxufVxyXG5cclxuU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoID0gZnVuY3Rpb24oc3RyOnN0cmluZyk6Ym9vbGVhbntcclxuXHRyZXR1cm4gdGhpcy5pbmRleE9mKHN0cik9PTA7XHJcbn1cclxuU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XHJcblx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XHJcblx0dmFyIHMgPSB0aGlzO1xyXG5cdGlmICghYXJncyB8fCBhcmdzLmxlbmd0aCA8IDEpIHtcclxuXHRcdHJldHVybiBzO1xyXG5cdH1cclxuXHR2YXIgciA9IHM7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHR2YXIgcmVnID0gbmV3IFJlZ0V4cCgnXFxcXHsnICsgaSArICdcXFxcfScpO1xyXG5cdFx0ciA9IHIucmVwbGFjZShyZWcsIGFyZ3NbaV0pO1xyXG5cdH1cclxuXHRyZXR1cm4gcjtcclxufTsiLCJcclxubW9kdWxlIHdve1xyXG4gICAgZXhwb3J0IGxldCBDcmVhdG9yczpDcmVhdG9yW10gPSBbXTtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ3Vyc29ye1xyXG4gICAgICAgIHBhcmVudDphbnk7XHJcbiAgICAgICAgYm9yZGVyOmFueTtcclxuICAgICAgICByb290OmFueTtcclxuICAgICAgICBjdXJ0OmFueTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgQ3JlYXRvcntcclxuICAgICAgICBpZDpzdHJpbmc7XHJcbiAgICAgICAgZ2V0IElkKCk6c3RyaW5ne1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgQ3JlYXRlKGpzb246YW55LCBjcz86Q3Vyc29yKTphbnl7XHJcbiAgICAgICAgICAgIGlmICghanNvbil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgbyA9IHRoaXMuY3JlYXRlKGpzb24pO1xyXG4gICAgICAgICAgICBpZiAoIWNzKXtcclxuICAgICAgICAgICAgICAgIGNzID0gbmV3IEN1cnNvcigpO1xyXG4gICAgICAgICAgICAgICAgY3Mucm9vdCA9IG87XHJcbiAgICAgICAgICAgICAgICBjcy5wYXJlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgY3MuYm9yZGVyID0gbztcclxuICAgICAgICAgICAgICAgIGNzLmN1cnQgPSBvO1xyXG4gICAgICAgICAgICAgICAgby5jdXJzb3IgPSBjcztcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBsZXQgbmNzID0gbmV3IEN1cnNvcigpO1xyXG4gICAgICAgICAgICAgICAgbmNzLnJvb3QgPSBjcy5yb290O1xyXG4gICAgICAgICAgICAgICAgbmNzLnBhcmVudCA9IGNzLmN1cnQ7XHJcbiAgICAgICAgICAgICAgICBuY3MuYm9yZGVyID0gY3MuYm9yZGVyO1xyXG4gICAgICAgICAgICAgICAgbmNzLmN1cnQgPSBvO1xyXG4gICAgICAgICAgICAgICAgby5jdXJzb3IgPSBuY3M7XHJcbiAgICAgICAgICAgICAgICBjcyA9IG5jcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoanNvbi5hbGlhcyl7XHJcbiAgICAgICAgICAgICAgICBsZXQgbiA9IGpzb24uYWxpYXM7XHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5hbGlhcy5zdGFydHNXaXRoKFwiJFwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbiA9IGpzb24uYWxpYXMuc3Vic3RyKDEsIGpzb24uYWxpYXMubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjcy5ib3JkZXJbXCIkXCIgKyBuXSA9IG87XHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5hbGlhcy5zdGFydHNXaXRoKFwiJFwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgY3MuYm9yZGVyID0gbztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGVsZXRlIGpzb25bdGhpcy5JZF07XHJcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5kKG8sIGpzb24pO1xyXG4gICAgICAgICAgICBpZiAoanNvbi5tYWRlKXtcclxuICAgICAgICAgICAgICAgIGpzb24ubWFkZS5jYWxsKG8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgY3JlYXRlKGpzb246YW55KTphbnk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZChlbDphbnksIGNoaWxkOmFueSl7XHJcbiAgICAgICAgaWYgKGVsLmFwcGVuZCAmJiB0eXBlb2YoZWwuYXBwZW5kKSA9PSAnZnVuY3Rpb24nKXtcclxuICAgICAgICAgICAgZWwuYXBwZW5kKGNoaWxkKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdXNlKGpzb246YW55LCBjcz86Q3Vyc29yKTphbnl7XHJcbiAgICAgICAgZm9yKHZhciBpIG9mIENyZWF0b3JzKXtcclxuICAgICAgICAgICAgaWYgKGpzb25baS5JZF0pe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGkuQ3JlYXRlKGpzb24sIGNzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gb2JqZXh0ZW5kKG86YW55LCBqc29uOmFueSl7XHJcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xyXG4gICAgICAgICAgICBpZiAob1tpXSAmJiB0eXBlb2Yob1tpXSkgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgb2JqZXh0ZW5kKG9baV0sIGpzb25baV0pO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIG9baV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSIsIlxyXG5tb2R1bGUgd297XHJcbiAgICBleHBvcnQgY2xhc3MgRG9tQ3JlYXRvciBleHRlbmRzIENyZWF0b3J7XHJcbiAgICAgICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5pZCA9IFwidGFnXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNyZWF0ZShqc29uOmFueSk6Tm9kZXtcclxuICAgICAgICAgICAgaWYgKGpzb24gPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgdGFnID0ganNvblt0aGlzLmlkXTtcclxuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XHJcbiAgICAgICAgICAgIGlmICh0YWcgPT0gJyN0ZXh0Jyl7XHJcbiAgICAgICAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRhZyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7IFxyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lke1xyXG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChvIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xyXG4gICAgICAgICAgICAgICAgZG9tZXh0ZW5kKG8sIGpzb24pO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoanNvbi4kICYmIG8gaW5zdGFuY2VvZiBOb2RlKXtcclxuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xyXG4gICAgICAgICAgICAgICAgby5leHRlbmQoanNvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZG9tZXh0ZW5kKGVsOmFueSwganNvbjphbnkpe1xyXG4gICAgICAgIGxldCBjcyA9IGVsLmN1cnNvcjtcclxuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XHJcbiAgICAgICAgICAgIGlmIChpLnN0YXJ0c1dpdGgoXCIkJFwiKSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZWxbaV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZ0eXBlID0gdHlwZW9mIGpzb25baV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZ0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tZXh0ZW5kKHRhcmdldCwganNvbltpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwiJFwiKXtcclxuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIGpzb25baV07XHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbltpXSBpbnN0YW5jZW9mIEFycmF5KXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGogb2YganNvbltpXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqLCBjcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqc29uW2ldLCBjcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWVsc2UgaWYgKGkuc3RhcnRzV2l0aChcIiRcIikpe1xyXG4gICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGpzb25baV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbFtpXSAmJiB0eXBlb2YoZWxbaV0pID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZXh0ZW5kKGVsW2ldLCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGksIGpzb25baV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iLCJcclxubW9kdWxlIHdve1xyXG4gICAgZXhwb3J0IGNsYXNzIFN2Z0NyZWF0b3IgZXh0ZW5kcyBDcmVhdG9ye1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBcInNnXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNyZWF0ZShqc29uOmFueSk6Tm9kZXtcclxuICAgICAgICAgICAgaWYgKGpzb24gPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgdGFnID0ganNvblt0aGlzLmlkXTtcclxuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XHJcbiAgICAgICAgICAgIGlmICh0YWcgPT0gXCJzdmdcIil7XHJcbiAgICAgICAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIHRhZyk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCB0YWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvIGluc3RhbmNlb2YgU1ZHRWxlbWVudCl7XHJcbiAgICAgICAgICAgICAgICBzdmdleHRlbmQobywganNvbik7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xyXG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChvLmV4dGVuZCl7XHJcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdmdleHRlbmQoZWw6SFRNTEVsZW1lbnQsIGpzb246YW55KXtcclxuICAgICAgICBsZXQgY3MgPSBlbC5jdXJzb3I7XHJcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xyXG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGVsW2ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2dHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2dHlwZSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z2V4dGVuZCh0YXJnZXQsIGpzb25baV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcIiRcIil7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25baV0gaW5zdGFuY2VvZiBBcnJheSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBqIG9mIGpzb25baV0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoaiwgY3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoanNvbltpXSwgY3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcclxuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKXtcclxuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxbaV0gJiYgdHlwZW9mKGVsW2ldKSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKG51bGwsIGksIGpzb25baV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iLCJcclxubW9kdWxlIHdve1xyXG4gICAgZXhwb3J0IGxldCBXaWRnZXRzOmFueSA9IHt9O1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBVaUNyZWF0b3IgZXh0ZW5kcyBDcmVhdG9ye1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBcInVpXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNyZWF0ZShqc29uOmFueSk6Tm9kZXtcclxuICAgICAgICAgICAgaWYgKGpzb24gPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgd2cgPSBqc29uW3RoaXMuaWRdO1xyXG4gICAgICAgICAgICBpZiAoIVdpZGdldHNbd2ddKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZWw6Tm9kZSA9IHVzZShXaWRnZXRzW3dnXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcclxuICAgICAgICAgICAgICAgIGRvbWFwcGx5KG8sIGpzb24pO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoanNvbi4kICYmIG8gaW5zdGFuY2VvZiBOb2RlKXtcclxuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xyXG4gICAgICAgICAgICAgICAgby5leHRlbmQoanNvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRvbWFwcGx5KGVsOmFueSwganNvbjphbnkpe1xyXG4gICAgICAgIGxldCBjcyA9IGVsLmN1cnNvcjtcclxuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XHJcbiAgICAgICAgICAgIGlmIChpLnN0YXJ0c1dpdGgoXCIkJFwiKSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZWxbaV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZ0eXBlID0gdHlwZW9mIGpzb25baV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZ0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYXBwbHkodGFyZ2V0LCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWVsc2UgaWYgKGkgPT0gXCIkXCIpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YganNvbltpXTtcclxuICAgICAgICAgICAgICAgIGxldCBqaSA9IGpzb25baV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICBqaSA9IFtqaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqaSBpbnN0YW5jZW9mIEFycmF5KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZXMgPSBlbC5jaGlsZE5vZGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGo8amkubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGpzb25bal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqIDwgbm9kZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFwcGx5KG5vZGVzW2pdLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoaXRlbSwgY3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcclxuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKXtcclxuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxbaV0gJiYgdHlwZW9mKGVsW2ldKSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShpLCBqc29uW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJcclxud28uQ3JlYXRvcnMuYWRkKG5ldyB3by5Eb21DcmVhdG9yKCkpO1xyXG53by5DcmVhdG9ycy5hZGQobmV3IHdvLlN2Z0NyZWF0b3IoKSk7XHJcbndvLkNyZWF0b3JzLmFkZChuZXcgd28uVWlDcmVhdG9yKCkpO1xyXG4iLCJcclxubW9kdWxlIHdve1xyXG4gICAgV2lkZ2V0cy5jb3ZlciA9IHtcclxuICAgICAgICB0YWc6XCJkaXZcIixcclxuICAgICAgICBjbGFzczpcImNvdmVyXCIsXHJcbiAgICAgICAgc3R5bGU6e2Rpc3BsYXk6J25vbmUnfSxcclxuICAgICAgICBzaG93OmZ1bmN0aW9uKCk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgfSxoaWRlOmZ1bmN0aW9uKCk6dm9pZHtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH0sbWFkZTogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgbGV0IGN2ID0gKGRvY3VtZW50LmJvZHkgYXMgYW55KS4kZ2N2JDtcclxuICAgICAgICAgICAgaWYgKGN2KXtcclxuICAgICAgICAgICAgICAgIHdvLmRlc3Ryb3koY3YpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcyk7XHJcbiAgICAgICAgICAgIChkb2N1bWVudC5ib2R5IGFzIGFueSkuJGdjdiQgPSB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
