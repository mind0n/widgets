/// <reference path="use.ts" />
/// <reference path="objextend.ts" />

namespace wo{
    function applyattr(el:any, i:string, json:any){
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

    function applychild(el:any, json:any, i:string, cs:any){
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
    
    export function domextend(el:any, json:any, bag?:any){
        let cs = el.cursor;
        for(let i in json){
            if (i.startsWith("$$")){
                applyattr(el, i, json);
            }else if (i == "$"){
                applychild(el, json, i, cs);
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