
namespace fingers{
    export interface ipattern{
        verify(acts:iact[], queue:any[], outq?:iact[]):boolean;
        recognize(queue:any[], outq?:iact[]):any;
    }

    export let Patterns:any = {};
    
    class TouchedPattern implements ipattern{
        verify(acts:iact[], queue:any[], outq?:iact[]):boolean{
            let rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0;
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
                if (!drag){ //(act.act == "touchstart" || act.act == "touchmove")
                    for(let i=0; i<3; i++){
                        let q = queue[i];
                        if (q[0].act == "touchstart"){
                            return {
                                act:"touched",
                                cpos:[act.cpos[0], act.cpos[1]],
                                time:act.time
                            }
                        }
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

    class DblTouchedPattern implements ipattern{
        verify(acts:iact[], queue:any[]):boolean{
            let rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0;
            //console.log("verify dbltouched ...", rlt);
            return rlt;
        }

        recognize(queue:any[], outq:iact[]):any{
            let prev = queue[1];
            // debugger;
            if (prev && prev.length == 1){
                let act = prev[0];
                //console.log("pact ...", act.act);
                if (outq != null && outq.length > 0){
                    let pact:any = outq[0];
                    if (pact && pact.act == "touched"){
                        if (act.act == "touchstart" || act.act == "touchmove"){
                            if (act.time - pact.time < 500){
                                return {
                                    act:"dbltouched",
                                    cpos:[act.cpos[0], act.cpos[1]],
                                    time:act.time
                                };
                            }else{
                                return {
                                    act:"touched",
                                    cpos:[act.cpos[0], act.cpos[1]],
                                    time:act.time
                                };
                            }
                        }
                    }
                }
            }
            return null;
        }
    }

    class ZoomStartPattern implements ipattern{
        verify(acts:iact[], queue:any[], outq?:iact[]):boolean{
            let rlt = acts.length == 2 
                && ((acts[0].act == "touchstart" || acts[1].act == "touchstart")
                    ||(outq.length > 0 
                        && acts[0].act == "touchmove" 
                        && acts[1].act == "touchmove" 
                        && outq[0].act != "zooming" 
                        && outq[0].act != "zoomstart" ));
                //&& (outq.length < 1 || (outq[0].act != "")); 
            //console.log("verify zoomstart ...", rlt);
            return rlt;
        }

        recognize(queue:any[], outq:iact[]):any{
            let acts = queue[0];
            let a:iact = acts[0];
            let b:iact = acts[1];
            let len = Math.sqrt((b.cpos[0] - a.cpos[0])*(b.cpos[0] - a.cpos[0]) + (b.cpos[1] - a.cpos[1])*(b.cpos[1] - a.cpos[1]));
            let ag = Math.asin((b.cpos[1] - a.cpos[1])/len) / Math.PI * 180;
            let r:iact = {
                act:"zoomstart",
                cpos:[(a.cpos[0] + b.cpos[0])/2, (a.cpos[1] + b.cpos[1])/2],
                len:len,
                angle:ag,
                time:a.time
            };
            console.log(r.cpos, r.len, r.angle);
            return r;
        }
    }

    class ZoomPattern implements ipattern{
        verify(acts:iact[], queue:any[], outq?:iact[]):boolean{
            let rlt = acts.length == 2 
                && (acts[0].act != "touchend" && acts[1].act != "touchend")
                && (acts[0].act == "touchmove" || acts[1].act == "touchmove")
                && outq.length > 0
                && (outq[0].act == "zoomstart" || outq[0].act == "zooming");
                //&& (outq.length < 1 || (outq[0].act != "")); 
            //console.log("verify zoomstart ...", rlt);
            return rlt;
        }

        recognize(queue:any[], outq:iact[]):any{
            let acts = queue[0];
            let a:iact = acts[0];
            let b:iact = acts[1];
            let len = Math.sqrt((b.cpos[0] - a.cpos[0])*(b.cpos[0] - a.cpos[0]) + (b.cpos[1] - a.cpos[1])*(b.cpos[1] - a.cpos[1]));
            let ag = Math.asin((b.cpos[1] - a.cpos[1])/len) / Math.PI * 180;
            let r:iact = {
                act:"zooming",
                cpos:[(a.cpos[0] + b.cpos[0])/2, (a.cpos[1] + b.cpos[1])/2],
                len:len,
                angle:ag,
                time:a.time
            };
            console.log(r.cpos, r.len, r.angle);
            return r;
        }
    }

    class ZoomEndPattern implements ipattern{
        verify(acts:iact[], queue:any[], outq?:iact[]):boolean{
            let rlt = outq.length > 0 
                && (outq[0].act == "zoomstart" || outq[0].act == "zooming")
                && acts.length <=2;
            if (rlt){
                //console.dir(acts);
                if (acts.length < 2){
                    return true;
                }else{
                    for(let i of acts){
                        if (i.act == "touchend"){
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        recognize(queue:any[], outq:iact[]):any{
            let r:iact = {
                act:"zoomend",
                cpos:[0, 0],
                len:0,
                angle:0,
                time:new Date().getTime()
            };

            return r;
        }
    }

    Patterns.zoomend = new ZoomEndPattern();
    Patterns.zooming = new ZoomPattern();
    Patterns.zoomstart = new ZoomStartPattern();
    Patterns.dragging = new DraggingPattern();
    Patterns.dropped = new DropPattern();
    Patterns.touched = new TouchedPattern();
    Patterns.dbltouched = new DblTouchedPattern();
}
