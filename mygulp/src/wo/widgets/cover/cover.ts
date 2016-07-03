/// <reference path="../../builder/uicreator.ts" />

module wo{
    Widgets.cover = {
        tag:"div",
        class:"cover",
        style:{display:'none'},
        show:function():void{
            this.style.display = '';
        },hide:function():void{
            this.style.display = 'none';
        }
    }
}