namespace wo{
    export function watch(target:any, prop:string){
        let value:any = target[prop];
        
        Object.defineProperty(target, prop, {
            get: function(){
                return value;
            },
            set: function(newValue){
                let oldval = value;
                value = newValue;
                if (oldval != newValue && target.onchange){
                    target.onchange(newValue, value);
                }
            },
            configurable:true,
            enumerable:true
        });

        let rlt = {
            link:function(o:any, prop:string, callback:Function, forward?:boolean){
                if (forward){
                    o[prop] = value;
                }else{
                    value = o[prop];
                }

                Object.defineProperty(o, prop, {
                    get: function(){
                        return value;
                    },
                    set: function(newValue){
                        let oldval = value;
                        value = newValue;
                        if (callback){
                            callback(value);
                        }
                        if (oldval != newValue && target.onchange){
                            target.onchange(newValue, value);
                        }
                    },
                    configurable:true,
                    enumerable:true
                });
                
            }
        };
        return rlt;
    }
}