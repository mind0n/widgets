/// <reference path="../../foundation/elements.ts" />
/// <reference path="../../builder/uicreator.ts" />

namespace wo{
    
    Widgets.dropdown = function():any{
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
                if ($(this.$menu).is(":visible")){
                    this.$menu.hide();
                }else{
                    this.$menu.show();
                }
            },
            select:function(val:any, index?:boolean){
                if (index){
                    let idx = val as number;
                    if (this.$menu.$items && idx >= 0 && idx < this.$menu.$items.length){
                        let it = this.$menu.$items[idx];
                        this.set({box:it.getval()});
                    }
                }else{
                    this.set({box:val})
                    this.$menu.hide();
                }
            },
            made:function(){
                let menu = this.getAttribute("menu-template");
                if (!menu){
                    menu = "simplemenu";
                }
                let mel = wo.use({ui:menu});
                this.$menu = mel;
                let dd = this;
                mel.onselect = function(val:any){
                    dd.select(val);
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
                                let val = this.getval();
                                menu.onselect(val);
                            }
                        }
                        list.add(it);
                    }
                }
                this.$items = list;
                this.set({body:{target:list}});
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