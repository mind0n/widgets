/// <reference path="objextend.ts" />

namespace wo{
    export function jextend(target:any, json:any, bag:any){
        let cs = target.cursor;
        for(let i in json){
            let handler = bag.verify(i, json);
            if (!handler){
                handler = objextend;
            }
            handler.call(this, target, json, i, cs);
        }
    }
}