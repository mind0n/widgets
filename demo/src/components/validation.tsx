import "reflect-metadata";

export interface iValidatable{
    validators:{():boolean}[];
    modelErrors:string[];
}

export function required(target:any, prop: string | symbol){
    if (!target.validators){
        target.validators = [];
    }
    if (!target.modelErrors){
        target.modelErrors = [];
    }
    target.validators.push(function():boolean{
        if (!!this[prop]){
            return true;
        }else{
            this.modelErrors.push(prop.toString().concat(' cannot be empty!'));
        }
    });
}

