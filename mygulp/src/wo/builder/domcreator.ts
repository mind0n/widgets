/// <reference path="./use.ts" />

module wo{
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

    function domextend(el:HTMLElement, json:any){
        for(let i in json){
            if (i.startsWith("$$")){
                el.setAttribute(i, json[i]);
            }else if (i == "$"){
                let type = typeof json[i];
                if (json[i] instanceof Array){
                    for(let j of json[i]){
                        let child = use(j);
                        if (child != null){
                            el.appendChild(child);
                        }
                    }
                }else if (type == 'object'){
                    let child = use(json[i]);
                    if (child != null){
                        el.appendChild(child);
                    }else{
                        debugger;
                    }
                }else{
                    el.innerHTML = json[i];
                }
            }else if (i.startsWith("$")){
                el[i] = json[i];
            }else{
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
            }
        }
    }

}