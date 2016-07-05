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
        extend(o:any, json:any):void{
            if (json instanceof Node || json instanceof Element){
                debugger;
                return;
            }

            if (o instanceof HTMLElement){
                domextend(o, json);
            }else if (json.$ && o instanceof Node){
                o.nodeValue = json.$;
            }else if (o.extend){
                o.extend(json);
            }
        }
    }
    export function domextend(el:any, json:any){
        let cs = el.cursor;
        for(let i in json){
            if (i.startsWith("$$")){
                let target = el[i];
                let type = typeof target;
                if (type == 'object'){
                    let vtype = typeof json[i];
                    if (vtype == 'object'){
                        domextend(target, json[i]);
                    }else{
                        el[i] = json[i];
                    }
                }else{
                    el[i] = json[i];
                }
            }else if (i == "$"){
                let type = typeof json[i];
                if (json[i] instanceof Array){
                    for(let j of json[i]){
                        let child = use(j, cs);
                        if (child != null){
                            append(el, child);
                            //el.appendChild(child);
                        }
                    }
                }else if (type == 'object'){
                    let child = use(json[i], cs);
                    if (child != null){
                        //el.appendChild(child);
                        append(el, child);
                    }else{
                        debugger;
                    }
                }else{
                    el.innerHTML = json[i];
                }
            }else if (i.startsWith("$")){
                el[i] = json[i];
            }else{
                var type = typeof json[i];
                if (type == "function"){
                    el[i] = json[i];
                }else{
                    if (el[i] && typeof(el[i]) == 'object'){
                        objextend(el[i], json[i]);
                    }else{
                        el.setAttribute(i, json[i]);
                    }
                }
            }
        }
    }

}