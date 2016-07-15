
namespace fingers{
    export interface ipattern{
        verify(acts:iact[], queue:any[]):boolean;
        recognize(queue:any[]):any;
    }

    export let Patterns:any = {};
    export class TouchedPattern implements ipattern{
        verify(acts:iact[], queue:any[]):boolean{
            let rlt = acts.length == 1 && acts[0].act == "touchend" && queue.length > 0;
            return rlt;
        }

        recognize(queue:any[]):any{
            let last = queue[1];
            if (last.length == 1){
                let act = last[0];
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
}
