import * as Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    template: `
        <div class="w-head w-row">
            <div v-for="item in columns()" v-if="!item.hidden" class="w-cell">{{item.caption}}</div>
        </div>
    `
    , props:["meta"]
    , components:{
        
    }
})
class HRow extends Vue{
    protected meta:any;
    columns(){
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
        return this.dat.meta;
    }
    protected dat:any;
    constructor(options?: Vue.ComponentOptions<Vue>){
        super(options);
        this.dat = {};
    }
    prepare(meta){
        this.$set(this.dat, 'meta', meta);
    }
}