function wo(selector){
    if (!selector){
        return [];
    }
    var rlt = document.querySelectorAll(selector);
    return rlt;
}