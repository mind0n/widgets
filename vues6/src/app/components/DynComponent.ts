import * as Vue from 'vue'
import Component from 'vue-class-component'
import {Widget} from './widget'

@Component({
    props:['html', 'data']
})
export class DynComponent extends Widget{
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
export class DynsComponent extends Widget{
    items:any[];
}