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
class HRow extends Vue{
    meta:any;
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
            <HRow :meta="meta"></HRow>
        </div>
    `
    , props:["meta"]
    , components:{
        HRow,Row
    }
})
export class GridComponent extends Vue{
    meta:any;

    prepare(meta){
        console.log(this, meta);
    }
}