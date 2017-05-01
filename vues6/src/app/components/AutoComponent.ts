import * as Vue from 'vue'
import Component from 'vue-class-component'


// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <keep-alive v-if:alive>
            <component :is="current">

            </component>
        </keep-alive>
    `
    , props:["alive", "current"]
})
export class AutoComponent extends Vue{
    alive:boolean;
    current:any;
}

