import * as Vue from 'vue'
import Component from 'vue-class-component'
import {Widget} from './widget'

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <svg :class="classes" xmlns="http://www.w3.org/2000/svg" :width="getwidth()"  :height="getheight()" :viewBox="'0 0 ' + getvwidth() + ' ' + getvheight()" >
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
        <w.icon classes="icon-toggle-dropdown" :width="width" :height="height" :vwidth="vwidth" :vheight="vheight">
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
        <w.icon classes="icon-sort-down" :width="width" :height="height" :vwidth="vwidth" :vheight="vheight">
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
        <w.icon classes="icon-sort-up" :width="width" :height="height" :vwidth="vwidth" :vheight="vheight">
            <path d="M8 19L16 10L24 19L16 10"></path>
        </w.icon>
    `
    , props:["width", "height", "vwidth", "vheight"]
})
export class IconSortUp extends Widget{
    width:number;
    height:number;
}

@Component({
    // All component options are allowed in here
    template: `
        <w.icon :classes="'icon-placeholder ' + classes" :width="width" :height="height" :vwidth="vwidth" :vheight="vheight">

            <path class="fill" d="M 166.968 184.31 L 303.071 358.517 L 30.864 358.517 L 166.968 184.31 Z" />
            <path class="fill" d="M 285.674 128.777 L 445.795 357.638 L 125.552 357.638 L 285.674 128.777 Z" />
            <path class="fill" d="M 358.79 176.598 L 475.679 357.639 L 241.901 357.639 L 358.79 176.598 Z" />
            <ellipse class="fill" transform="matrix(1.000001, 0, 0, 1, -537.650153, -286.399048)" cx="746.128" cy="441.819" rx="27.184" ry="29.749" />
            <rect x="7.369" y="7.143" width="485.292" height="487.587" style="fill:none; stroke-width:12;" />

        </w.icon>
    `
    , props:["width", "height", "vwidth", "vheight", "classes"]
})
export class IconPlaceholder extends Widget{
    classes:string;
    width:number;
    height:number;
}