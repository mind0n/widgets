import * as Vue from 'vue';
import Component from 'vue-class-component';
import {BaseComponent} from './BaseComponent'
import {extend, find, clone, all, add, uid, clear} from '../../../../../kernel/src/common';
import {Widget} from '../../../../../kernel/src/web/widgets/widget';
import {addcss} from '../../../../../kernel/src/web/element';
import {send} from '../../../../../kernel/src/web/network';

@Component({
    template:`<div>
        <span>Test Component</span>
        <div ref="area"></div>
    </div>`
    ,props:[]
})
export class TestComponent extends BaseComponent{
    mounted(){
        let area = <HTMLElement>this.$refs.area;
        let rlt = Widget.parsehtml(`
            <span>Test Widgets</span>
            <tst></tst>
        `);
        rlt.prepare({
            on:{
                rendered:(html:string)=>{
                    console.log('onrendered', html);
                }
            }
        });
        area.appendChild(rlt);
    }
}
