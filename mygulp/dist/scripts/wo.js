var test = $("div");

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
        }, onclick: function (event) {
            if (this.$$touchclose) {
                this.hide();
            }
        }
    };
})(wo || (wo = {}));

var wo;
(function (wo) {
    wo.Widgets.card = {
        tag: "div",
        class: "card",
        setval: function (val) {
            for (var i in val) {
                $(this["$" + i]).text(val[i]);
            }
        },
        $: [
            { tag: "div", class: "title", alias: "title" },
            { tag: "div", class: "body", alias: "body" }
        ]
    };
})(wo || (wo = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy93by90ZXN0cy90ZXN0LnRzIiwic3JjL3dvL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHMiLCJzcmMvd28vZm91bmRhdGlvbi9kZXZpY2UudHMiLCJzcmMvd28vZm91bmRhdGlvbi9lbGVtZW50cy50cyIsInNyYy93by9mb3VuZGF0aW9uL3N0cmluZy50cyIsInNyYy93by9idWlsZGVyL3VzZS50cyIsInNyYy93by9idWlsZGVyL2RvbWNyZWF0b3IudHMiLCJzcmMvd28vYnVpbGRlci9zdmdjcmVhdG9yLnRzIiwic3JjL3dvL2J1aWxkZXIvdWljcmVhdG9yLnRzIiwic3JjL3dvL3dvLnRzIiwic3JjL3dvL3dpZGdldHMvY292ZXIvY292ZXIudHMiLCJzcmMvd28vd2lkZ2V0cy9jYXJkL2NhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsbUVBQW1FO0FBRW5FLElBQUksSUFBSSxHQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUMrQnRCLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVUsSUFBUTtJQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMxQixDQUFDLENBQUE7O0FDbkNELHVDQUF1QztBQUN2QztJQUFBO0lBdUNBLENBQUM7SUF0Q0Esc0JBQVcsdUJBQU87YUFBbEI7WUFDQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUNELE1BQU0sQ0FBQyxDQUFDLElBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7OztPQUFBO0lBQ0Qsc0JBQVcsMEJBQVU7YUFBckI7WUFDQyxJQUFJLENB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Li4vdHlwaW5ncy9nbG9iYWxzL2pxdWVyeS9pbmRleC5kLnRzXCIgLz5cclxuXHJcbmxldCB0ZXN0OmFueT0kKFwiZGl2XCIpOyIsImludGVyZmFjZSBXaW5kb3d7XG5cdG9wcjphbnk7XG5cdG9wZXJhOmFueTtcblx0Y2hyb21lOmFueTtcblx0U3R5bGVNZWRpYTphbnk7XG5cdEluc3RhbGxUcmlnZ2VyOmFueTtcblx0Q1NTOmFueTtcbn1cblxuaW50ZXJmYWNlIERvY3VtZW50e1xuXHRkb2N1bWVudE1vZGU6YW55O1xufVxuXG4vLyBFbGVtZW50LnRzXG5pbnRlcmZhY2UgRWxlbWVudHtcblx0W25hbWU6c3RyaW5nXTphbnk7XG5cdGFzdHlsZShzdHlsZXM6c3RyaW5nW10pOnN0cmluZztcblx0ZGVzdHJveVN0YXR1czphbnk7XG5cdGRpc3Bvc2UoKTphbnk7XG59XG5cbmludGVyZmFjZSBOb2Rle1xuXHRjdXJzb3I6YW55O1xufVxuXG5pbnRlcmZhY2UgU3RyaW5ne1xuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XG59XG5cbmludGVyZmFjZSBBcnJheTxUPntcblx0YWRkKGl0ZW06VCk6dm9pZDtcbn1cblxuQXJyYXkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChpdGVtOmFueSkge1xuXHR0aGlzW3RoaXMubGVuZ3RoXSA9IGl0ZW07XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy50c1wiIC8+XG5jbGFzcyBNb2JpbGVEZXZpY2V7XG5cdHN0YXRpYyBnZXQgQW5kcm9pZCAoKTpib29sZWFuIHtcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0FuZHJvaWQvaSk7XG5cdFx0aWYgKHIpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XG5cdFx0fVxuXHRcdHJldHVybiByIT0gbnVsbCAmJiByLmxlbmd0aD4wO1xuXHR9XG5cdHN0YXRpYyBnZXQgQmxhY2tCZXJyeSgpOmJvb2xlYW4ge1xuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQmxhY2tCZXJyeS9pKTtcblx0XHRpZiAocikge1xuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHIhPW51bGwgJiYgci5sZW5ndGggPiAwO1xuXHR9XG5cdHN0YXRpYyBnZXQgaU9TKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUGhvbmV8aVBhZHxpUG9kL2kpO1xuXHRcdGlmIChyKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gciAhPSBudWxsICYmIHIubGVuZ3RoID4gMDtcblx0fVxuXHRzdGF0aWMgZ2V0IE9wZXJhKCk6Ym9vbGVhbiB7XG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9PcGVyYSBNaW5pL2kpO1xuXHRcdGlmIChyKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gciAhPSBudWxsICYmIHIubGVuZ3RoID4gMDtcblx0fVxuXHRzdGF0aWMgZ2V0IFdpbmRvd3MoKTpib29sZWFuIHtcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0lFTW9iaWxlL2kpO1xuXHRcdGlmIChyKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gciE9IG51bGwgJiYgci5sZW5ndGggPjA7XG5cdH1cblx0c3RhdGljIGdldCBhbnkoKTpib29sZWFuIHtcblx0XHRyZXR1cm4gKE1vYmlsZURldmljZS5BbmRyb2lkIHx8IE1vYmlsZURldmljZS5CbGFja0JlcnJ5IHx8IE1vYmlsZURldmljZS5pT1MgfHwgTW9iaWxlRGV2aWNlLk9wZXJhIHx8IE1vYmlsZURldmljZS5XaW5kb3dzKTtcblx0fVxufVxuXG5jbGFzcyBCcm93c2Vye1xuXHQvLyBPcGVyYSA4LjArXG5cdHN0YXRpYyBnZXQgaXNPcGVyYSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuICghIXdpbmRvdy5vcHIgJiYgISF3aW5kb3cub3ByLmFkZG9ucykgfHwgISF3aW5kb3cub3BlcmEgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgT1BSLycpID49IDA7XG5cdH1cblx0XG5cdC8vIEZpcmVmb3ggMS4wK1xuXHRzdGF0aWMgZ2V0IGlzRmlyZWZveCgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIHR5cGVvZiB3aW5kb3cuSW5zdGFsbFRyaWdnZXIgIT09ICd1bmRlZmluZWQnO1xuXHR9XG5cdC8vIEF0IGxlYXN0IFNhZmFyaSAzKzogXCJbb2JqZWN0IEhUTUxFbGVtZW50Q29uc3RydWN0b3JdXCJcblx0c3RhdGljIGdldCBpc1NhZmFyaSgpOmJvb2xlYW57XG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChIVE1MRWxlbWVudCkuaW5kZXhPZignQ29uc3RydWN0b3InKSA+IDA7XG5cdH0gXG5cdC8vIEludGVybmV0IEV4cGxvcmVyIDYtMTFcblx0c3RhdGljIGdldCBpc0lFKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gLypAY2Nfb24hQCovZmFsc2UgfHwgISFkb2N1bWVudC5kb2N1bWVudE1vZGU7XG5cdH1cblx0Ly8gRWRnZSAyMCtcblx0c3RhdGljIGdldCBpc0VkZ2UoKTpib29sZWFue1xuXHRcdHJldHVybiAhQnJvd3Nlci5pc0lFICYmICEhd2luZG93LlN0eWxlTWVkaWE7XG5cdH1cblx0Ly8gQ2hyb21lIDErXG5cdHN0YXRpYyBnZXQgaXNDaHJvbWUoKTpib29sZWFue1xuXHRcdHJldHVybiAhIXdpbmRvdy5jaHJvbWUgJiYgISF3aW5kb3cuY2hyb21lLndlYnN0b3JlO1xuXHR9XG5cdC8vIEJsaW5rIGVuZ2luZSBkZXRlY3Rpb25cblx0c3RhdGljIGdldCBpc0JsaW5rKCk6Ym9vbGVhbntcblx0XHRyZXR1cm4gKEJyb3dzZXIuaXNDaHJvbWUgfHwgQnJvd3Nlci5pc09wZXJhKSAmJiAhIXdpbmRvdy5DU1M7XG5cdH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRlZmluaXRpb25zLnRzXCIgLz5cblxuRWxlbWVudC5wcm90b3R5cGUuYXN0eWxlID0gZnVuY3Rpb24gYWN0dWFsU3R5bGUocHJvcHM6c3RyaW5nW10pIHtcblx0bGV0IGVsOkVsZW1lbnQgPSB0aGlzO1xuXHRsZXQgY29tcFN0eWxlOkNTU1N0eWxlRGVjbGFyYXRpb24gPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCk7XG5cdGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG5cdFx0bGV0IHN0eWxlOnN0cmluZyA9IGNvbXBTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BzW2ldKTtcblx0XHRpZiAoc3R5bGUgIT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIHN0eWxlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbm5hbWVzcGFjZSB3b3tcblx0Y2xhc3MgRGVzdHJveWVye1xuXHRcdGRpc3Bvc2luZzpib29sZWFuO1xuXHRcdGRlc3Ryb3lpbmc6Ym9vbGVhbjtcblx0XHRzdGF0aWMgY29udGFpbmVyOkhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHRzdGF0aWMgZGVzdHJveSh0YXJnZXQ6RWxlbWVudCl7XG5cdFx0XHRpZiAoIXRhcmdldC5kZXN0cm95U3RhdHVzKXtcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMgPSBuZXcgRGVzdHJveWVyKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGFyZ2V0LmRpc3Bvc2UgJiYgIXRhcmdldC5kZXN0cm95U3RhdHVzLmRpc3Bvc2luZyl7XG5cdFx0XHRcdHRhcmdldC5kZXN0cm95U3RhdHVzLmRpc3Bvc2luZyA9IHRydWU7XG5cdFx0XHRcdHRhcmdldC5kaXNwb3NlKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRhcmdldC5kZXN0cm95U3RhdHVzLmRlc3Ryb3lpbmcpe1xuXHRcdFx0XHR0YXJnZXQuZGVzdHJveVN0YXR1cy5kZXN0cm95aW5nID0gdHJ1ZTtcblx0XHRcdFx0RGVzdHJveWVyLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0YXJnZXQpO1xuXHRcdFx0XHRmb3IobGV0IGkgaW4gdGFyZ2V0KXtcblx0XHRcdFx0XHRpZiAoaS5pbmRleE9mKCckJykgPT0gMCl7XG5cdFx0XHRcdFx0XHRsZXQgdG1wOmFueSA9IHRhcmdldFtpXTtcblx0XHRcdFx0XHRcdGlmICh0bXAgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG5cdFx0XHRcdFx0XHRcdHRhcmdldFtpXSA9IG51bGw7XG5cdFx0XHRcdFx0XHRcdHRtcCA9IG51bGw7XG5cdFx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIHRhcmdldFtpXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0RGVzdHJveWVyLmNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZGVzdHJveSh0YXJnZXQ6YW55KTp2b2lke1xuXHRcdGlmICh0YXJnZXQubGVuZ3RoID4gMCB8fCB0YXJnZXQgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0XHRmb3IobGV0IGkgb2YgdGFyZ2V0KXtcblx0XHRcdFx0RGVzdHJveWVyLmRlc3Ryb3koaSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KXtcblx0XHRcdFx0RGVzdHJveWVyLmRlc3Ryb3kodGFyZ2V0KTtcblx0XHR9XG5cdH1cbn0iLCJpbnRlcmZhY2UgU3RyaW5ne1xuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XG5cdGZvcm1hdCguLi5yZXN0QXJnczphbnlbXSk6c3RyaW5nO1xufVxuXG5TdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGggPSBmdW5jdGlvbihzdHI6c3RyaW5nKTpib29sZWFue1xuXHRyZXR1cm4gdGhpcy5pbmRleE9mKHN0cik9PTA7XG59XG5TdHJpbmcucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdHZhciBzID0gdGhpcztcblx0aWYgKCFhcmdzIHx8IGFyZ3MubGVuZ3RoIDwgMSkge1xuXHRcdHJldHVybiBzO1xuXHR9XG5cdHZhciByID0gcztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHJlZyA9IG5ldyBSZWdFeHAoJ1xcXFx7JyArIGkgKyAnXFxcXH0nKTtcblx0XHRyID0gci5yZXBsYWNlKHJlZywgYXJnc1tpXSk7XG5cdH1cblx0cmV0dXJuIHI7XG59OyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9mb3VuZGF0aW9uL3N0cmluZy50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICAvLy8gQ29udGFpbnMgY3JlYXRvciBpbnN0YW5jZSBvYmplY3RcbiAgICBleHBvcnQgbGV0IENyZWF0b3JzOkNyZWF0b3JbXSA9IFtdO1xuXG4gICAgZnVuY3Rpb24gZ2V0KHNlbGVjdG9yOmFueSk6YW55e1xuICAgICAgICBsZXQgcmx0OmFueSA9IFtdO1xuICAgICAgICBpZiAoc2VsZWN0b3Ipe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBybHQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIEN1cnNvcntcbiAgICAgICAgcGFyZW50OmFueTtcbiAgICAgICAgYm9yZGVyOmFueTtcbiAgICAgICAgcm9vdDphbnk7XG4gICAgICAgIGN1cnQ6YW55O1xuICAgIH1cblxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDcmVhdG9ye1xuICAgICAgICBpZDpzdHJpbmc7XG4gICAgICAgIGdldCBJZCgpOnN0cmluZ3tcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xuICAgICAgICB9XG4gICAgICAgIENyZWF0ZShqc29uOmFueSwgY3M/OkN1cnNvcik6YW55e1xuICAgICAgICAgICAgaWYgKCFqc29uKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvID0gdGhpcy5jcmVhdGUoanNvbik7XG4gICAgICAgICAgICBpZiAoIWNzKXtcbiAgICAgICAgICAgICAgICBjcyA9IG5ldyBDdXJzb3IoKTtcbiAgICAgICAgICAgICAgICBjcy5yb290ID0gbztcbiAgICAgICAgICAgICAgICBjcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGNzLmJvcmRlciA9IG87XG4gICAgICAgICAgICAgICAgY3MuY3VydCA9IG87XG4gICAgICAgICAgICAgICAgby5jdXJzb3IgPSBjcztcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGxldCBuY3MgPSBuZXcgQ3Vyc29yKCk7XG4gICAgICAgICAgICAgICAgbmNzLnJvb3QgPSBjcy5yb290O1xuICAgICAgICAgICAgICAgIG5jcy5wYXJlbnQgPSBjcy5jdXJ0O1xuICAgICAgICAgICAgICAgIG5jcy5ib3JkZXIgPSBjcy5ib3JkZXI7XG4gICAgICAgICAgICAgICAgbmNzLmN1cnQgPSBvO1xuICAgICAgICAgICAgICAgIG8uY3Vyc29yID0gbmNzO1xuICAgICAgICAgICAgICAgIGNzID0gbmNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGpzb24uYWxpYXMpe1xuICAgICAgICAgICAgICAgIGxldCBuID0ganNvbi5hbGlhcztcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5hbGlhcy5zdGFydHNXaXRoKFwiJFwiKSl7XG4gICAgICAgICAgICAgICAgICAgIG4gPSBqc29uLmFsaWFzLnN1YnN0cigxLCBqc29uLmFsaWFzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGNzLmJvcmRlciwgbik7XG4gICAgICAgICAgICAgICAgY3MuYm9yZGVyW1wiJFwiICsgbl0gPSBvO1xuICAgICAgICAgICAgICAgIGlmIChqc29uLmFsaWFzLnN0YXJ0c1dpdGgoXCIkXCIpKXtcbiAgICAgICAgICAgICAgICAgICAgY3MuYm9yZGVyID0gbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRlbGV0ZSBqc29uW3RoaXMuSWRdO1xuICAgICAgICAgICAgdGhpcy5leHRlbmQobywganNvbik7XG4gICAgICAgICAgICBpZiAoanNvbi5tYWRlKXtcbiAgICAgICAgICAgICAgICBqc29uLm1hZGUuY2FsbChvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvO1xuICAgICAgICB9XG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGUoanNvbjphbnkpOmFueTtcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZChlbDphbnksIGNoaWxkOmFueSl7XG4gICAgICAgIGlmIChlbC5hcHBlbmQgJiYgdHlwZW9mKGVsLmFwcGVuZCkgPT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgICAgICBlbC5hcHBlbmQoY2hpbGQpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiB1c2UoanNvbjphbnksIGNzPzpDdXJzb3IpOmFueXtcbiAgICAgICAgbGV0IHJsdDphbnkgPSBudWxsO1xuICAgICAgICBpZiAoIWpzb24pe1xuICAgICAgICAgICAgcmV0dXJuIHJsdDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29udGFpbmVyOmFueSA9IG51bGw7XG4gICAgICAgIGlmIChqc29uLiRjb250YWluZXIkKXtcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGpzb24uJGNvbnRhaW5lciQ7XG4gICAgICAgICAgICBkZWxldGUganNvbi4kY29udGFpbmVyJDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIChqc29uKSA9PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICBybHQgPSBnZXQoanNvbik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IodmFyIGkgb2YgQ3JlYXRvcnMpe1xuICAgICAgICAgICAgaWYgKGpzb25baS5JZF0pe1xuICAgICAgICAgICAgICAgIHJsdCA9IGkuQ3JlYXRlKGpzb24sIGNzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udGFpbmVyKXtcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChybHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBybHQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG9iamV4dGVuZChvOmFueSwganNvbjphbnkpe1xuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XG4gICAgICAgICAgICBpZiAob1tpXSAmJiB0eXBlb2Yob1tpXSkgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIG9iamV4dGVuZChvW2ldLCBqc29uW2ldKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIG9baV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZvdW5kYXRpb24vZGVmaW5pdGlvbnMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdXNlLnRzXCIgLz5cblxubmFtZXNwYWNlIHdve1xuICAgIGV4cG9ydCBjbGFzcyBEb21DcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmlkID0gXCJ0YWdcIjtcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0YWcgPSBqc29uW3RoaXMuaWRdO1xuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XG4gICAgICAgICAgICBpZiAodGFnID09ICcjdGV4dCcpe1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGFnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7IFxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgICAgIGV4dGVuZChvOmFueSwganNvbjphbnkpOnZvaWR7XG4gICAgICAgICAgICBpZiAoanNvbiBpbnN0YW5jZW9mIE5vZGUgfHwganNvbiBpbnN0YW5jZW9mIEVsZW1lbnQpe1xuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgZG9tZXh0ZW5kKG8sIGpzb24pO1xuICAgICAgICAgICAgfWVsc2UgaWYgKGpzb24uJCAmJiBvIGluc3RhbmNlb2YgTm9kZSl7XG4gICAgICAgICAgICAgICAgby5ub2RlVmFsdWUgPSBqc29uLiQ7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xuICAgICAgICAgICAgICAgIG8uZXh0ZW5kKGpzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb21leHRlbmQoZWw6YW55LCBqc29uOmFueSl7XG4gICAgICAgIGxldCBjcyA9IGVsLmN1cnNvcjtcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xuICAgICAgICAgICAgaWYgKGkuc3RhcnRzV2l0aChcIiQkXCIpKXtcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZWxbaV07XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdGFyZ2V0O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZ0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh2dHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb21leHRlbmQodGFyZ2V0LCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNlIGlmIChpID09IFwiJFwiKXtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgIGlmIChqc29uW2ldIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGogb2YganNvbltpXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoaiwgY3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoanNvbltpXSwgY3MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VsLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2UgaWYgKGkuc3RhcnRzV2l0aChcIiRcIikpe1xuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxbaV0gJiYgdHlwZW9mKGVsW2ldKSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpleHRlbmQoZWxbaV0sIGpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShpLCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3VzZS50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBleHBvcnQgY2xhc3MgU3ZnQ3JlYXRvciBleHRlbmRzIENyZWF0b3J7XG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5pZCA9IFwic2dcIjtcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XG4gICAgICAgICAgICBpZiAoanNvbiA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0YWcgPSBqc29uW3RoaXMuaWRdO1xuICAgICAgICAgICAgbGV0IGVsOk5vZGU7XG4gICAgICAgICAgICBpZiAodGFnID09IFwic3ZnXCIpe1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgdGFnKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgdGFnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgfVxuICAgICAgICBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lke1xuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobyBpbnN0YW5jZW9mIFNWR0VsZW1lbnQpe1xuICAgICAgICAgICAgICAgIHN2Z2V4dGVuZChvLCBqc29uKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN2Z2V4dGVuZChlbDphbnksIGpzb246YW55KXtcbiAgICAgICAgbGV0IGNzID0gZWwuY3Vyc29yO1xuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBlbFtpXTtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZ0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z2V4dGVuZCh0YXJnZXQsIGpzb25baV0pO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2UgaWYgKGkgPT0gXCIkXCIpe1xuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIGpzb25baV07XG4gICAgICAgICAgICAgICAgaWYgKGpzb25baV0gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaiBvZiBqc29uW2ldKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqLCBjcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kKGVsLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9lbC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShqc29uW2ldLCBjcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVuZChlbCwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9lbC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZSBpZiAoaS5zdGFydHNXaXRoKFwiJFwiKSl7XG4gICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbFtpXSAmJiB0eXBlb2YoZWxbaV0pID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamV4dGVuZChlbFtpXSwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMobnVsbCwgaSwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZm91bmRhdGlvbi9kZWZpbml0aW9ucy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi91c2UudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZG9tY3JlYXRvci50c1wiIC8+XG5cbm5hbWVzcGFjZSB3b3tcbiAgICBleHBvcnQgbGV0IFdpZGdldHM6YW55ID0ge307XG5cbiAgICBleHBvcnQgY2xhc3MgVWlDcmVhdG9yIGV4dGVuZHMgQ3JlYXRvcntcbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmlkID0gXCJ1aVwiO1xuICAgICAgICB9XG4gICAgICAgIGNyZWF0ZShqc29uOmFueSk6Tm9kZXtcbiAgICAgICAgICAgIGlmIChqc29uID09IG51bGwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHdnID0ganNvblt0aGlzLmlkXTtcbiAgICAgICAgICAgIGlmICghV2lkZ2V0c1t3Z10pe1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZWw6Tm9kZSA9IHVzZShXaWRnZXRzW3dnXSk7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH1cbiAgICAgICAgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZHtcbiAgICAgICAgICAgIGlmIChqc29uIGluc3RhbmNlb2YgTm9kZSB8fCBqc29uIGluc3RhbmNlb2YgRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBkb21hcHBseShvLCBqc29uKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChqc29uLiQgJiYgbyBpbnN0YW5jZW9mIE5vZGUpe1xuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xuICAgICAgICAgICAgfWVsc2UgaWYgKG8uZXh0ZW5kKXtcbiAgICAgICAgICAgICAgICBvLmV4dGVuZChqc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBkb21hcHBseShlbDphbnksIGpzb246YW55KXtcbiAgICAgICAgbGV0IGNzID0gZWwuY3Vyc29yO1xuICAgICAgICBmb3IobGV0IGkgaW4ganNvbil7XG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBlbFtpXTtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgdnR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZ0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFwcGx5KHRhcmdldCwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxbaV0gPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcIiRcIil7XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YganNvbltpXTtcbiAgICAgICAgICAgICAgICBsZXQgamkgPSBqc29uW2ldO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgamkgPSBbamldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoamkgaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBub2RlcyA9IGVsLmNoaWxkTm9kZXM7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7IGo8amkubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBqc29uW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGogPCBub2Rlcy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFwcGx5KG5vZGVzW2pdLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHVzZShpdGVtLCBjcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmQoZWwsIGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcbiAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsW2ldICYmIHR5cGVvZihlbFtpXSkgPT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZXh0ZW5kKGVsW2ldLCBqc29uW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoaSwganNvbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZm91bmRhdGlvbi9kZWZpbml0aW9ucy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWlsZGVyL3VzZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWlsZGVyL2RvbWNyZWF0b3IudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVpbGRlci9zdmdjcmVhdG9yLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1aWxkZXIvdWljcmVhdG9yLnRzXCIgLz5cblxud28uQ3JlYXRvcnMuYWRkKG5ldyB3by5Eb21DcmVhdG9yKCkpO1xud28uQ3JlYXRvcnMuYWRkKG5ldyB3by5TdmdDcmVhdG9yKCkpO1xud28uQ3JlYXRvcnMuYWRkKG5ldyB3by5VaUNyZWF0b3IoKSk7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZm91bmRhdGlvbi9lbGVtZW50cy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxuXG5uYW1lc3BhY2Ugd297XG4gICAgV2lkZ2V0cy5jb3ZlciA9IHtcbiAgICAgICAgdGFnOlwiZGl2XCIsXG4gICAgICAgIGNsYXNzOlwiY292ZXJcIixcbiAgICAgICAgc3R5bGU6e2Rpc3BsYXk6J25vbmUnfSxcbiAgICAgICAgc2hvdzpmdW5jdGlvbigpOnZvaWR7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgfSxoaWRlOmZ1bmN0aW9uKCk6dm9pZHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfSxtYWRlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IGN2ID0gKGRvY3VtZW50LmJvZHkgYXMgYW55KS4kZ2N2JDtcbiAgICAgICAgICAgIGlmIChjdil7XG4gICAgICAgICAgICAgICAgd28uZGVzdHJveShjdik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMpO1xuICAgICAgICAgICAgKGRvY3VtZW50LmJvZHkgYXMgYW55KS4kZ2N2JCA9IHRoaXM7XG4gICAgICAgIH0sb25jbGljazpmdW5jdGlvbihldmVudDphbnkpe1xuICAgICAgICAgICAgaWYgKHRoaXMuJCR0b3VjaGNsb3NlKXtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZm91bmRhdGlvbi9lbGVtZW50cy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYnVpbGRlci91aWNyZWF0b3IudHNcIiAvPlxuXG5uYW1lc3BhY2Ugd297XG4gICAgV2lkZ2V0cy5jYXJkID0ge1xuICAgICAgICB0YWc6XCJkaXZcIixcbiAgICAgICAgY2xhc3M6XCJjYXJkXCIsXG4gICAgICAgIHNldHZhbDogZnVuY3Rpb24odmFsOmFueSk6dm9pZHtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB2YWwpe1xuICAgICAgICAgICAgICAgICQodGhpc1tcIiRcIiArIGldKS50ZXh0KHZhbFtpXSk7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgICQ6W1xuICAgICAgICAgICAge3RhZzpcImRpdlwiLCBjbGFzczpcInRpdGxlXCIsIGFsaWFzOlwidGl0bGVcIn0sXG4gICAgICAgICAgICB7dGFnOlwiZGl2XCIsIGNsYXNzOlwiYm9keVwiLCBhbGlhczpcImJvZHlcIn1cbiAgICAgICAgXVxuICAgIH1cbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
