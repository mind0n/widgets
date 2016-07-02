/// <reference path="../foundation/string.ts" />

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
            this.extend(o, json);
            return o;
        }
        protected abstract create(json:any):any;
        protected abstract extend(o:any, json:any):void;
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