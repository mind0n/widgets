/// <reference path="../foundation/definitions.ts" />
/// <reference path="./use.ts" />

namespace wo{
    export class DomCreator extends Creator{
        constructor(){
            super();
            this.id = "tag";
        }
        create(json:any):Node{
            if (json == null){
                return null;
            }
            let tag = json[this.id];
            let el:Node;
            if (tag == '#text'){
                el = document.createTextNode(tag);
            } else { 
                el = document.createElement(tag);
            }
            return el;
        }
        verify(i:string, json:any){
            if (i.startsWith("$$")){
                return this.applyattr;
            }else if (i == "$"){
                return this.applychild;
            }else if (i.startsWith("$")){
                return objextend;
            }else{
                return this.applyprop;
            }
        }
        extend(o:any, json:any):void{
            if (json instanceof Node || json instanceof Element){
                debugger;
                return;
            }

            if (o instanceof HTMLElement){
                //domextend(o, json);
                jextend.call(this, o, json, this);
            }else if (json.$ && o instanceof Node){
                o.nodeValue = json.$;
            }else if (o.extend){
                o.extend(json);
            }
        }
    }
}