import * as Vue from 'vue'
import Component from 'vue-class-component'
import {Widget} from './widget'

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <svg :class="classes" xmlns="http://www.w3.org/2000/svg" 
            :width="getwidth()" 
            :height="getheight()" 
            :viewBox="'0 0 ' + getvwidth() + ' ' + getvheight()"
            >
            <slot></slot>
        </svg>
    `
    , props:["width", "height", "classes", "vwidth", "vheight"]
})
export class Icon extends Widget{
    html:string
    width:number;
    height:number;
    vwidth:number;
    vheight:number;
    classes:string;
    protected getwidth():any{
        return this.width || '100%';
    }
    protected getheight():any{
        return this.height || '100%';
    }
    protected getvwidth(){
        return this.vwidth || this.width || 32;
    }
    protected getvheight(){
        return this.vheight || this.height || 32;
    }
}

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <w.icon classes="icon-toggle-menu" :width="width" :height="height" :vwidth="vwidth" :vheight="vheight">
            <path d="M13 9L22 17L13 25L22 17" />
        </w.icon>
    `
    , props:["width", "height", "vwidth", "vheight"]
})
export class IconToggleMenu extends Widget{
    width:number;
    height:number;
}

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <w.icon classes="icon-toggle-dropdown" :width="width" :height="height" :vwidth="vwidth" :vheight="vheight">>
            <path d="M8 13L16 22L24 13L16 22"></path>
        </w.icon>
    `
    , props:["width", "height", "vwidth", "vheight"]
})
export class IconToggleDropDown extends Widget{
    width:number;
    height:number;
}

@Component({
    // All component options are allowed in here
    template: `
        <w.icon classes="icon-sort-down" :width="width" :height="height" :vwidth="vwidth" :vheight="vheight">>
            <path d="M8 13L16 22L24 13L16 22"></path>
        </w.icon>
    `
    , props:["width", "height", "vwidth", "vheight"]
})
export class IconSortDown extends Widget{
    width:number;
    height:number;
}

@Component({
    // All component options are allowed in here
    template: `
        <w.icon classes="icon-sort-up" :width="width" :height="height" :vwidth="vwidth" :vheight="vheight">>
            <path d="M8 19L16 10L24 19L16 10"></path>
        </w.icon>
    `
    , props:["width", "height", "vwidth", "vheight"]
})
export class IconSortUp extends Widget{
    width:number;
    height:number;
}