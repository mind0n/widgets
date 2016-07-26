/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    Widgets.dropdown = function():any{
        return  {
            tag:"div",
            class:"dropdown",
            set: function(val:any):void{
                for(let i in val){
                    let v = val[i];
                    let t = this["$" + i];
                    if (t){
                        if (typeof (v) == 'object'){
                            if (!v.mode || (v.mode == "prepend" && t.childNodes.length < 1)){
                                v.mode = "append";
                            }
                            if (v.mode == "replace"){
                                t.innerHTML = "";
                                v.mode = "append";
                            }
                            if (v.mode == "prepend"){
                                t.insertBefore(v.target, t.childNodes[0]);
                            }else{
                                t.appendChild(v.target);
                            }                            
                        }else{
                            $(t).text(v);
                        }
                    }
                }            
            },
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