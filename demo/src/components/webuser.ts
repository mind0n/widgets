import {required} from "./validation";
import {iValidatable} from "./validation";

export default class WebUser implements iValidatable {
    @required
    UserId: string;

    @required
    Pwd: string;

    validators:{():boolean}[];
    modelErrors:string[];

    constructor(userId?: string, pwd?: string) {
        this.UserId = userId;
        this.Pwd = pwd;
        //this.validators = [];
        //this.modelErrors = [];
    }

    validate():boolean{
        let rlt = true;
        if (this.validators != null && this.validators.length > 0){
            for(let v of this.validators){
                rlt = rlt && v.call(this);
            }
        }
        console.log(this.modelErrors);
        return rlt;
    }
}



