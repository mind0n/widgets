/// <reference path="./use.ts" />

namespace wo{
    export class WidgetContext{
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
            let ctx = WidgetContext.ctxes[name] || new WidgetContext(name);
            if (!WidgetContext.ctxes[name]){
                WidgetContext.ctxes[name] = ctx;
            }
            callback(ctx);
        }
    }
}
let WidgetContext = wo.WidgetContext;