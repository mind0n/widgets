
namespace fingers{
    class Rot{
        protected origin:any;
        protected cmt:any;
        protected cache:any;

        protected status:any[];

        protected target:any;
        protected center:any;
        protected offset:number[];
        constructor(el:any){
            if (!el){
                return;
            }
            this.target = el;
            el.$rot$ = this;
            let pos = [el.astyle(["left"]), el.astyle(["top"])];
            el.style.left = pos[0];
            el.style.top = pos[1];
            let rc = el.getBoundingClientRect();
            this.origin = {
                center:[rc.width/2, rc.height/2], 
                angle:0, 
                scale:[1,1], 
                pos:[parseFloat(pos[0]), parseFloat(pos[1])],
                size:[rc.width, rc.height]
            };
            this.cmt = {
                center:[rc.width/2, rc.height/2], 
                angle:0, 
                scale:[1,1], 
                pos:[parseFloat(pos[0]), parseFloat(pos[1])],
                size:[rc.width, rc.height]
            };
            this.cache = {
                center:[rc.width/2, rc.height/2], 
                angle:0, 
                scale:[1,1], 
                pos:[parseFloat(pos[0]), parseFloat(pos[1])],
                size:[rc.width, rc.height]
            };

            this.status = [];

            this.center = document.createElement("div");
            this.center.style.position = 'absolute';
			this.center.style.left = '50%';
			this.center.style.top = '50%';
			this.center.style.width = '0px';
			this.center.style.height = '0px';
			this.center.style.border = 'solid 0px blue';

			el.appendChild(this.center);
            this.setOrigin(this.origin.center);
            el.style.transform = "rotate(0deg)";
            this.pushStatus();
        }
        protected getCenter():number[]{
            let rc = this.center.getBoundingClientRect();
            return [rc.left, rc.top];
        }
        protected setOrigin(p:number[]):void{
            this.target.style.transformOrigin = p[0] + "px " + p[1] + "px";
        }
        protected correct(status:any, poffset?:number[]):number[]{
            if (!poffset){
                poffset = [0, 0];
            }
            let d = status.delta;
            let x = parseFloat(this.target.astyle["left"]) - d.center[0];
            let y = parseFloat(this.target.astyle["top"]) - d.center[1];
            this.offset = [poffset[0] + d.center[0], poffset[1] + d.center[1]];
            this.target.style.left = x + "px";
            this.target.style.top = y + "px";
            return this.offset;
        }
        protected commitStatus():void{
            this.cmt = this.cache;
            this.cmt.pos = [parseFloat(this.target.style.left), parseFloat(this.target.style.top)];
            this.cmt.size = [parseFloat(this.target.style.width), parseFloat(this.target.style.height)];
            this.cache = {angle:0, scale:[1,1], pos:[0,0], size:[0,0]};
            this.offset = [0, 0];
        }
        protected pushStatus():void{
            let c = this.getCenter();
            let l = [parseFloat(this.target.astyle(["left"])),parseFloat(this.target.astyle(["top"]))];
            let s:any = {center:[c[0], c[1]], pos:l};
            let q = this.status;
            let p = q.length > 0?q[q.length - 1] : s;
            s.delta = { center:[s.center[0] - p.center[0], s.center[1] - p.center[1]],
                pos: [s.pos[0] - p.pos[0], s.pos[1] - p.pos[1]]};
            q[q.length] = s;
            if (q.length > 6){
                q.splice(0, 1);
            }
            return s;
        }
    }
    export function Rotator(el:any):any{
        let r = new Rot(el);
        return r;
    }
}

