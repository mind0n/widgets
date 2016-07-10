/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    Widgets.card = {
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
                    {tag:"div", class:"wbtn", $:"X"}
                ]}
            ]},
            {tag:"div", class:"body", alias:"body"}
        ]
    }
}