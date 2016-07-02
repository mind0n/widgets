module wo{

    /// Contains creator instance object
    export let Creators:Creator[] = [];

    class Cursor{
        parent:any;
        group:any;
        root:any;
    }

    export abstract class Creator{
        id:string;
        get Id():string{
            return this.id;
        }
        Create(json:any):any{
            var o = this.create(json);
            delete json[this.Id];
            if (o instanceof HTMLElement){
                this.extend(o, json);
            }
            return o;
        }
        protected abstract create(json:any):any;
        protected abstract extend(o:any, json:any):void;
    }

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
            let el:Node = (tag == '#text'? document.createTextNode(tag) : document.createElement(tag));
            return el;
        }
        extend(o:any, json:any):void{
            if (json instanceof Node || json instanceof Element){
                debugger;
                return;
            }
            domextend(o, json);
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

    export function use(json:any):any{
        for(var i of Creators){
            if (json[i.Id]){
                return i.Create(json);
            }
        }
        return null;
    }
}