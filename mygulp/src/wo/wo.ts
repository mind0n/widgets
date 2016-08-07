/// <reference path="./foundation/definitions.ts" />
/// <reference path="./builder/use.ts" />
/// <reference path="./builder/domcreator.ts" />
/// <reference path="./builder/svgcreator.ts" />
/// <reference path="./builder/uicreator.ts" />

wo.Creators.add(new wo.DomCreator());
wo.Creators.add(new wo.SvgCreator());
wo.Creators.add(new wo.UiCreator());

namespace wo{
    export class Context{
        private static ctxes:any = {};

        name:string;
        use(json:any, cs?:Cursor):any{
            let rlt = wo.use(json, cs);
            rlt.$ctx = this;
            return rlt;
        }
        constructor (name:string){
            this.name = name;
        }

        static new(name:string, callback:Function){
            let ctx = Context.ctxes[name] || new Context(name);
            if (!Context.ctxes[name]){
                Context.ctxes[name] = ctx;
            }
            callback(ctx);
        }
    }
}
let Context = wo.Context;