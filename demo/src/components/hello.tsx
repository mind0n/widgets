import * as React from "react";
import * as ReactDOM from "react-dom";

export class HelloComponent extends React.Component<any, any>{
    render(){
        return <div> Hellow {this.props.compiler} and {this.props.framework}</div>
    }
}