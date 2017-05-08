import * as Vue from 'vue'
import Component from 'vue-class-component'
import {Widget} from './widget'
import {extend, find} from '../../../../../kernel/src/common'

@Component({
    template: `
        <div :class="'w-cell ' + (meta.desc?'w-desc':'')" @click="cellclick"><slot v-if="meta.field||$slots.default"></slot><w.autos v-if="!meta.field&&meta.children" :items="meta.children" /></div>
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
        if (m){
            if (m.styles){
                extend(this.$el.style, m.styles);
            }
            if (m.attaches){
                extend(this.$el, m.attaches);
            }
        }
        if (this.dat && m && f){
            let d = this.dat[f];
            if (d){
                if (m.filter){
                    this.val(m.filter(d));
                }else{
                    this.val(d);
                }
            }
        }else if (!f && m){
            //console.log(f, m);
        }
    }
    protected val(v:string){
        this.$el.innerHTML = v;
    }
    protected cellclick(event:MouseEvent){
        this.$emit("cellclick", this.meta);
    }
}

@Component({
    template: `
        <div class="w-head w-row w-nowrap">
            <Cell v-for="item in columns()" v-if="!item.hidden" :meta="item" :key="$uid()" @cellclick="columnclick">{{item.caption}}</Cell>
        </div>
    `
    , props:["meta"]
    , components:{
        Cell
    }
})
class HRow extends Widget{
    protected meta:any;
    protected sort:any = {};
    columns(){
        return this.meta?this.meta.columns:[];
    }
    
    columnclick(meta:any){
        this.sort[meta.field] = this.sort[meta.field]?false:true;
        let m = find(this.meta.columns, 'field', meta.field);
        m.desc = this.sort[meta.field];
        //this.$set(m, 'desc', this.sort[meta.field]);
        //console.log(this.meta);
        this.$forceUpdate();
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
        <div :class="'w-grid ' + classes" v-on:scroll="scroll" >
            <HRow ref="head" :meta="getmeta()"></HRow>
            <div class="w-body">
                <Row v-for="row in getdata()" :dat="row" :meta="getmeta()" :key="$uid()" />
            </div>
        </div>
    `
    , props:['classes']
    , components:{
        HRow,Row
    }
})
export class GridComponent extends Widget{
    protected classes:string;

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
    scroll(){
        let el = this.$el;
        let child = <any>this.$refs.head;
        let head = child.$el;
        head.style.top = el.scrollTop + 'px';
    }
    prepare(meta){
        this.$set(this.dat, 'meta', meta);
    }
    bind(dat){
        this.$set(this.dat, 'value', dat);
    }
}