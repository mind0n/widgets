/// <reference path="../foundation/string.ts" />

module wo{
    /// Contains creator instance object
    export let Creators:Creator[] = [];

    export class Cursor{
        parent:any;
        border:any;
        root:any;
        curt:any;
    }

    export abstract class Creator{
        id:string;
        get Id():string{
            return this.id;
        }
        Create(json:any, cs?:Cursor):any{
            if (!json){
                return null;
            }
            var o = this.create(json);
            if (!cs){
                cs = new Cursor();
                cs.root = o;
                cs.parent = null;
                cs.border = o;
                cs.curt = o;
                o.cursor = cs;
            }else{
                let ncs = new Cursor();
                ncs.root = cs.root;
                ncs.parent = cs.curt;
                ncs.border = cs.border;
                ncs.curt = o;
                o.cursor = ncs;
                cs = ncs;
            }
            if (json.alias){
                let n = json.alias;
                if (json.alias.startsWith("$")){
                    n = json.alias.substr(1, json.alias.length - 1);
                }
                //console.log(cs.border, n);
                cs.border["$" + n] = o;
                if (json.alias.startsWith("$")){
                    cs.border = o;
                }
            }

            delete json[this.Id];
            this.extend(o, json);
            return o;
        }
        protected abstract create(json:any):any;
        protected abstract extend(o:any, json:any):void;
    }

    export function use(json:any, cs?:Cursor):any{
        for(var i of Creators){
            if (json[i.Id]){
                return i.Create(json, cs);
            }
        }
        return null;
    }
}