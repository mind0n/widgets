/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../foundation/watcher.ts" />
/// <reference path="../../builder/uicreator.ts" />


namespace wo{
    Widgets.dropdown = function():any{
        function changeCompleted(el:any, v?:any){
            // if (el.$model){
            //     el.$ctx.write(el.$model, v);
            // }
            el.value = v;
            // if (el.onchange){
            //     el.onchange(v);
            // }
        }
        let value:any;
        let watcher:any = new monitor();
        return  {
            tag:"div",
            class:"dropdown",
            bind:function(dat:any[]){
                if (!dat){
                    return;
                }
                let menu = this.$menu;
                menu.bind(dat);
            },
            onclick:function(){
                this.$menu.attach(this);
                if (this.$menu.visible()){
                    this.$menu.hide();
                }else{
                    this.$menu.show();
                }
            },
            selectAt:function(idx:number){
                this.$menu.selectAt(idx);
                this.$menu.hide();
            },
            select:function(val:any){
                this.$menu.select(val);
                this.$menu.hide();
            },
            model:function(keys:string[]){
                let dd = this;
                dd.$model = keys;
                dd.$ctx.read(keys, true, function(p:any, k:string, i:any){
                    watcher.watch(p, k, function(v:any){
                        dd.select(v);
                    });
                });
            },
            made:function(){
                let menu = this.getAttribute("menu-template");
                if (!menu){
                    menu = "simplemenu";
                }
                let mel = wo.use({ui:menu});
                let dd = this;
                dd.$menu = mel;
                //watcher = watch(this, "value");
                watcher.watch(this, "value");

                mel.onselect = function(item:any, undef?:any){
                    if (item !== undef){
                        let val = item.get();
                        dd.set({box:val});
                        this.hide();
                        changeCompleted(dd, val);
                    }else{
                        dd.set({box:'&nbsp;'}, true);
                        changeCompleted(dd);
                    }
                };
            },
            $:[
                {tag:"div", class:"area", $:[
                    {tag:'div', class:'box', alias:'box', $:'&nbsp;'},
                    {tag:'div', class:'toggle', alias:'toggle', 
                        $:{
                            sg:'svg'
                            ,class:'icon-dropdown-toggle'
                            ,$:{
                                sg:'use',
                                href:{
                                    baseVal:"svg-symbols.svg#icon-dropdown-toggle"
                                }
                            }
                        }
                    }
                ]}
            ]
        };
    };

    function attachmenu(target:Element, menu:any, mode?:number){
        if (!mode){
            mode = 2;
        }
        let rect = target.getBoundingClientRect();
        if (mode == 2){
            menu.style.left = rect.left + 'px';
            menu.style.top = rect.bottom - 1 + 'px';
            menu.style.width = rect.width + 'px';
        }
    }

    Widgets.simplemenu = function():any{
        return  {
            tag:"div",
            class:"simple-menu",
            bind:function(dat:any[]){
                if (!dat){
                    return;
                }
                let menu = this;
                let itmp = this.getAttribute("item-template");
                let list:any[] = [];
                for(let i of dat){
                    let it = wo.use({ui:itmp || "simpleitem"});
                    if (it){
                        it.bind(i);
                        it.onclick = function(){
                            if (menu.onselect){
                                menu.onselect(this);
                            }
                        }
                        list.add(it);
                    }
                }
                this.$items = list;
                this.set({body:{target:list}});
            },
            selectAt:function(idx:number){
                if (this.onselect){
                    if (idx >= 0 && idx < this.$items.length){
                        let i = this.$items[idx];
                        this.onselect(i);
                        return;
                    }
                    this.onselect();
                }
            },
            select:function(dat:any){
                if (this.onselect){
                    for(let i of this.$items){
                        if (i.getval() == dat){
                            this.onselect(i);
                            return;
                        }
                    }
                    this.onselect();
                }
            },
            attach:function(target:Element, mode?:number){
                attachmenu(target, this, mode);
            },
            show:function(){
                $(this).show();
            },
            hide:function(){
                $(this).hide();
            },
            made:function(){
                document.body.appendChild(this);
                $(this).hide();
            },
            $:[
                {tag:"div", class:"body", alias:"body"}
            ]
        };
    };

    Widgets.simpleitem = function():any{
        return {
            tag:'div',
            class:'simple-item',
            getval: function(){
                return this.innerHTML;
            },
            bind:function(dat:any):void{
                $(this).text(dat);
            }
        };
    };
}