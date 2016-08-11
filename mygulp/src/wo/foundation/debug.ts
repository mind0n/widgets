function d(msg:string){
    console.log(msg);
    let div = (document.body as any).$debug$;
    if (!div){
        div = document.createElement('div');
        (document.body as any).$debug$ = div;
        document.body.appendChild(div);
    }
    div.innerHTML = msg + '<br/>' + div.innerHTML;
}