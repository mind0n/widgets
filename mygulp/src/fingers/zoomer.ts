
/// <reference path="recognizer.ts" />

namespace fingers{
    export abstract class Zoomer{
        protected sact:iact;
        protected pact:iact;
        protected started:boolean;
        mapping:{};
        constructor(el:any){
            el.$zoomer$ = this;
        }
    }
    export class Zoom extends Zoomer{
        delta:any;
        constructor(el:any){
            super(el);
            let zoomer = this;
            this.mapping = {
                zoomstart:function(act:iact, el:any){
                    zoomer.sact = act;
                    zoomer.pact = act;
                    zoomer.started = true;
                },zooming:function(act:iact, el:any){
                    if (zoomer.started){
                        let p = zoomer.pact;
                        let offset = [act.cpos[0] - p.cpos[0], act.cpos[1] - p.cpos[1]];
                        let rot = act.angle - p.angle;
                        let scale = act.len / p.len;
                        let delta = {offset: offset, angle:rot, scale:scale}; 
                        console.dir(delta);
                    }
                },zoomend:function(act:iact, el:any){
                    zoomer.started = false;
                }
            }
        }
    }
    export class Zsize extends Zoomer{
        delta:any;
        constructor(el:any){
            super(el);
            let zoomer = this;
            this.mapping = {
                zoomstart:function(act:iact, el:any){
                    zoomer.sact = act;
                    zoomer.pact = act;
                    zoomer.started = true;
                },zooming:function(act:iact, el:any){
                    if (zoomer.started){
                        let p = zoomer.pact;
                        let offset = [act.cpos[0] - p.cpos[0], act.cpos[1] - p.cpos[1]];
                        let resize = [act.owidth - p.owidth, act.oheight - p.oheight];
                        let delta = {offset: offset, resize:resize};
                        let w = el.astyle(["width"]);
                        let h = el.astyle(["height"]);
                        el.style.width = parseInt(w) + delta.resize[0] + "px";
                        el.style.height = parseInt(h) + delta.resize[1] + "px";
                        console.log(delta.resize);
                    }
                },zoomend:function(act:iact, el:any){
                    zoomer.started = false;
                }
            }
        }
    }
}
