function uid(){
    if (this.uid === undefined){
        this.uid = this._uid;
    }
    return this.uid;
}
// This is your plugin object. It can be exported to be used anywhere.
const UniqueId = {
  // The install method is all that needs to exist on the plugin object.
  // It takes the global Vue object as well as user-defined options.
  install(Vue, options) {
    // We call Vue.mixin() here to inject functionality into all components.
  	Vue.mixin({
      // Anything added to a mixin will be injected into all components.
      // In this case, the mounted() method runs when the component is added to the DOM.
      beforeCreate() {
        this.$uid = uid;
        this.console = console;
        this.refresh = function(){
          this.$forceUpdate();
        }
      },
      mounted(){
        this.$el.$uid = function(){
            return this.__vue__.$uid();
        };
      }
    });
  }
};

export default UniqueId;