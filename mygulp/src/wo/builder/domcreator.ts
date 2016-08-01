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
                jextend(o, json, this);
            }else if (json.$ && o instanceof Node){
                o.nodeValue = json.$;
            }else if (o.extend){
                o.extend(json);
            }
        }
        protected applychild(el:any, json:any, i:string, cs:any){
            let type = typeof json[i];
            if (json[i] instanceof Array){
                for(let j of json[i]){
                    let child = use(j, cs);
                    if (child != null){
                        append(el, child);
                    }
                }
            }else if (type == 'object'){
                let child = use(json[i], cs);
                if (child != null){
                    append(el, child);
                }else{
                    debugger;
                }
            }else{
                el.innerHTML = json[i];
            }
        }
    }
}