import * as Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    template: `
        <div class="w-head-row">
            Head Row
        </div>
    `
    , props:["meta"]
    , components:{
        
    }
})
export class Widget extends Vue{
    uid:string;
    constructor(options?:any){
        super(options);
        let d = new Date();
        let r = Math.random();
        this.uid = `u${d.getFullYear()}${d.getMonth()}${d.getDay()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}${d.getMilliseconds()}${r}`;
    }
}