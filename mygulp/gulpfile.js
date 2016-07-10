var gulp    =   require("gulp");
var mcss    =   require("gulp-clean-css");
var scss    =   require("gulp-sass");
var ts      =   require("gulp-typescript");
var minify  =   require("gulp-minify");
var map     =   require("gulp-sourcemaps");
var web     =   require("gulp-webserver");
var bnd     =   require("gulp-concat");
var nocmt   =   require("gulp-strip-comments");

var tsproj = ts.createProject("tsconfig.json");
function buildev(){
    gulp.src(["./node_modules/jquery/dist/jquery.js"])
        .pipe(gulp.dest("./dist/scripts"))
    gulp.src(["./src/**/*.scss"])
        .pipe(scss().on("error", scss.logError))
        //.pipe(mcss())
        .pipe(gulp.dest("./dist/themes"));

    var tsResult = tsproj.src()
        .pipe(map.init())
        .pipe(ts(tsproj));

    tsResult.js
        .pipe(bnd("wo.js"))
        .pipe(nocmt())
        .pipe(map.write())
        .pipe(gulp.dest("./dist/scripts"));    
}

function buildtest(){
    gulp.src(["./node_modules/jquery/dist/jquery.js"])
        .pipe(minify({ext:{src:".js", min:"-min.js"}, ignoreFiles:["-min.js"], exclude:["tasks"]}))
        .pipe(gulp.dest("./dist/scripts"))
    gulp.src(["./src/**/*.scss"])
        .pipe(scss().on("error", scss.logError))
        .pipe(mcss({compatibility:"ie8"}))
        .pipe(gulp.dest("./dist/themes"));

    var tsResult = tsproj.src()
        .pipe(nocmt())
        .pipe(ts(tsproj));

    tsResult.js
        .pipe(bnd("wo.js"))
        .pipe(minify({ext:{src:".js", min:"-min.js"}, ignoreFiles:["-min.js"], exclude:["tasks"]}))
        .pipe(gulp.dest("./dist/scripts"));    
}

gulp.task("default", function(){
    buildev();
});

gulp.task("test", function(){
    buildtest();
    gulp.src('./dist').pipe(web({
        fallback:"index.html",
        port:9999,
        livereload:true,
        directoryListing:false,
        open:false
    }));
});

gulp.task("dev", function(){
    buildev();
    gulp.src('./dist').pipe(web({
        fallback:"index.html",
        host:"0.0.0.0",
        port:9999,
        livereload:true,
        directoryListing:false,
        open:true
    }));
});

gulp.task("watch", ["default"], function(){
    gulp.watch("./src/**/*.*", ["default"]);
});
