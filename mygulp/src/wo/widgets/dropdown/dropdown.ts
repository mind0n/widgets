/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    
    Widgets.dropdown = function():any{
        return  {
            tag:"div",
            class:"dropdown",
            bind:function(dat:any[]){
                if (!dat){
                    return;
                }
                let itmp = this.getAttribute("item-template");
                let list:any[] = [];
                for(let i of dat){

                    let it = wo.use({ui:itmp || "dropdown.simpleitem"});
                    if (it){
                        it.bind(i);
                        list.add(it);
                    }
                }
                this.set({body:{target:list}});
            },
            $:[
                {tag:"div", class:"body", alias:"body"}
            ]
        };
    }

    Widgets.dropdown.simpleitem = function():any{
        return {
            tag:'div',
            class:'simple-item',
            bind:function(dat:any):void{
                $(this).text(dat);
            }
        };
    }
}