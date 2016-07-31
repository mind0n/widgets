/// <reference path="../foundation/definitions.ts" />
/// <reference path="./use.ts" />
/// <reference path="./domcreator.ts" />

namespace wo{
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

            let el:Node = use(Widgets[wg]());
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