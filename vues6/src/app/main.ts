import * as Vue from "vue";
import UniqueId from "./plugins/uniqueid"
import ParentUnit from "./plugins/parentunit";
import {
    IconToggleDropDown
    , Icon
    , IconToggleMenu
    , IconSortUp
    , IconSortDown
    , IconPlaceholder
} from "./components/IconComponent";
import {AutoComponent, AutoComponents} from "./components/AutoComponent";
import {DynComponent, DynsComponent, DynamicComponent} from "./components/dyncomponent";
import {GridComponent} from "./components/gridcomponent";
import {TestComponent} from "./components/testcomponent";
import {FormContainer
        //, Uploader
        , ManualUploader
        , UploadItem
        , SimplePreview
} from "./components/form";
import {Uploads} from "./components/uploaders";
import {join} from '../../../../kernel/src/common'
import {init} from '../../../../kernel/src/web/init';
import {Widget} from '../../../../kernel/src/web/widgets/widget';
import {UploadWidget} from '../../../../kernel/src/web/widgets/widgetupload';
import {IconWidget} from '../../../../kernel/src/web/widgets/widgeticon';
import {ForWidget} from '../../../../kernel/src/web/widgets/widgetfor';

let w = <any>window;
w.v = Vue;
w.join = join;
Widget.init({
    tst: new UploadWidget()
    ,icon: new IconWidget()
    ,for: new ForWidget()
});

Vue.use(UniqueId);
Vue.use(ParentUnit);
Vue.component('w.icon', Icon);
Vue.component('w.icon-toggle-menu', IconToggleMenu);
Vue.component('w.icon-toggle-dropdown', IconToggleDropDown);
Vue.component('w.icon-sort-up', IconSortUp);
Vue.component('w.icon-sort-down', IconSortDown);
Vue.component('w.icon-placeholder', IconPlaceholder);
Vue.component('w.auto', AutoComponent);
Vue.component('w.autos', AutoComponents);
Vue.component('w.grid', GridComponent);
Vue.component('w.form', FormContainer);
Vue.component('w.upload', ManualUploader);
Vue.component('w.uploads', Uploads);
Vue.component('d', DynamicComponent);
Vue.component('test', TestComponent);

init();