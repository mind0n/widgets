/// <reference path="touch.ts" />

namespace fingers{
    function elAtPos(pos:number[]):any{
        let rlt:any = null;
        let cache:any[] = [];
        while(true){
            let el:any = document.elementFromPoint(pos[0], pos[1]);
            if (el == document.body || el.tagName.toLowerCase() == "html" || el == window){
                rlt = null;
                break;
            }else if (el.$evtrap$){
                rlt = null;
                break;
            }else if (el.$touchable$){
                rlt = el;
                break;
            }else{
                el.style.display = "none";
                cache.add(el);
            }
        }
        for(let i of cache){
            i.style.display = "";
        }
        return rlt;
    }
    let activeEl:Element;
    let cfg = touch({
        on:{ tap:function(act:iact){
            activeEl = elAtPos(act.cpos);
            if (activeEl){
                console.log(activeEl);
            }
        }},onact:function(inq:any){
        },onrecognized:function(act:iact){
        }
    });
    cfg.enabled = true;
    export function finger(el:any):void{
        el.$touchable$ = true;
    }
}

let finger = fingers.finger;