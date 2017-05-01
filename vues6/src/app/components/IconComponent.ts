import * as Vue from 'vue'
import Component from 'vue-class-component'

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" 
            :width="width" 
            :height="height" 
            :viewbox="'0 0 ' + width + ' ' + height">
            <slot></slot>
        </svg>
    `
    , props:["width", "height"]
})
export class Icon extends Vue{
    html:string
    width:number;
    height:number;
}

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <icon :width="width" :height="height" :viewbox="viewbox()">
            <path d="M13 9L22 17L13 25L22 17" />
        </icon>
    `
    , props:["width", "height"]
})
export class IconToggleMenu extends Vue{
    width:number;
    height:number;
    viewbox():string{
        return "0 0 " + this.width + " " + this.height;
    }
}

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <icon :width="width" :height="height">
            <path d="M8 13L16 22L24 13L16 22"></path>
        </icon>
    `
    , props:["width", "height"]
})
export class IconToggleDropDown extends Vue{
    width:number;
    height:number;
}