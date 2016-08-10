/// <reference path="../foundation/string.ts" />
function read(target:any, keys:string[], isSet?:boolean, callback?:Function, undef?:any):any{
    if (!target){
        return null;
    }
    let item = target;
    let parent:any = null;
    let key:string;
    for(let i of keys){
        key = i;
        parent = item;
        item = item[i];
        if (item === undef){
            if (isSet){
                item = {};
                parent[key] = item;
            }else{
                return null;
            }
        }
    }
    if (callback){
        callback(parent, key, item);
    }
    return item;
}
Object.prototype.read = function(keys:string[], isSet?:boolean, callback?:Function){
    return read(this, keys, isSet, callback);
};
Object.prototype.write = function(keys:string[], val:any){
    read(this, keys, true, function(p:any, k:string, i:any){
        p[k] = val;
    })
};

Element.prototype.set = function(val:any, undef?:any):void{
    if (val === undef){
        return;
    }
    function _add(t:any, v:any, mode:string){
        if (wo.usable(v)){
            v = wo.use(v);
        }
        if (mode == "prepend"){
            t.insertBefore(v, t.childNodes[0]);
        }else{
            t.appendChild(v);
        }                            
    }
    function add(t:any, v:any):boolean{
		if (t){
            if (v === undef){
                t.innerHTML = '';
                return true;
            }
            if (v instanceof Array){
                for(let it of v){
                    add(t, it);
                }
            }else if (typeof (v) == 'object'){
                if (v.target){
                    if (!v.mode || (v.mode == "prepend" && t.childNodes.length < 1)){
                        v.mode = "append";
                    }
                    if (v.mode == "replace"){
                        t.innerHTML = "";
                        v.mode = "append";
                    }
                    let vals = v.target;
                    if (!vals.length){
                        _add(t, vals, v.mode);
                    }else{
                        for(let i of vals){
                            _add(t, i, v.mode);
                        }
                    }
                }else{
                    _add(t, v, "append");
                }
			}else{
				$(t).text(v);
			}
		}
        return false;
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
Element.prototype.get = function(keys:string[], undef?:any){
    let val:any;
    let item = this;
    if (!keys || keys.length < 1){
        return this.innerHTML;
    }
    for(let i of keys){
        if (i == '='){
            return item;
        }else if (i == '$'){
            item = item.childNodes;
        }else if (typeof(i) == 'function'){
            item = (i as any)(item);
        }else{
            item = item[i];
        }
        if (!item){
            return null;
        }
    }
    if (item.getval){
        return item.getval();
    }else if (item.value){
        return item.value;
    }
    return item.innerHTML;
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

            let o = this.create(json);
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

    export abstract class RepoCreator extends Creator{
        protected abstract getrepo():any;
        create(json:any):Node{
            if (json == null){
                return null;
            }
            //let wg = json[this.id];
            let template:any = null;
            let s = json[this.id];
            let list = s.split('.');
            let repo = this.getrepo();

            let tmp = repo;
            for(let i of list){
                if (tmp[i]){
                    tmp = tmp[i];
                }else{
                    console.log(`Cannot find ${s} from repo: `, repo);
                    debugger;
                    return null;
                }
            }
            template = tmp;

            if (!template){
                return null;
            }

            let el:Node = use(template());
            return el;
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
function use(json:any, ctx?:any, cs?:wo.Cursor):any{
    if (!ctx){
        ctx = document.body;
    }
    let rlt = wo.use(json, cs);
    rlt.$ctx = ctx;
    return rlt;
}
