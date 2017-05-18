import * as Vue from 'vue'
import Component from 'vue-class-component'
import {Widget} from './widget'


// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <div :class="'w-holder ' + (classes?classes:' w-inline')">
        <keep-alive>
            <component :is="current">

            </component>
        </keep-alive>
        </div>
    `
    , props:["current", "classes"]
})
export class AutoComponent extends Widget{
    alive:boolean;
    current:any;
}

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <div><w.auto :classes="classes" v-for="item in items" :current="item.widget" :key="seed()" /></div>
    `
    , props:["items", 'classes']
})
export class AutoComponents extends Widget{
    items:any[]
    protected seed(){
        var d = new Date();
        var r = Math.random() * 10;
        return '' + d.getSeconds() + d.getMilliseconds() + r;
    }
}
