
namespace fingers{
    export interface ipattern{
        verify(acts:iact[], queue:any[], outq?:iact[]):boolean;
        recognize(queue:any[], outq?:iact[]):any;
    }

    export let Patterns:any = {};
    
    class TouchedPattern implements ipattern{
        verify(acts:iact[], queue:any[]):boolean{
            let rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0;
            //console.log("verify touched ...", rlt);
            if (rlt){
                //debugger;
            }
            return rlt;
        }

        recognize(queue:any[], outq:iact[]):any{
            let prev = queue[1];
            //debugger;
            if (prev && prev.length == 1){
                let act = prev[0];
                //console.log("pact ...", act.act);
                let drag = false;
                if (outq != null && outq.length > 0){
                    let pact:any = outq[0];
                    if (pact && (pact.act == "dragging" || pact.act == "dragstart")){
                        drag = true;
                    }
                }
                if (!drag && (act.act == "touchstart" || act.act == "touchmove")){
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
            let rlt = acts.length == 1 
                && acts[0].act == "touchmove" 
                && queue.length > 2;
            if (rlt){
                rlt = false;
                let s1 = queue[2];
                let s2 = queue[1];
                if (s1.length == 1 && s2.length == 1){
                    let a1 = s1[0];
                    let a2 = s2[0];
                    if (a1.act == "touchstart"){
                        //debugger;
                    }
                    if (a1.act == "touchstart" && a2.act == "touchmove"){
                        rlt = true;
                    }else if (a1.act == "touchmove" && a2.act == "touchmove"){
                        rlt = true;
                    }
                } 
            }
            // if (rlt && queue[1][0] && queue[1][0].act == "touchstart"){
            //     debugger;
            // }
            //console.log("Verify dragging ...", rlt);
            return rlt;
        }

        recognize(queue:any[],outq:iact[]):any{
            let prev = queue[2];
            if (prev.length == 1){
                let act = prev[0];
                 
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

    class InvalidTouchPattern implements ipattern{
        verify(acts:iact[], queue:any[]):boolean{
            let rlt = acts.length == 1 && acts[0].act == "touchmove" && queue.length == 1;
            //console.log("verifying invtouched ... ", rlt, queue.length);
            return rlt;
        }

        recognize(queue:any[]):any{
            console.dir(queue);
            queue.clear();
            return null;
        }
    } 
    //Patterns.invtouched = new InvalidTouchPattern();
    Patterns.dragging = new DraggingPattern();
    Patterns.dropped = new DropPattern();
    Patterns.touched = new TouchedPattern();
}
