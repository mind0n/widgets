import * as Vue from "vue";
import {IconToggleDropDown, Icon, IconToggleMenu} from "./components/IconComponent";
import {AutoComponent, AutoComponents} from "./components/AutoComponent";
import {GridComponent} from "./components/gridcomponent";

(<any>window).v = Vue;

Vue.component('w.icon', Icon);
Vue.component('w.icon-toggle-menu', IconToggleMenu);
Vue.component('w.icon-toggle-dropdown', IconToggleDropDown);
Vue.component('w.auto', AutoComponent);
Vue.component('w.autos', AutoComponents);
Vue.component('w.grid', GridComponent);
