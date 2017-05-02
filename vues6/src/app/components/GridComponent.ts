import * as Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    template: `
        <div class="w-head-row">
            <div v-for="item in columns()" v-if="!item.hidden" class="w-cell">{{item.caption}}</div>
        </div>
    `
    , props:["meta"]
    , components:{
        
    }
})
class HRow extends Vue{
    meta:any;
    columns(){
        console.log(this.meta);
        return this.meta?this.meta.columns:[];
    }
}

@Component({
    template: `
        <div class="w-row">
            Row
        </div>
    `
    , props:["alive", "current"]
    , components:{
        
    }
})
class Row extends Vue{
}
@Component({
    template: `
        <div class="w-grid">
            <HRow :meta="getmeta()"></HRow>
        </div>
    `
    , props:[]
    , components:{
        HRow,Row
    }
})
export class GridComponent extends Vue{
    getmeta(){
        return this.meta;
    }
    protected meta:any;

    prepare(meta){
        this.meta = meta;
    }
}