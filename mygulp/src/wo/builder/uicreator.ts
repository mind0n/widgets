/// <reference path="../foundation/definitions.ts" />
/// <reference path="./use.ts" />
/// <reference path="./domcreator.ts" />

module wo{
    export let Widgets:any = {};

    export class UiCreator extends Creator{
        constructor(){
            super();
            this.id = "ui";
        }
        create(json:any):Node{
            if (json == null){
                return null;
            }
            
            let wg = json[this.id];
            if (!Widgets[wg]){
                return null;
            }

            let el:Node = use(wg);
            return el;
        }
        extend(o:any, json:any):void{
            if (json instanceof Node || json instanceof Element){
                debugger;
                return;
            }

            if (o instanceof HTMLElement){
                domapply(o, json);
            }else if (json.$ && o instanceof Node){
                o.nodeValue = json.$;
            }else if (o.extend){
                o.extend(json);
            }
        }
    }

    export function domapply(el:any, json:any){
        let cs = el.cursor;
        for(let i in json){
            if (i.startsWith("$$")){
                let target = el[i];
                let type = typeof target;
                if (type == 'object'){
                    let vtype = typeof json[i];
                    if (vtype == 'object'){
                        domapply(target, json[i]);
                    }else{
                        el[i] = json[i];
                    }
                }else{
                    el[i] = json[i];
                }
            }else if (i == "$"){
                let type = typeof json[i];
                let ji = json[i];
                
                if (type == 'object'){
                    ji = [ji];
                }
                
                if (ji instanceof Array){
                    let nodes = el.childNodes;
                    for(let j = 0; j<ji.length; j++){
                        let item = json[j];
                        if (j < nodes.length){
                            domapply(nodes[j], item);
                        }else{
                            let child = use(item, cs);
                            if (child != null){
                                append(el, child);
                            }
                        }
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