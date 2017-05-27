import * as Vue from 'vue';
import Component from 'vue-class-component';
import {Widget} from './widget';
import {extend, find, clone, all, add, addrange, uid, clear, unique} from '../../../../../kernel/src/common';
import {addcss, destroy} from '../../../../../kernel/src/web/element';
import {send} from '../../../../../kernel/src/web/network';

class UploadItem{
    constructor(public file:File){

    }
    isimg:boolean;
    url:any;
    
    private percent:number;

    get type():string{
        return this.file.type;
    }

    loadinput(callback?:Function){
        let r = new FileReader();
        let self = this;
        //this.file = file;
        r.onload = (e:any)=>{
            self.url = e.target.result;
            if (callback){
                callback(e);
            }
        }
        r.readAsDataURL(this.file);
    }
    loadclip(item:any){
        let f = item.getAsFile();
        this.loadinput(f);
    }
    getprogress(){
        return this.percent;
    }
    setprogress(p:number){
        this.percent = p;
    }
}


@Component({
    template: `
        <div class="preview">
            <img style="display:none" ref="img" /><br />
            <span ref="pg"></span>
        </div>
    `
    , props:["item"]
    , components:{
    }
})
export class Preview extends Widget{
    item:UploadItem;
    rendering(){
        let img = <any>this.$refs.img;
        img.src = this.item.url;
        if (this.item.url){
            img.style.display = '';
        }
    }
    progress(){
        let p = this.item.getprogress() || 0;
        (<any>this.$refs.pg).innerHTML = p + '%';
    }
    updated(){
        this.rendering();
    }
    mounted(){
        this.rendering();
    }
}

@Component({
    template: `
        <div class="previews">
            <Preview ref="children" v-for="x in previewItems()" :item="x" :key="$uid()" />
        </div>
    `
    , props:[]
    , components:{
        Preview
    }
})
export class Previews extends Widget{
    protected list:UploadItem[] = [];
    protected hpreview:any;
    protected hprogress:any;
    protected previewCount:number;
    protected progressCount:number; 
    previewItems(){
        return this.list;
    }
    progress(done?:boolean){
        if (done === true){
            this.progressCount--;
            if (this.progressCount <= 0){
                window.clearInterval(this.hprogress);
                console.log('Progress completed');
            }else{
                console.log('Progress decrease');
            }
        }else if (done === undefined){
            this.progressCount = 0;
            this.hprogress = window.setInterval(()=>{
                all(this.$refs.children, (item:Preview, i:any)=>{
                    item.progress();
                });
            },200);
        }else{
            this.progressCount++;
            console.log('Progress increase');
        }
    }
    update(list:UploadItem[]){
        let self = this;
        //clear(self.list);
        self.list = list;
        self.previewCount = 0;
        all(list, (item:UploadItem, i:number)=>{
            item.loadinput((e:any)=>{
                self.previewCount++;
            });
        });
        self.hpreview = window.setInterval(function(){
            if (self.previewCount >= self.list.length){
                window.clearInterval(self.hpreview);
                all(self.$refs.children, (ch:any, i:number)=>{
                    ch.rendering();
                });
                self.$emit('previewed', self.list);
            }
        },200);
    }
}

@Component({
    template: `
        <div class="w-upload">
            <Previews v-show="showpreview()" ref="previews" @previewed="previewCompleted" />
            <label ref="label" style="cursor:pointer;">
                <slot></slot>
            </label>
        </div>
    `
    , props:["action"]
    , components:{
        Previews
    }
})
export class Uploads extends Widget{
    protected uploads:UploadItem[] = [];
    protected action:string;
    protected showpreview(){
        return this.uploads && this.uploads.length > 0;
    }
    protected fileChanged(files:FileList[]){
        clear(this.uploads);
        all(files, (item:File, i:number)=>{
            if (unique(this.uploads, item, (it:UploadItem, t:any)=>{
                return it.file == t;
            })){
                let f = new UploadItem(item);
                add(this.uploads, f);
            }
        });
        let p = <Previews>this.$refs.previews;
        p.update(this.uploads);
        this.$forceUpdate();
    }
    protected previewCompleted(list:UploadItem[]){
        console.log('Preview completed');
        let pvs = <Previews>this.$refs.previews;
        pvs.progress();
        all(this.uploads, (up:UploadItem, i:number)=>{
            pvs.progress(false);
            send(`http://localhost:8888/s/values?n=${up.file.name}`
            ,{
                method:'post'
                , header:{
                    'content-type':up.file.type
                    , 'content-dispositon':`attachment; filename=${up.file.name}`
                }
                , progress: (event:any)=>{
                    let p = (event.loaded / event.total) * 100;
                    up.setprogress(p);
                }
                , raw:up.file
            }).then((o:any)=>{
                pvs.progress(true);
            }).catch((e:any)=>{
                console.error(e);
                pvs.progress(true);
            });
        });
    }
    mounted(){
        let self = this;
        let input = <HTMLInputElement>document.createElement('input');
        input.type = "file";
        input.className = "w-file";
        input.id = this.gid();
        input.setAttribute('multiple', "true");
        input.onchange = function(event:any){
            let t = event.currentTarget || event.srcElement;
            self.fileChanged(t.files);
        }
        let label = <any>this.$refs.label;
        label.setAttribute('for', input.id);
        document.body.appendChild(input);
    }
    updated(){
        console.log('Uploader updated');
    }
    destroyed(){
        if (this.uploads.length > 0){
            all(this.uploads, (item:any, i:any)=>{
                destroy(item);
            });
        }
    }
    protected gid(){
        return uid('fl');
    }
}

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
// export class Uploader extends Widget{
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

