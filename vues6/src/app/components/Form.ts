import * as Vue from 'vue';
import Component from 'vue-class-component';
import {Widget} from './widget';
import {extend, find, clone, all, add, uid} from '../../../../../kernel/src/common';
import {send} from '../../../../../kernel/src/web/network';

@Component({
    template: `
        <form :action="action" method="post" :enctype="getype()">
            <slot></slot>
        </form>
    `
    , props:["action", "type", "target"]
})
export class FormContainer extends Widget{
    getype(){
        if (!this.type){
            return 'application/x-www-form-urlencoded';
        }else if (this.type == 'upload'){
            return 'multipart/form-data';
        }else{
            return this.type;
        }
    }
    protected type:string;
    action:string;
    target:string;

    mounted(){
        let form = <HTMLFormElement>this.$el;
        if (this.target){
            form.target = this.target;
        }
    }
}

function readURL(el:any, input:any) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e:any) {
            el.setAttribute('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

@Component({
    template: `
        <div class="w-boundary w-upload">
            <w.form ref="frm" :action="action" type="upload">
                <w.icon-placeholder classes="preview" vwidth=500 vheight=500 />
                <img class="preview" ref="img" />
                <input ref="box" :id="gid()" name="files" type="file" @change="filechanged()" />
                <label ref="label" style="cursor:pointer;">
                    <div ref="text">Drag Here - Click Here - Paste Here to upload</div>
                </label>
            </w.form>
        </div>
    `
    , props:["action", "auto"]
})
export class Uploader extends Widget{
    action:string;
    auto:boolean;

    submitting(event:Event){
        event.preventDefault();
    }
    getid(){
        return (<any>this.$refs.box).id;
    }
    protected gid(){
        return uid('fl');
    }
    filechanged(){
        let form = <HTMLFormElement>this.$el;
        let fd = new FormData(form);
        if (this.auto){
            this.output('Uploading ...');
            send(this.action, {form:fd}, 'post').then((o)=>{
                console.log(o);
            }).catch((e)=>{
                console.warn(e);
            });
        }else{
            //let path = (<any>this.$refs.box).value;
            let img = this.$refs.img;
            let inp = this.$refs.box;
            readURL(img, inp);
            //this.output(path);
        }
    }
    output(text:string){
        (<any>this.$refs.text).innerHTML = text;
    }
    mounted(){
        let f = <Vue>this.$refs.frm;
        let frm = <HTMLFormElement>f.$el;
        frm.onsubmit = function(event:Event){
            event.preventDefault();
        }
        let box = <any>this.$refs.box;
        let label = <any>this.$refs.label;
        label.setAttribute('for', box.id);
    }
}

