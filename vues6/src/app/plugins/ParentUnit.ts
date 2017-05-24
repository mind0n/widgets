function parentUnit(name?:string){
  if (name){
    name = name.toLowerCase();
  }
  let par = this.$parent;
  let tag = par.$options._componentTag;
  if (tag){
    tag = tag.toLowerCase();
  }else{
    tag = 'unknown';
  }
  while(name && tag){
    if (name == tag || !par.$parent || par == this.$root){
      break;
    }
    par = par.$parent;
    tag = par.$options._componentTag?par.$options._componentTag:'unknown';
  }
  return par;
}
// This is your plugin object. It can be exported to be used anywhere.
const ParentUnit = {
  // The install method is all that needs to exist on the plugin object.
  // It takes the global Vue object as well as user-defined options.
  install(Vue:any, options:any) {
    // We call Vue.mixin() here to inject functionality into all components.
  	Vue.mixin({
      // Anything added to a mixin will be injected into all components.
      // In this case, the mounted() method runs when the component is added to the DOM.
      beforeCreate() {
        this.unit = parentUnit;
      },
      mounted(){
        this.$el.unit = function(name?:string){
            return this.__vue__.unit(name);
        };
      }
    });
  }
};

export default ParentUnit;