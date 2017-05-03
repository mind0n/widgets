import * as Vue from 'vue'
import Component from 'vue-class-component'


export class Widget extends Vue{
    get iswidget(){return true;}
    constructor(options?: Vue.ComponentOptions<Vue>){
        super(options);
    } 
    mounted(){
        console.log("Mounted", this);
    }   
}
