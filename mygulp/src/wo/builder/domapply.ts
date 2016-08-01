/// <reference path="use.ts" />
/// <reference path="objextend.ts" />

namespace wo{
    function applyattr(el:any, i:string, json:any){
        let target = el[i];
        if (target){
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
        }else{
            el[i] = json[i];
        }
    }

    function applychild(el:any, json:any, i:string, cs:any){
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
                        domapply(nodes[j], item);
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

    export function domapply(el:any, json:any, bag?:any){
        let cs = el.cursor;
        for(let i in json){
            if (i.startsWith("$$")){
                applyattr(el, i, json);
            }else if (i == "$"){
                applychild(el, json, i, cs);
            }else if (i.startsWith("$")){
                el[i] = json[i];
            }else if (i == "style"){
                objextend(el[i], json[i]);
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