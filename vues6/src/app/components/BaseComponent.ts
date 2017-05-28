import * as Vue from 'vue'
import Component from 'vue-class-component'


export class BaseComponent extends Vue{
    protected classes:string;
    get iswidget(){return true;}
    constructor(options?: Vue.ComponentOptions<Vue>){
        super(options);
    } 
}
