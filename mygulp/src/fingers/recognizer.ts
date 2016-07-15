/// <reference path="../wo/foundation/definitions.ts" />
/// <reference path="./patterns.ts" />

namespace fingers{
    export interface iact{
        act:string,
        cpos:number[],
        rpos?:number[],
        time?:number
    }

    Patterns.touched = new TouchedPattern();

    export class Recognizer{
        inqueue:any[] = [];
        outqueue:iact[] = [];
        patterns:ipattern[] = [];
        cfg:any;

        constructor(cfg:any){
            let defpatterns = ["touched"];
            if (!cfg){
                cfg = {patterns:defpatterns};
            }
            if (!cfg.patterns){
                cfg.patterns = defpatterns;
            }
            this.cfg = cfg;
            for(let i of cfg.patterns){
                if (Patterns[i]){
                    this.patterns.add(Patterns[i]);
                }
            }
        }

        parse(acts:iact[]):void{
            this.inqueue.add(acts);
            for(let pattern of this.patterns){
                if (pattern.verify(acts, this.inqueue)){
                    let rlt = pattern.recognize(this.inqueue);
                    if (rlt){
                        this.outqueue.add(rlt);
                        let q = this.inqueue;
                        this.inqueue = [];
                        q.clear();
                        if (this.cfg.onrecognized){
                            this.cfg.onrecognized(rlt);
                        }
                        break;
                    }
                }
            }
        }
    }
}