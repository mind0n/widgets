/// <reference path="recognizer.ts" />

namespace fingers{
    let inited:boolean = false;
    export function finger(cfg:any):any{
        let rg:Recognizer = new Recognizer(cfg);

        function createAct(name:string, x:number, y:number):iact{
            return {act:name, cpos:[x, y], time:new Date().getTime()};
        }
        function handle(cfg:any, acts:iact[]):void{
            if (!cfg || !cfg.enabled){
                return;
            }
            rg.parse(acts);
            if (cfg.onact){
                cfg.onact(rg.inqueue);
            }
        }

        if (!inited){
            document.oncontextmenu = function(){
                return false;
            }
            document.addEventListener("mousedown", function(event){
                let act:iact = createAct("touchstart", event.clientX, event.clientY);
                handle(cfg, [act]);
            }, true);
            document.addEventListener("mousemove", function(event){
                let act:iact = createAct("touchmove", event.clientX, event.clientY);
                handle(cfg, [act]);
            }, true);
            document.addEventListener("mouseup", function(event){
                let act:iact = createAct("touchend", event.clientX, event.clientY);
                handle(cfg, [act]);
            }, true);
            inited = true;
        }
        return cfg;
    }
}

let finger = fingers.finger;