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
                this.$menu.show();
            },
            select:function(val:any){
                this.set({box:val})
                this.$menu.show(true);
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
                    {tag:'div', class:'toggle', alias:'toggle', $:">"}
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
            menu.style.top = rect.bottom + 'px';
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
                this.set({body:{target:list}});
            },
            attach:function(target:Element, mode?:number){
                attachmenu(target, this, mode);
            },
            show:function(hide:boolean){
                if (hide){
                    $(this).hide();
                }else{
                    $(this).show();
                }
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