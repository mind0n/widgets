import * as Vue from "vue";
import UniqueId from "./plugins/uniqueid"
import {IconToggleDropDown, Icon, IconToggleMenu} from "./components/IconComponent";
import {AutoComponent, AutoComponents} from "./components/AutoComponent";
import {GridComponent} from "./components/gridcomponent";
import {join} from '../../../../kernel/src/common'
import {init} from '../../../../kernel/src/web/init';


let w = <any>window;
w.v = Vue;
w.join = join;
Vue.use(UniqueId);
Vue.component('w.icon', Icon);
Vue.component('w.icon-toggle-menu', IconToggleMenu);
Vue.component('w.icon-toggle-dropdown', IconToggleDropDown);
Vue.component('w.auto', AutoComponent);
Vue.component('w.autos', AutoComponents);
Vue.component('w.grid', GridComponent);

init();