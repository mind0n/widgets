/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    Widgets.cover = {
        tag:"div",
        class:"cover",
        style:{display:'none'},
        show:function(callback:any):void{
            this.style.display = '';
            if (callback){
                callback(this);
            }
        },hide:function():void{
            if (this.$child){
                wo.destroy(this.$child);
                delete this.$child;
            }
            this.style.display = 'none';
        },made: function(){
            let cv = (document.body as any).$gcv$;
            if (cv){
                wo.destroy(cv);
            }
            document.body.appendChild(this);
            (document.body as any).$gcv$ = this;
        },onclick:function(event:any){
            if (this.$$touchclose){
                this.hide();
            }
        },append:function(child:any){
            this.$child = child;
            document.body.appendChild(child);
        }
    }
}