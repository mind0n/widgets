import * as Vue from 'vue'
import Component from 'vue-class-component'
import {Widget} from './widget'
import {extend, find, clone} from '../../../../../kernel/src/common'

function getScrollbarWidth() {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);        

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return (widthNoScroll - widthWithScroll) + 'px';
}
function cellChange(self:any){
    let m = self.meta;
    let f = self.field || m.field;
    let dat = self.dat;
    //if (f != m.field){
        //console.log(f, m.field, self);
    //}
    if (m){
        if (m.styles){
            extend(self.$el.style, m.styles);
        }
        if (m.attaches){
            extend(self.$el, m.attaches);
        }
        if (dat && m && f){
            let d = dat[f];
            if (d){
                if (m.filter){
                    self.val(m.filter(d));
                }else{
                    self.val(d);
                }
            }
        }else if (!f && m){
            //console.log(f, m);
        }
    }
}
@Component({
    template: `
        <div :class="'w-cell ' + sort() + ' ' + classes()" @click="cellclick">
            <div class="w-sort">
                <w.icon-sort-up width=14 height=14 vwidth=32 vheight=32 />
                <w.icon-sort-down width=14 height=14 vwidth=32 vheight=32 />
            </div>
            <slot v-if="meta.field||$slots.default"></slot>
            <w.autos v-if="!meta.field&&meta.children&&!$slots.default" :items="meta.children" />
        </div>
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
        cellChange(this);
    }
    updated(){
        cellChange(this);
    }
    protected val(v:string){
        this.$el.innerHTML = v;
    }
    protected cellclick(event:MouseEvent){
        this.$emit("cellclick", this.meta);
    }
    protected classes(){
        return this.meta?this.meta.classes : '';
    }
    protected sort(){
        if (this.meta.desc === undefined){
            return '';
        }else if (this.meta.desc === true){
            return 'w-desc';
        }else{
            return 'w-asc'; 
        }
    }
}

@Component({
    template: `
        <div class="w-head w-row w-flex-col-item">
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
        let o = this.sort[meta.field];
        if (o === undefined){
            this.sort[meta.field] = false;
        }else if (o === false){
            this.sort[meta.field] = true;
        }else{
            this.sort[meta.field] = undefined;
        }
        let m = find(this.meta.columns, 'field', meta.field);
        m.desc = this.sort[meta.field];
        this.$forceUpdate();
    }
    mounted(){
        let w = getScrollbarWidth();
        this.$el.style.paddingRight = w;
    }
}

@Component({
    template: `
        <div class="w-row"><Cell v-for="item in columns()" :meta="rowitem(item)" :field="item.field + ''" :dat="cells()" :key="$uid()" v-if="!item.hidden"></Cell></div>
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
    rowitem(item:any){
        let t = clone(item);
        t.dat = this.cells();
        return t;
    }
}
@Component({
    template: `
        <div :class="'w-grid w-flex-col ' + classes" v-on:scroll="scroll" >
            <HRow ref="head" :meta="getmeta()"></HRow>
            <div class="w-body w-flex-col-item">
                <Row ref="rows" v-for="row in getdata()" :dat="row" :meta="getmeta()" :key="$uid()" />
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