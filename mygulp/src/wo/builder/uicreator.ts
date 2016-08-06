/// <reference path="../foundation/definitions.ts" />
/// <reference path="./use.ts" />
/// <reference path="./domcreator.ts" />

namespace wo{
    export let Widgets:any = {};

    export class UiCreator extends RepoCreator{
        constructor(){
            super();
            this.id = "ui";
        }
        getrepo():any{
            return Widgets;
        }
        verify(i:string, json:any){
            if (i.startsWith("$$")){
                return this.applyattr;
            }else if(i == "$"){
                return this.applychild;
            }else if (i == "style"){
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
                jextend.call(this, o, json, this);
            }else if (json.$ && o instanceof Node){
                o.nodeValue = json.$;
            }else if (o.extend){
                o.extend(json);
            }
        }
        protected applychild(el:any, json:any, i:string, cs:any){
            let type = typeof json[i];
            let ji = json[i];
            if (type == 'object' && !(ji instanceof Array)){
                ji = [ji];
            }
            if (ji instanceof Array){
                let nodes = el.childNodes;
                for(let j = 0; j<ji.length; j++){
                    let item = ji[j];
                    if (wo.iswidget(item)){
                        if (el.use){
                            el.use(item, cs);
                        }else{
                            let child = use(item, cs);
                            if (child != null){
                                append(el, child);
                            }
                        }
                    }else{
                        if (j < nodes.length){
                            jextend.call(this, nodes[j], item, this);
                        }else{
                            if (el.use){
                                el.use(item, cs);
                            }else{
                                let child = use(item, cs);
                                if (child != null){
                                    append(el, child);
                                }
                            }
                        }
                    }
                }
            }else{
                el.innerHTML = json[i];
            }
        }

    }
    
    export function iswidget(json:any):boolean{
        if (!json || !json.ui){
            return false;
        }

        for(let i in Widgets){
            if (i == json.ui){
                return true;
            }
        }
        return false;
    }

}