import * as Vue from 'vue';
import Component from 'vue-class-component';
import {Widget} from './widget';
import {extend, find, clone, all, add, uid, clear} from '../../../../../kernel/src/common';
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

function readURL(imgel:any, file:any) {

    if (file) {
        var reader = new FileReader();
        reader.onload = function (e:any) {
            imgel.setAttribute('src', e.target.result);
        }
        reader.readAsDataURL(file);
    }
}


@Component({
    template: `
        <div class="w-wrap w-boundary" v-show="getfile()">
            <w.icon-placeholder v-if="getfile() && !isimg()" classes="preview" vwidth=500 vheight=500 />
            <img :style="showimg()" class="preview" ref="img" />
        </div>
    `
    , props:["files"]
})
export class SimplePreview extends Widget{
    _file:any;
    getfile(){
        return this._file;
    }
    show(){
        return this.getfile()?'':'display:none';
    }
    type(){
        return this._file?this._file.type.split('/')[0]:null;
    }
    showimg(){
        if (this.isimg()){
            return '';
        }
        return 'display:none';
    }
    isimg(){
        return this._file && this._file.type.indexOf('image/') == 0;
    }
    update(file:any){
        this._file = file;
        if (file){
            if (this.isimg()){
                readURL(this.$refs.img, file);
            }
        }
        this.$forceUpdate();
    }
}


@Component({
    template: `
        <div class="w-boundary w-upload">
            <w.form ref="frm" :action="action" type="upload">
                <input ref="box" :id="gid()" name="files" type="file" @change="filechanged()" />
                <label ref="label" style="cursor:pointer;">
                    <div class="content" ref="text">
                        <SimplePreview ref="preview" :style="showpreview()" />
                        <span>Drag Here - Click Here - Paste Here to upload</span>
                    </div>
                </label>
            </w.form>
        </div>
    `
    , props:["action", "auto"]
    , components:{
        SimplePreview
    }
})
export class Uploader extends Widget{
    action:string;
    auto:boolean;
    protected changed:boolean;
    showpreview(){
        if (this.changed){
            return '';
        }
        return 'display:none';
    }
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
        this.changed = true;
        this.$forceUpdate();
        if (this.auto){
            this.output('Uploading ...');
            send(this.action, {form:fd}, 'post').then((o)=>{
                console.log(o);
            }).catch((e)=>{
                console.warn(e);
            });
        }else{
            //let path = (<any>this.$refs.box).value;
            let p = <SimplePreview>this.$refs.preview;
            let inp = <any>this.$refs.box;
            p.update(inp.files[0]);
            //readURL(img, inp);
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
    updated(){
        let box = <any>this.$refs.box;
        let label = <any>this.$refs.label;
        label.setAttribute('for', box.id);
    }
}

