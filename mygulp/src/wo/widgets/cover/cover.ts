/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    Widgets.cover = {
        tag:"div",
        class:"cover",
        style:{display:'none'},
        show:function():void{
            this.style.display = '';
        },hide:function():void{
            this.style.display = 'none';
        },made: function(){
            let cv = (document.body as any).$gcv$;
            if (cv){
                wo.destroy(cv);
            }
            document.body.appendChild(this);
            (document.body as any).$gcv$ = this;
        }
    }
}