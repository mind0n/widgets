import * as Vue from "vue";
import {IconToggleDropDown, Icon, IconToggleMenu} from "./components/IconComponent";
import {AutoComponent, AutoComponents} from "./components/AutoComponent";

(<any>window).v = Vue;

Vue.component('icon', Icon);
Vue.component('icon-toggle-menu', IconToggleMenu);
Vue.component('icon-toggle-dropdown', IconToggleDropDown);
Vue.component('auto', AutoComponent);
Vue.component('autos', AutoComponents);
