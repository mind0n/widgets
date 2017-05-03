import * as Vue from 'vue'
import Component from 'vue-class-component'
import {Widget} from './widget'
import {each} from '../../../../../kernel/web/common'

@Component({
    template: `
        <div class="w-cell"><slot></slot></div>
    `
    , props:["meta", "dat", "field"]
    , components:{
        
    }
})
class Cell extends Widget{
    protected meta:any;
    protected dat:any;
    protected field:string;
    columns(){
        return this.meta?this.meta.columns:[];
    }
    mounted(){
        let f = this.field;
        let m = this.meta;
        console.log(m);
        if (this.dat && m && f){
            let d = this.dat[f];
            if (d){
                if (m.filter){
                    this.val(m.filter(d));
                }else{
                    this.val(d);
                }
            }
        }
    }
    protected val(v:string){
        this.$el.innerHTML = v;
    }
}

@Component({
    template: `
        <div class="w-head w-row">
            <Cell v-for="item in columns()" v-if="!item.hidden" :key="$uid()">{{item.caption}}</Cell>
        </div>
    `
    , props:["meta"]
    , components:{
        Cell
    }
})
class HRow extends Widget{
    protected meta:any;
    columns(){
        return this.meta?this.meta.columns:[];
    }
}

@Component({
    template: `
        <div class="w-row"><Cell v-for="item in columns()" v-if="!item.hidden" :meta="item" :field="item.field" :dat="cells()" :key="$uid()"></Cell></div>
    `
    , props:["dat", "meta"]
    , components:{
        Cell
    }
})
class Row extends Widget{
    protected dat:any;
    protected meta:any;
    columns(){
        return this.meta?this.meta.columns:[];
    }
    cells(){
        return this.dat||[];
    }

}
@Component({
    template: `
        <div class="w-grid">
            <HRow :meta="getmeta()"></HRow>
            <div class="w-body">
                <Row v-for="row in getdata()" :dat="row" :meta="getmeta()" :key="$uid()" />
            </div>
        </div>
    `
    , props:[]
    , components:{
        HRow,Row
    }
})
export class GridComponent extends Widget{
    getmeta(){
        return this.dat.meta;
    }
    getdata(){
        return this.dat.value;
    }
    protected dat:any;
    constructor(options?: Vue.ComponentOptions<Vue>){
        super(options);
        this.dat = {};
    }
    prepare(meta){
        this.$set(this.dat, 'meta', meta);
    }
    bind(dat){
        this.$set(this.dat, 'value', dat);
    }
}