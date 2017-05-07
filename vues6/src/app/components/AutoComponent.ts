import * as Vue from 'vue'
import Component from 'vue-class-component'
import {Widget} from './widget'


// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <div class="w-holder">
        <keep-alive v-if="alive">
            <component :is="current">

            </component>
        </keep-alive>
        <component v-if="!alive" :is="current">

        </component>
        </div>
    `
    , props:["alive", "current"]
})
export class AutoComponent extends Widget{
    alive:boolean;
    current:any;
}

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <div><w.auto v-for="item in items" :alive="item.alive" :current="item.current" :key="seed()" /></div>
    `
    , props:["items"]
})
export class AutoComponents extends Widget{
    items:any[]
    protected seed(){
        var d = new Date();
        var r = Math.random() * 10;
        return '' + d.getSeconds() + d.getMilliseconds() + r;
    }
}