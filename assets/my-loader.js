module.exports = function(source){
    // var tmp = fs.readFileSync("loader-template.js").toString();
    // var src = source;
    // src = src.replace(/\\/ig, "\\\\");
    // src = src.replace(/\'/ig, "\\'");
    // src = src.replace(/\"/ig, "\\\"");
    // src = src.replace(/\r/ig, "\\r");
    // src = src.replace(/\n/ig, "\\n");
    // tmp = tmp.replace("loadertemplatecontent", src);
    // return tmp;
    var src = source;
    src = src.replace(/\\/ig, "\\\\");
    src = src.replace(/\'/ig, "\\'");
    src = src.replace(/\"/ig, "\\\"");
    src = src.replace(/\r/ig, "\\r");
    src = src.replace(/\n/ig, "\\n");
    console.log("====================>" + src);
    //[[module.id, content, '']]
    return 'var content = "'+src+'";module.exports = content;';
};

