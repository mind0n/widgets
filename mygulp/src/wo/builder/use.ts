/// <reference path="../foundation/string.ts" />

Element.prototype.set = function(val:any):void{
    function add(t:any, v:any):void{
		if (t){
			if (typeof (v) == 'object'){
				let tmp = wo.use(v.target);
                if (tmp){
                    v.target = tmp;
                }
				if (!v.mode || (v.mode == "prepend" && t.childNodes.length < 1)){
					v.mode = "append";
				}
				if (v.mode == "replace"){
					t.innerHTML = "";
					v.mode = "append";
				}
				if (v.mode == "prepend"){
					t.insertBefore(v.target, t.childNodes[0]);
				}else{
					t.appendChild(v.target);
				}                            
			}else{
				$(t).text(v);
			}
		}

    }
    if (wo.usable(val)){
        add(this, val);
    }
	for(let i in val){
		let v = val[i];
    	let t = this["$" + i];
        add(t, v);
	}            
};

namespace wo{
    /// Contains creator instance object
    export let Creators:Creator[] = [];

    function get(selector:any):any{
        let rlt:any = [];
        if (selector){
            try{
                rlt = document.querySelectorAll(selector);
            }catch(e){
                console.log(e);
            }
        }
        return rlt;
    }

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
                //console.dir(json.alias);
                let n = json.alias;
                if (json.alias.startsWith("$")){
                    n = json.alias.substr(1, json.alias.length - 1);
                }
                cs.border["$" + n] = o;
                if (json.alias.startsWith("$")){
                    cs.border = o;
                }
            }

            delete json[this.Id];
            this.extend(o, json);
            if (json.made){
                json.made.call(o);
            }
            o.$root = cs.root;
            o.$border = cs.border;
            return o;
        }
        protected abstract create(json:any):any;
        protected abstract extend(o:any, json:any):void;
        protected applyattr(el:any, json:any, i:string, cs:any){
            let target = el[i];
            if (target){
                let type = typeof target;
                if (type == 'object'){
                    let vtype = typeof json[i];
                    if (vtype == 'object'){
                        jextend.call(this, target, json[i], this);
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
        protected applychild(el:any, json:any, i:string, cs:any){
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

        protected applyprop(el:any, json:any, i:string, cs:any){
            var type = typeof json[i];
            if (type == "function"){
                el[i] = json[i];
            }else{
                if (el[i] && typeof(el[i]) == 'object' && type == 'object'){
                    objextend(el[i], json[i]);
                }else if (type == 'object'){
                    el[i] = json[i];
                }else{
                    this.setattr(el, json, i);
                }
            }
        }
        protected setattr(el:any, json:any, i:string){
            el.setAttribute(i, json[i]);
        }
    }

    export function append(el:any, child:any){
        if (el.append && typeof(el.append) == 'function'){
            el.append(child);
        }else{
            el.appendChild(child);
        }
    }

    export function usable(json:any):boolean{
        for(var i of Creators){
            if (json[i.Id]){
                return true;
            }
        }
        return false;
    }

    export function use(json:any, cs?:Cursor):any{
        let rlt:any = null;
        if (!json || json instanceof Element){
            return rlt;
        }
        let container:any = null;
        if (json.$container$){
            container = json.$container$;
            delete json.$container$;
        }
        if (typeof (json) == 'string'){
            rlt = get(json);
        }

        for(var i of Creators){
            if (json[i.Id]){
                rlt = i.Create(json, cs);
                break;
            }
        }
        if (container){
            container.appendChild(rlt);
        }
        return rlt;
    }


}