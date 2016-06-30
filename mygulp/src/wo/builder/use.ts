module wo{
    class Cursor{
        parent:any;
        group:any;
        root:any;
    }

    abstract class Creator{
        name:string;
        abstract create(json:any):any;
    }

    export function use(json:any):any{
        
    }
}