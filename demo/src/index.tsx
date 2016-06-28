import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";

import {HelloComponent} from "./components/Hello";

$(function(){
    let id:string = "target";
    ReactDOM.render(
        <HelloComponent compiler="TypeScript" framework="React" />,
        document.getElementById(id)
    );
});
