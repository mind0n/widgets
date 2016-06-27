import * as React from "react";
import * as ReactDOM from "react-dom";
import {HelloComponent} from "./components/Hello";

let id:string = "example";
ReactDOM.render(
    <HelloComponent compiler="TypeScript2" framework="React2" />,
    document.getElementById(id)
);