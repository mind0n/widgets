namespace wo{

    export class monitor{
        private val:any;
        private undo:Function[] = [];
        private origin:any;
        watch(target:any, prop:string, callback?:Function){
            let self = this;
            if (!self.origin){
                self.origin = target;
                this.val = target[prop];
            }
            Object.defineProperty(target, prop, {
                get: function(){
                    return self.val;
                },
                set: function(newValue){
                    let oldval = self.val;
                    self.val = newValue;
                    if (callback){
                        callback(newValue, oldval);
                    }
                    if (oldval != newValue && self.origin.onchange){
                        self.origin.onchange(newValue, self.val);
                    }
                },
                configurable:true,
                enumerable:true
            });
            
            self.undo.add(function(){
                Object.defineProperty(target, prop, {
                    get: function(){
                        return target['_' + prop];
                    },
                    set: function(newValue){
                        target['_' + prop] = newValue;
                    },
                    configurable:true,
                    enumerable:true
                });
            });
            
        }

        observe(el:any, attr:string, callback?:Function){
            let self = this;
            if (!self.origin){
                self.origin = el;
                self.val = el.getAttribute(attr);
            }
            let obs = new MutationObserver(function(mutations){
                mutations.forEach(function(mutation){
                    if (mutation.attributeName == attr){
                        self.val = el.getAttribute(mutation.attributeName);
                        if (callback){
                            callback(self.val, mutation.oldValue);
                        }
                    }
                });
            });
            obs.observe(el, {attributes:true, childList:false, characterData:false, attributeOldValue:true, attributeFilter:[attr]});
            self.undo.add(function(){
                obs.disconnect();
            });
        }
    }
}