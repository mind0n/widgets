import * as Vue from 'vue'
import Component from 'vue-class-component'
import {Widget} from './widget'

@Component({
    props:['template', 'data']
})
export class DynComponent extends Widget{
    template:string;
    data:any;
    render(h:any, context:any){
        let props = (<any>this)._self.$props;
        const template = props.template;
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
