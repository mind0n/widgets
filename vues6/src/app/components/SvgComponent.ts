import * as Vue from 'vue'
import Component from 'vue-class-component'

// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M8 13L16 22L24 13L16 22"></path>
        </svg>
    `
})
export class IconToggleDropDown extends Vue {

}
