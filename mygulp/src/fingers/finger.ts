/// <reference path="touch.ts" />
/// <reference path="zoomer.ts" />

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
                rlt = el.getarget?el.getarget():el
                rlt.$touchel$ = el;
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

    let activeEl:any;
    let cfg = touch({
        on:{ 
            tap:function(act:iact){
                activeEl = elAtPos(act.cpos);
            }
        },onact:function(inq:any){
        },onrecognized:function(act:iact){
            if (activeEl && activeEl.$zoomer$){
                let zm = activeEl.$zoomer$;
                for(let i of zm){
                    if (i.mapping[act.act]){
                        i.mapping[act.act](act, activeEl);
                    }
                }
            }
        }
    });
    cfg.enabled = true;

    export function finger(el:any):any{
        el.$touchable$ = true;
        return {
            zoomable:function(){
                let zoomer = new Zoom(el);
                return this;
            },zsizable:function(){
                let zsize = new Zsize(el);
                return this;
            },draggable:function(){
                let drag = new Drag(el);
                return this;
            }
        };
    }
}

let finger = fingers.finger;