namespace wo{
    export function objextend(o:any, json:any){
        for(let i in json){
            if (o[i] && typeof(o[i]) == 'object'){
                objextend(o[i], json[i]);
            }else{
                o[i] = json[i];
            }
        }
    }
}