
/// <reference path="recognizer.ts" />

namespace fingers{
    export abstract class Zoomer{
        protected sact:iact;
        protected pact:iact;
        protected started:boolean;
        mapping:{};
        constructor(el:any){
            if (!el.$zoomer$){
                el.$zoomer$ = [this];
            }else{
                el.$zoomer$[el.$zoomer$.length] = this;
            }
        }
    }

    export class Drag extends Zoomer{
        constructor(el:any){
            super(el);
            let zoomer = this;
            this.mapping = {
                dragstart:function(act:iact, el:any){
                    zoomer.sact = act;
                    zoomer.pact = act;
                    zoomer.started = true;
                }, dragging:function(act:iact, el:any){
                    if (zoomer.started){
                        let p = zoomer.pact;
                        let offset = [act.cpos[0] - p.cpos[0], act.cpos[1] - p.cpos[1]];
                        let delta = {offset: offset}; 
                        let l = el.astyle(["left"]);
                        let t = el.astyle(["top"]);
                        el.style.left = parseInt(l) + delta.offset[0] + "px";
                        el.style.top = parseInt(t) + delta.offset[1] + "px";
                        zoomer.pact = act;
                    }
                }, dragend:function(act:iact, el:any){
                    zoomer.started = false;
                }
            }
        }
    }

    export class Zoom extends Zoomer{
        constructor(el:any){
            super(el);
            let zoomer = this;
            this.mapping = {
                zoomstart:function(act:iact, el:any){
                    zoomer.sact = act;
                    zoomer.pact = act;
                    zoomer.started = true;
                }, zooming:function(act:iact, el:any){
                    if (zoomer.started){
                        let p = zoomer.sact;
                        let offset = [act.cpos[0] - p.cpos[0], act.cpos[1] - p.cpos[1]];
                        let rot = act.angle - p.angle;
                        let scale = act.len / p.len;
                        let delta = {offset: offset, angle:rot, scale:scale}; 
                        zoomer.pact = act;
                        console.dir(delta);
                    }
                }, zoomend:function(act:iact, el:any){
                    zoomer.started = false;
                }
            }
        }
    }
    
    export class Zsize extends Zoomer{
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
                        
                        let l = el.astyle(["left"]);
                        let t = el.astyle(["top"]);
                        
                        el.style.width = parseInt(w) + delta.resize[0] + "px";
                        el.style.height = parseInt(h) + delta.resize[1] + "px";

                        el.style.left = parseInt(l) + delta.offset[0] + "px";
                        el.style.top = parseInt(t) + delta.offset[1] + "px";
                        
                        zoomer.pact = act;
                    }
                },zoomend:function(act:iact, el:any){
                    zoomer.started = false;
                }
            }
        }
    }
}
