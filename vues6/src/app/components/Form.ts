import * as Vue from 'vue';
import Component from 'vue-class-component';
import {BaseComponent} from './BaseComponent';
import {extend, find, clone, all, add, uid, clear} from '../../../../../kernel/src/common';
import {addcss} from '../../../../../kernel/src/web/element';
import {send} from '../../../../../kernel/src/web/network';

@Component({
    template: `
        <form :class="classes" :action="action" method="post" :enctype="getype()">
            <slot></slot>
        </form>
    `
    , props:["action", "type", "target", "classes"]
})
export class FormContainer extends BaseComponent{
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
        <div class="w-wrap w-boundary w-inline" v-show="getfile()">
            <w.icon-placeholder v-if="getfile() && !isimg()" classes="preview" vwidth=500 vheight=500 />
            <img :style="showimg()" class="preview" ref="img" />
        </div>
    `
    , props:["files"]
})
export class SimplePreview extends BaseComponent{
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
    isimg(file?:string){
        if (typeof(this._file) == 'string'){
            file = this._file;
        }
        if (!file){
            return this._file && this._file.type.indexOf('image/') == 0;
        }
        return file.lastIndexOf('.png')>0 
            || file.lastIndexOf('.jpg')>0 
            || file.lastIndexOf('.svg')>0 
            || file.lastIndexOf('.gif')>0;
    }
    view(file:string){
        this._file = file;
        if (this.isimg(file)){
            let img = <any>this.$refs.img;
            img.setAttribute('src', file);
            img.style.display = '';
        }
        this.$forceUpdate();
    }
    preview(file:any){
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
        <div class="w-wrap">
            <slot name="previews" v-for="f in getfiles()" v-show="showpreview()"></slot>
            <label v-show="!ischanged()" ref="label" style="cursor:pointer;">
                <div class="content">
                    <span ref="text">Drag Here - Click Here - Paste Here to upload</span>
                </div>
            </label>
            <input ref="box" :id="gid()" class="w-file" name="files" type="file" @change="filechanged()" multiple />
        </div>
    `
    , props:["test"]
    , components:{
        SimplePreview
    }
})
export class UploadItem extends BaseComponent{
    protected test:any;
    protected changed:boolean;
    protected getid(){
        return (<any>this.$refs.box).id;
    }
    protected ischanged(){
        return this.changed;
    }
    protected getfiles(){
        let box = <any>this.$refs.box;
        if (box){
            console.log("Count ", box.files.length);
        }
        return box?box.files.length:1;
    }
    protected filechanged(){
        this.changed = true;
        addcss(this.$el, 'w-inline');

        let unit = (<any>this).unit('w.upload');
        unit.fileChanged();
    }
    protected showpreview(){
        return this.changed;
    }
    updated(){
        this.refreshid();
    }
    mounted(){
        this.refreshid();
    }
    protected refreshid(){
        let box = <any>this.$refs.box;
        let label = <any>this.$refs.label;
        label.setAttribute('for', box.id);

        let children = this.$children;
        all(children, function(item:any, i:number){
            if (i<box.files.length){
                item.preview(box.files[i]);
            }
        });
    }
    protected gid(){
        return uid('fl');
    }
}


@Component({
    template: `
        <div class="w-boundary w-upload">
            <w.form ref="frm" classes="w-center" :action="action" type="upload">
                <UploadItem ref="upitems" v-for="n in count()" :key="$uid()">
                    <template slot="previews" scope="props">
                        <SimplePreview />
                    </template>
                </UploadItem>
                <div class="w-cmd">
                    <button v-if="count()>1 && !isubmitted()" @click="save" type="button">Save</button>
                    <button v-if="count()>=1 && isubmitted()" @click="retry" type="button">Retry</button>
                </div>
            </w.form>
        </div>
    `
    , props:["action", "classes", "onsubmitted"]
    , components:{
        SimplePreview, UploadItem
    }
})
export class ManualUploader extends BaseComponent{
    protected action:string;
    protected _isubmitted:boolean;
    protected upcount:any[];
    protected onsubmitted:any;
    protected isubmitted(){
        return this._isubmitted;
    }

    constructor(options?:any){
        super(options);
        this.upcount = [1];
    }
    retry(){
        //console.log(this.$refs.upitems);
        this._isubmitted = false;
        this.upcount = [];
        this.$forceUpdate();
    }
    save(){
        let frm = <any>this.$refs.frm;
        let fd = frm.$el;
        let self = this;
        send(this.action, {form:fd, upload:true, progress:(p:any, q:any)=>{
            console.log(p, q);
        }}).then((o)=>{
            this._isubmitted = true;
            
            if (this.onsubmitted){
                let t = typeof(this.onsubmitted);
                if (t == 'string'){
                    let h = new Function("res", `return ${this.onsubmitted}`);
                    h.call(window,o.result.files);
                }else if (t == 'function'){
                    let h = <Function>this.onsubmitted;
                    h.call(window, o.result.files);
                }
            }
            self.upcount.splice(self.upcount.length - 1, 1);
            self.$forceUpdate();
        }).catch((e)=>{
            console.warn(e);
        });
    }
    count(){
        return this.upcount.length;
    }
    fileChanged(){
        this.upcount[this.upcount.length] = this.upcount.length;
        this.$forceUpdate();
    }
    updated(){
        if (this.upcount.length < 1){
            this.upcount = [1];
            this.$forceUpdate();
        }
    }
    mounted(){
        document.body.onpaste = function(event:any){
            all(event.clipboardData.items, function(item:any, i:number){
                let f = item.getAsFile();
                console.log(f);
            });
        }
    }
}

// @Component({
//     template: `
//         <div class="w-wrap">
//             <w.form classes="w-center" ref="frm" :action="action" type="upload">
//             <input ref="box" :id="gid()" name="files" type="file" @change="filechanged()" />
//             <slot v-show="showpreview()"></slot>
//             <label v-show="!ischanged()" ref="label" style="cursor:pointer;">
//                 <div class="content">
//                     <span ref="text">Drag Here - Click Here - Paste Here to upload</span>
//                 </div>
//             </label>
//             </w.form>
//         </div>
//     `
//     , props:[]
//     , components:{
//         SimplePreview
//     }
// })
// export class AutoUploadItem extends BaseComponent{
//     protected changed:boolean;
//     getid(){
//         return (<any>this.$refs.box).id;
//     }
//     ischanged(){
//         return this.changed;
//     }
//     filechanged(){
//         this.changed = true;
//         addcss(this.$el, 'w-inline');
//         let box = <any>this.$refs.box;
//         all(this.$children, function(item:any, i:number){
//             item.preview(box.files[0]);
//         });
//         this.$forceUpdate();
//         let unit = (<any>this).unit('w.upload');
//         unit.fileChanged();
//     }
//     showpreview(){
//         return this.changed;
//     }
//     updated(){
//         this.refreshid();
//     }
//     mounted(){
//         this.refreshid();
//     }
//     protected refreshid(){
//         let box = <any>this.$refs.box;
//         let label = <any>this.$refs.label;
//         label.setAttribute('for', box.id);
//     }
//     protected gid(){
//         return uid('fl');
//     }
// }

// @Component({
//     template: `
//         <div class="w-boundary w-upload">
//             <w.form ref="frm" :action="action" type="upload">
//                 <input ref="box" :id="gid()" name="files" type="file" @change="filechanged()" multiple />
//                 <label ref="label" style="cursor:pointer;">
//                     <div class="content">
//                         <SimplePreview ref="preview" :style="showpreview()" />
//                         <span ref="text">Drag Here - Click Here - Paste Here to upload</span>
//                     </div>
//                 </label>
//             </w.form>
//         </div>
//     `
//     , props:["action", "auto"]
//     , components:{
//         SimplePreview
//     }
// })
// export class Uploader extends BaseComponent{
//     action:string;
//     auto:boolean;
//     protected changed:boolean;
//     showpreview(){
//         if (this.changed){
//             return '';
//         }
//         return 'display:none';
//     }
//     submitting(event:Event){
//         event.preventDefault();
//     }
//     getid(){
//         return (<any>this.$refs.box).id;
//     }
//     protected gid(){
//         return uid('fl');
//     }
//     filechanged(){
//         let form = <any>this.$refs.frm;
//         let fd = new FormData(form.$el);
//         this.changed = true;
//         this.$forceUpdate();
//         if (this.auto){
//             this.output('Uploading ...');
//             send(this.action, {form:fd, upload:true}, 'post').then((o)=>{
//                 let p = <SimplePreview>this.$refs.preview;
//                 p.view(o.result.files[0]);
//                 this.output('Upload Accomplished');
//             }).catch((e)=>{
//                 console.warn(e);
//                 this.output('Upload Error');
//             });
//         }else{
//             //let path = (<any>this.$refs.box).value;
//             let p = <SimplePreview>this.$refs.preview;
//             let inp = <any>this.$refs.box;
//             p.preview(inp.files[0]);
//             //readURL(img, inp);
//             //this.output(path);
//         }
//     }
//     output(text:string){
//         (<any>this.$refs.text).innerHTML = text;
//     }
//     mounted(){
//         let f = <Vue>this.$refs.frm;
//         let frm = <HTMLFormElement>f.$el;
//         frm.onsubmit = function(event:Event){
//             event.preventDefault();
//         }
//         let box = <any>this.$refs.box;
//         let label = <any>this.$refs.label;
//         label.setAttribute('for', box.id);
//     }
//     updated(){
//         let box = <any>this.$refs.box;
//         let label = <any>this.$refs.label;
//         label.setAttribute('for', box.id);
//     }
// }

