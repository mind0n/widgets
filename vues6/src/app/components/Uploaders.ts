import * as Vue from 'vue';
import Component from 'vue-class-component';
import {Widget} from './widget';
import {extend, find, clone, all, add, addrange, uid, clear, unique} from '../../../../../kernel/src/common';
import {addcss, destroy} from '../../../../../kernel/src/web/element';
import {send} from '../../../../../kernel/src/web/network';

class UploadItem{
    constructor(public file:File){

    }
}

class PreviewItem{
    isimg:boolean;
    url:any;
    loadinput(file:File){
        let r = new FileReader();
        let self = this;
        r.onload = (e:any)=>{
            self.url = e.target.result;
        }
        r.readAsDataURL(file);
    }
    loadclip(item:any){
        let f = item.getAsFile();
        this.loadinput(f);
    }
}
@Component({
    template: `
        <div class="w-wrap">
            
        </div>
    `
    , props:[]
    , components:{
    }
})
export class Previews extends Widget{
    protected list:PreviewItem[] = [];
    update(list:UploadItem[]){

    }
}

@Component({
    template: `
        <div class="w-upload">
            <Previews ref="previews" />
            <label ref="label" style="cursor:pointer;">
                <div class="content">
                    <span ref="text">Drag Here - Click Here - Paste Here to upload</span>
                </div>
            </label>
        </div>
    `
    , props:["action"]
    , components:{
        Previews
    }
})
export class Uploads extends Widget{
    protected files:UploadItem[] = [];
    protected action:string;
    protected changed:boolean;
    protected fileChanged(files:FileList[]){
        all(files, (item:File, i:number)=>{
            if (unique(this.files, item, (it:UploadItem, t:any)=>{
                return it.file == t;
            })){
                let f = new UploadItem(item);
                add(this.files, f);
            }
        });
        let p = <any>this.$refs.preview;
        p.update(this.files);
    }
    mounted(){
        let self = this;
        let input = <HTMLInputElement>document.createElement('input');
        input.type = "file";
        input.className = "w-file";
        input.id = this.gid();
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
        if (this.files.length > 0){
            all(this.files, (item:any, i:any)=>{
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

