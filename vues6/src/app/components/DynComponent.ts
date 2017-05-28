import * as Vue from 'vue';
import Component from 'vue-class-component';
import {BaseComponent} from './BaseComponent'
import {extend, find, clone, all, add, uid, clear} from '../../../../../kernel/src/common';
import {addcss} from '../../../../../kernel/src/web/element';
import {send} from '../../../../../kernel/src/web/network';

@Component({
    props:['html', 'data']
})
export class DynComponent extends BaseComponent{
    html:string;
    data:any;
    render(h:any, context:any){
        let props = (<any>this)._self.$props;
        const template = props.html;
        const cmp = {
            template
            , data:()=>{
                return props.data;
            }
        }
        const component = template?cmp:{template:'<span>Loading ...</span>'};
        return h(component, this.$slots.default);
    }
}

@Component({
    template:`
        <div class="w-wrap">
            <w.d v-for="item in items" :html="item.html" :data="item.data" :key="$uid()"></w.d>
        </div>
    `
    , props:['items']
})
export class DynsComponent extends BaseComponent{
    items:any[];
}

@Component({
    props:['items']
})
export class DynamicComponent extends BaseComponent{
    items:any[];
    render(createElement:any){
        const rootcmp = {
            template:`<div>
                <slot></slot>
            </div>`
            , data:()=>{
                return {};
            }
        }
        let children:any = [];
        all(this.items, (item:any, i:number)=>{
            if (item.data){
                let t = typeof(item.data);
                if (t != 'function'){
                    let t = item.data;
                    item.data = function(){
                        return t;
                    }
                }
            }
            add(children, createElement(item));
        });
        return createElement(rootcmp, children);
    }
}
