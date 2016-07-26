/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    Widgets.card = function():any{
        return  {
            tag:"div",
            class:"card",
            $:[
                {tag:"div", class:"title noselect", $:[
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