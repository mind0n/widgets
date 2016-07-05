/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />
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
//# sourceMappingURL=cover.js.map