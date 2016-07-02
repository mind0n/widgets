wo.Creators.add(new wo.DomCreator());

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
        for (var i in json) {
            if (i.startsWith("$$")) {
                el.setAttribute(i, json[i]);
            }
            else if (i == "$") {
                var type = typeof json[i];
                if (json[i] instanceof Array) {
                    for (var _i = 0, _a = json[i]; _i < _a.length; _i++) {
                        var j = _a[_i];
                        var child = wo.use(j);
                        if (child != null) {
                            el.appendChild(child);
                        }
                    }
                }
                else if (type == 'object') {
                    var child = wo.use(json[i]);
                    if (child != null) {
                        el.appendChild(child);
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
        }
    }
})(wo || (wo = {}));

var wo;
(function (wo) {
    wo.Creators = [];
    var Cursor = (function () {
        function Cursor() {
        }
        return Cursor;
    }());
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
        Creator.prototype.Create = function (json) {
            var o = this.create(json);
            delete json[this.Id];
            this.extend(o, json);
            return o;
        };
        return Creator;
    }());
    wo.Creator = Creator;
    function use(json) {
        for (var _i = 0, Creators_1 = wo.Creators; _i < Creators_1.length; _i++) {
            var i = Creators_1[_i];
            if (json[i.Id]) {
                return i.Create(json);
            }
        }
        return null;
    }
    wo.use = use;
})(wo || (wo = {}));

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvL3dvLnRzIiwid28vYnVpbGRlci9kb21jcmVhdG9yLnRzIiwid28vYnVpbGRlci91c2UudHMiLCJ3by9mb3VuZGF0aW9uL2RlZmluaXRpb25zLnRzIiwid28vZm91bmRhdGlvbi9kZXZpY2UudHMiLCJ3by9mb3VuZGF0aW9uL2VsZW1lbnRzLnRzIiwid28vZm91bmRhdGlvbi9zdHJpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzs7Ozs7OztBQ0FyQyxJQUFPLEVBQUUsQ0E0RVI7QUE1RUQsV0FBTyxFQUFFLEVBQUEsQ0FBQztJQUNOO1FBQWdDLDhCQUFPO1FBQ25DO1lBQ0ksaUJBQU8sQ0FBQztZQUNSLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7UUFDRCwyQkFBTSxHQUFOLFVBQU8sSUFBUTtZQUNYLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO2dCQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEIsSUFBSSxFQUFPLENBQUM7WUFDWixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUEsQ0FBQztnQkFDaEIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFDRCxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUNELDJCQUFNLEdBQU4sVUFBTyxDQUFLLEVBQUUsSUFBUTtZQUNsQixFQUFFLENBQUMsQ0FB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QyxDQUFDIiwiZmlsZSI6IndvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbndvLkNyZWF0b3JzLmFkZChuZXcgd28uRG9tQ3JlYXRvcigpKTsiLCJcclxubW9kdWxlIHdve1xyXG4gICAgZXhwb3J0IGNsYXNzIERvbUNyZWF0b3IgZXh0ZW5kcyBDcmVhdG9ye1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBcInRhZ1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjcmVhdGUoanNvbjphbnkpOk5vZGV7XHJcbiAgICAgICAgICAgIGlmIChqc29uID09IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHRhZyA9IGpzb25bdGhpcy5pZF07XHJcbiAgICAgICAgICAgIGxldCBlbDpOb2RlO1xyXG4gICAgICAgICAgICBpZiAodGFnID09ICcjdGV4dCcpe1xyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0YWcpO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyBcclxuICAgICAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXh0ZW5kKG86YW55LCBqc29uOmFueSk6dm9pZHtcclxuICAgICAgICAgICAgaWYgKGpzb24gaW5zdGFuY2VvZiBOb2RlIHx8IGpzb24gaW5zdGFuY2VvZiBFbGVtZW50KXtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xyXG4gICAgICAgICAgICAgICAgZG9tZXh0ZW5kKG8sIGpzb24pO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoanNvbi4kICYmIG8gaW5zdGFuY2VvZiBOb2RlKXtcclxuICAgICAgICAgICAgICAgIG8ubm9kZVZhbHVlID0ganNvbi4kO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoby5leHRlbmQpe1xyXG4gICAgICAgICAgICAgICAgby5leHRlbmQoanNvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZG9tZXh0ZW5kKGVsOkhUTUxFbGVtZW50LCBqc29uOmFueSl7XHJcbiAgICAgICAgZm9yKGxldCBpIGluIGpzb24pe1xyXG4gICAgICAgICAgICBpZiAoaS5zdGFydHNXaXRoKFwiJCRcIikpe1xyXG4gICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGksIGpzb25baV0pO1xyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoaSA9PSBcIiRcIil7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiBqc29uW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb25baV0gaW5zdGFuY2VvZiBBcnJheSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBqIG9mIGpzb25baV0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2Uoaik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB1c2UoanNvbltpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5hcHBlbmRDaGlsZChjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpLnN0YXJ0c1dpdGgoXCIkXCIpKXtcclxuICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZWxbaV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZ0eXBlID0gdHlwZW9mIGpzb25baV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZ0eXBlID09ICdvYmplY3QnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tZXh0ZW5kKHRhcmdldCwganNvbltpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsW2ldID0ganNvbltpXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbFtpXSA9IGpzb25baV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59IiwiXHJcbm1vZHVsZSB3b3tcclxuICAgIGV4cG9ydCBsZXQgQ3JlYXRvcnM6Q3JlYXRvcltdID0gW107XHJcblxyXG4gICAgY2xhc3MgQ3Vyc29ye1xyXG4gICAgICAgIHBhcmVudDphbnk7XHJcbiAgICAgICAgZ3JvdXA6YW55O1xyXG4gICAgICAgIHJvb3Q6YW55O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDcmVhdG9ye1xyXG4gICAgICAgIGlkOnN0cmluZztcclxuICAgICAgICBnZXQgSWQoKTpzdHJpbmd7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBDcmVhdGUoanNvbjphbnkpOmFueXtcclxuICAgICAgICAgICAgdmFyIG8gPSB0aGlzLmNyZWF0ZShqc29uKTtcclxuICAgICAgICAgICAgZGVsZXRlIGpzb25bdGhpcy5JZF07XHJcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5kKG8sIGpzb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gbztcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZShqc29uOmFueSk6YW55O1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBleHRlbmQobzphbnksIGpzb246YW55KTp2b2lkO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiB1c2UoanNvbjphbnkpOmFueXtcclxuICAgICAgICBmb3IodmFyIGkgb2YgQ3JlYXRvcnMpe1xyXG4gICAgICAgICAgICBpZiAoanNvbltpLklkXSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaS5DcmVhdGUoanNvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn0iLCJpbnRlcmZhY2UgV2luZG93e1xyXG5cdG9wcjphbnk7XHJcblx0b3BlcmE6YW55O1xyXG5cdGNocm9tZTphbnk7XHJcblx0U3R5bGVNZWRpYTphbnk7XHJcblx0SW5zdGFsbFRyaWdnZXI6YW55O1xyXG5cdENTUzphbnk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBEb2N1bWVudHtcclxuXHRkb2N1bWVudE1vZGU6YW55O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRWxlbWVudHtcclxuXHRbbmFtZTpzdHJpbmddOmFueTtcclxuXHRhc3R5bGUoc3R5bGVzOnN0cmluZ1tdKTpzdHJpbmc7XHJcblx0ZGVzdHJveVN0YXR1czphbnk7XHJcblx0ZGlzcG9zZSgpOmFueTtcclxufVxyXG5cclxuaW50ZXJmYWNlIFN0cmluZ3tcclxuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XHJcbn1cclxuXHJcbmludGVyZmFjZSBBcnJheTxUPntcclxuXHRhZGQoaXRlbTpUKTp2b2lkO1xyXG59XHJcblxyXG5BcnJheS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGl0ZW06YW55KSB7XHJcblx0dGhpc1t0aGlzLmxlbmd0aF0gPSBpdGVtO1xyXG59IiwiY2xhc3MgTW9iaWxlRGV2aWNle1xyXG5cdHN0YXRpYyBnZXQgQW5kcm9pZCAoKTpib29sZWFuIHtcclxuXHRcdHZhciByID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQW5kcm9pZC9pKTtcclxuXHRcdGlmIChyKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gciE9IG51bGwgJiYgci5sZW5ndGg+MDtcclxuXHR9XHJcblx0c3RhdGljIGdldCBCbGFja0JlcnJ5KCk6Ym9vbGVhbiB7XHJcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0JsYWNrQmVycnkvaSk7XHJcblx0XHRpZiAocikge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHIhPW51bGwgJiYgci5sZW5ndGggPiAwO1xyXG5cdH1cclxuXHRzdGF0aWMgZ2V0IGlPUygpOmJvb2xlYW4ge1xyXG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUGhvbmV8aVBhZHxpUG9kL2kpO1xyXG5cdFx0aWYgKHIpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ21hdGNoIEFuZHJvaWQnKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByICE9IG51bGwgJiYgci5sZW5ndGggPiAwO1xyXG5cdH1cclxuXHRzdGF0aWMgZ2V0IE9wZXJhKCk6Ym9vbGVhbiB7XHJcblx0XHR2YXIgciA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL09wZXJhIE1pbmkvaSk7XHJcblx0XHRpZiAocikge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnbWF0Y2ggQW5kcm9pZCcpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHIgIT0gbnVsbCAmJiByLmxlbmd0aCA+IDA7XHJcblx0fVxyXG5cdHN0YXRpYyBnZXQgV2luZG93cygpOmJvb2xlYW4ge1xyXG5cdFx0dmFyIHIgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9JRU1vYmlsZS9pKTtcclxuXHRcdGlmIChyKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdtYXRjaCBBbmRyb2lkJyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gciE9IG51bGwgJiYgci5sZW5ndGggPjA7XHJcblx0fVxyXG5cdHN0YXRpYyBnZXQgYW55KCk6Ym9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKE1vYmlsZURldmljZS5BbmRyb2lkIHx8IE1vYmlsZURldmljZS5CbGFja0JlcnJ5IHx8IE1vYmlsZURldmljZS5pT1MgfHwgTW9iaWxlRGV2aWNlLk9wZXJhIHx8IE1vYmlsZURldmljZS5XaW5kb3dzKTtcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEJyb3dzZXJ7XHJcblx0c3RhdGljIGdldCBpc09wZXJhKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiAoISF3aW5kb3cub3ByICYmICEhd2luZG93Lm9wci5hZGRvbnMpIHx8ICEhd2luZG93Lm9wZXJhIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIE9QUi8nKSA+PSAwO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGdldCBpc0ZpcmVmb3goKTpib29sZWFue1xyXG5cdFx0cmV0dXJuIHR5cGVvZiB3aW5kb3cuSW5zdGFsbFRyaWdnZXIgIT09ICd1bmRlZmluZWQnO1xyXG5cdH1cclxuXHRzdGF0aWMgZ2V0IGlzU2FmYXJpKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoSFRNTEVsZW1lbnQpLmluZGV4T2YoJ0NvbnN0cnVjdG9yJykgPiAwO1xyXG5cdH0gXHJcblx0c3RhdGljIGdldCBpc0lFKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiBmYWxzZSB8fCAhIWRvY3VtZW50LmRvY3VtZW50TW9kZTtcclxuXHR9XHJcblx0c3RhdGljIGdldCBpc0VkZ2UoKTpib29sZWFue1xyXG5cdFx0cmV0dXJuICFCcm93c2VyLmlzSUUgJiYgISF3aW5kb3cuU3R5bGVNZWRpYTtcclxuXHR9XHJcblx0c3RhdGljIGdldCBpc0Nocm9tZSgpOmJvb2xlYW57XHJcblx0XHRyZXR1cm4gISF3aW5kb3cuY2hyb21lICYmICEhd2luZG93LmNocm9tZS53ZWJzdG9yZTtcclxuXHR9XHJcblx0c3RhdGljIGdldCBpc0JsaW5rKCk6Ym9vbGVhbntcclxuXHRcdHJldHVybiAoQnJvd3Nlci5pc0Nocm9tZSB8fCBCcm93c2VyLmlzT3BlcmEpICYmICEhd2luZG93LkNTUztcclxuXHR9XHJcbn1cclxuXHJcbiIsIlxyXG5FbGVtZW50LnByb3RvdHlwZS5hc3R5bGUgPSBmdW5jdGlvbiBhY3R1YWxTdHlsZShwcm9wczpzdHJpbmdbXSkge1xyXG5cdGxldCBlbDpFbGVtZW50ID0gdGhpcztcclxuXHRsZXQgY29tcFN0eWxlOkNTU1N0eWxlRGVjbGFyYXRpb24gPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCk7XHJcblx0Zm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdGxldCBzdHlsZTpzdHJpbmcgPSBjb21wU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wc1tpXSk7XHJcblx0XHRpZiAoc3R5bGUgIT0gbnVsbCkge1xyXG5cdFx0XHRyZXR1cm4gc3R5bGU7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiBudWxsO1xyXG59O1xyXG5tb2R1bGUgd297XHJcblx0Y2xhc3MgRGVzdHJveWVye1xyXG5cdFx0ZGlzcG9zaW5nOmJvb2xlYW47XHJcblx0XHRkZXN0cm95aW5nOmJvb2xlYW47XHJcblx0XHRzdGF0aWMgY29udGFpbmVyOkhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHRcdHN0YXRpYyBkZXN0cm95KHRhcmdldDpFbGVtZW50KXtcclxuXHRcdFx0aWYgKCF0YXJnZXQuZGVzdHJveVN0YXR1cyl7XHJcblx0XHRcdFx0dGFyZ2V0LmRlc3Ryb3lTdGF0dXMgPSBuZXcgRGVzdHJveWVyKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHRhcmdldC5kaXNwb3NlICYmICF0YXJnZXQuZGVzdHJveVN0YXR1cy5kaXNwb3Npbmcpe1xyXG5cdFx0XHRcdHRhcmdldC5kZXN0cm95U3RhdHVzLmRpc3Bvc2luZyA9IHRydWU7XHJcblx0XHRcdFx0dGFyZ2V0LmRpc3Bvc2UoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIXRhcmdldC5kZXN0cm95U3RhdHVzLmRlc3Ryb3lpbmcpe1xyXG5cdFx0XHRcdHRhcmdldC5kZXN0cm95U3RhdHVzLmRlc3Ryb3lpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdERlc3Ryb3llci5jb250YWluZXIuYXBwZW5kQ2hpbGQodGFyZ2V0KTtcclxuXHRcdFx0XHRmb3IobGV0IGkgaW4gdGFyZ2V0KXtcclxuXHRcdFx0XHRcdGlmIChpLmluZGV4T2YoJyQnKSA9PSAwKXtcclxuXHRcdFx0XHRcdFx0bGV0IHRtcDphbnkgPSB0YXJnZXRbaV07XHJcblx0XHRcdFx0XHRcdGlmICh0bXAgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XHJcblx0XHRcdFx0XHRcdFx0dGFyZ2V0W2ldID0gbnVsbDtcclxuXHRcdFx0XHRcdFx0XHR0bXAgPSBudWxsO1xyXG5cdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRkZWxldGUgdGFyZ2V0W2ldO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdERlc3Ryb3llci5jb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGV4cG9ydCBmdW5jdGlvbiBkZXN0cm95KHRhcmdldDpFbGVtZW50KTp2b2lke1xyXG5cdFx0RGVzdHJveWVyLmRlc3Ryb3kodGFyZ2V0KTtcclxuXHR9XHJcblxyXG59IiwiaW50ZXJmYWNlIFN0cmluZ3tcclxuXHRzdGFydHNXaXRoKHN0cjpzdHJpbmcpOmJvb2xlYW47XHJcblx0Zm9ybWF0KC4uLnJlc3RBcmdzOmFueVtdKTpzdHJpbmc7XHJcbn1cclxuXHJcblN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aCA9IGZ1bmN0aW9uKHN0cjpzdHJpbmcpOmJvb2xlYW57XHJcblx0cmV0dXJuIHRoaXMuaW5kZXhPZihzdHIpPT0wO1xyXG59XHJcblN0cmluZy5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKCkge1xyXG5cdHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG5cdHZhciBzID0gdGhpcztcclxuXHRpZiAoIWFyZ3MgfHwgYXJncy5sZW5ndGggPCAxKSB7XHJcblx0XHRyZXR1cm4gcztcclxuXHR9XHJcblx0dmFyIHIgPSBzO1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG5cdFx0dmFyIHJlZyA9IG5ldyBSZWdFeHAoJ1xcXFx7JyArIGkgKyAnXFxcXH0nKTtcclxuXHRcdHIgPSByLnJlcGxhY2UocmVnLCBhcmdzW2ldKTtcclxuXHR9XHJcblx0cmV0dXJuIHI7XHJcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
