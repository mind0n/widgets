namespace fingers{
    let inited:boolean = false;
    interface iact{
        act:string,
        cpos:number[],
        rpos?:number[],
        time?:number
    }
    function handle(cfg:any, acts:iact[]):void{
        if (!cfg){
            return;
        }
        if (cfg.onact){
            cfg.onact(acts);
        }
    }
    function createAct(name:string, x:number, y:number):iact{
        return {act:name, cpos:[x, y], time:new Date().getTime()};
    }
    export function finger(cfg:any):any{
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
    }
}

let finger = fingers.finger;