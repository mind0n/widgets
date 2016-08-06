/// <reference path="../foundation/definitions.ts" />
/// <reference path="./use.ts" />

namespace wo{
    export class SvgCreator extends Creator{
        constructor(){
            super();
            this.id = "sg";
        }
        verify(i:string, json:any){
            if (i.startsWith("$$")){
                return this.applyattr;
            }else if (i == '$'){
                return this.applychild;
            }else if (i.startsWith("$")){
                return objextend;
            }else{
                return this.applyprop;
            }
        }
        create(json:any):Node{
            if (json == null){
                return null;
            }
            let tag = json[this.id];
            let el:Node;
            let xmlns = "http://www.w3.org/2000/svg";
            if (tag == "svg"){
                el = document.createElementNS(xmlns, tag);
            }else{
                el = document.createElementNS(xmlns, tag);
            }
            return el;
        }
        extend(o:any, json:any):void{
            if (json instanceof Node || json instanceof Element){
                debugger;
                return;
            }
            if (o instanceof SVGElement){
                jextend.call(this, o, json, this);
            }else if (json.$ && o instanceof Node){
                o.nodeValue = json.$;
            }else if (o.extend){
                o.extend(json);
            } 
        }
        protected setattr(el:any, json:any, i:string){
            if (el instanceof SVGElement){
                return el.setAttributeNS(null, i, json[i]);
            }else{
                console.dir(el);
                return el.setAttribute(i, json[i]);
            }
        }
    }
}