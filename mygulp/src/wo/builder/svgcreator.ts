/// <reference path="./use.ts" />

module wo{
    export class SvgCreator extends Creator{
        constructor(){
            super();
            this.id = "sg";
        }
        create(json:any):Node{
            if (json == null){
                return null;
            }
            let tag = json[this.id];
            let el:Node;
            if (tag == "svg"){
                el = document.createElementNS("http://www.w3.org/2000/svg", tag);
            }else{
                el = document.createElementNS("http://www.w3.org/2000/svg", tag);
            }
            return el;
        }
        extend(o:any, json:any):void{
            if (json instanceof Node || json instanceof Element){
                debugger;
                return;
            }
            if (o instanceof SVGElement){
                svgextend(o, json);
            }else if (json.$ && o instanceof Node){
                o.nodeValue = json.$;
            }else if (o.extend){
                o.extend(json);
            }
        }
    }

    function svgextend(el:HTMLElement, json:any){
        for(let i in json){
            if (i.startsWith("$$")){
                let target = el[i];
                let type = typeof target;
                if (type == 'object'){
                    let vtype = typeof json[i];
                    if (vtype == 'object'){
                        svgextend(target, json[i]);
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
                el.setAttributeNS(null, i, json[i]);
            }
        }
    }

}