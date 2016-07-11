/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    Widgets.card = function():any{
        return  {
            tag:"div",
            class:"card",
            setval: function(val:any):void{
                for(var i in val){
                    $(this["$" + i]).text(val[i]);
                }            
            },
            $:[
                {tag:"div", class:"title", $:[
                    {tag:"div", class:"txt", alias:"title"},
                    {tag:"div", class:"ctrls", $:[
                        {tag:"div", class:"wbtn", onclick: function(event:any){wo.destroy(this.$border);}, $:"X"}
                    ]}
                ]},
                {tag:"div", class:"body", alias:"body"}
            ]
        };
    }
}