
namespace fingers{
    export interface ipattern{
        verify(acts:iact[], queue:any[], outq?:iact[]):boolean;
        recognize(queue:any[], outq?:iact[]):any;
    }

    export let Patterns:any = {};
    
    class TouchedPattern implements ipattern{
        verify(acts:iact[], queue:any[]):boolean{
            let rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0;
            return rlt;
        }

        recognize(queue:any[]):any{
            let prev = queue[1];
            if (prev && prev.length == 1){
                let act = prev[0];
                if (act.act == "touchstart" || act.act == "touchmove"){
                    return {
                        act:"touched",
                        cpos:[act.cpos[0], act.cpos[1]],
                        time:act.time
                    }
                }
            }
            return null;
        }
    }
    
    class DraggingPattern implements ipattern{
        verify(acts:iact[], queue:any[]):boolean{
            let rlt = acts.length == 1 && acts[0].act == "touchmove" && queue.length > 1;
            // if (rlt && queue[1][0] && queue[1][0].act == "touchstart"){
            //     debugger;
            // }
            //console.log("Verify dragging ...", rlt);
            return rlt;
        }

        recognize(queue:any[],outq:iact[]):any{
            let prev = queue[1];
            if (prev.length == 1){
                let act = prev[0];
                console.log(act.act); 
                if (act.act == "touchstart"){
                    return {
                        act:"dragstart",
                        cpos:[act.cpos[0], act.cpos[1]],
                        time:act.time
                    };
                }else if (act.act == "touchmove" && outq.length > 0){
                    let ract = outq[0];
                    if (ract.act == "dragstart" || ract.act == "dragging"){
                        return {
                            act:"dragging",
                            cpos:[act.cpos[0], act.cpos[1]],
                            time:act.time
                        };
                    }
                }
            }
            return null;
        }
    }

    class DropPattern implements ipattern{
        verify(acts:iact[], queue:any[], outq?:iact[]):boolean{
            let rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0 && outq.length > 0;
            //console.log("Verifying drop ...", rlt);
            return rlt;
        }

        recognize(queue:any[],outq:iact[]):any{
            //let prev = queue[1];
            let act = outq[0];
            if (act.act == "dragging" || act.act == "dragstart"){
                return {
                    act:"dropped",
                    cpos:[act.cpos[0], act.cpos[1]],
                    time:act.time
                };
            }
            return null;
        }
    }
    Patterns.dragging = new DraggingPattern();
    Patterns.dropped = new DropPattern();
    Patterns.touched = new TouchedPattern();
}
