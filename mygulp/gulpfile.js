var gulp    =   require("gulp");
var mcss    =   require("gulp-clean-css");
var scss    =   require("gulp-sass");
var ts      =   require("gulp-typescript");
var bundle  =   require("gulp-bundle-assets");
var minify  =   require("gulp-minify");
var map     =   require("gulp-sourcemaps");
var web     =   require("gulp-webserver");   

var tsproj = ts.createProject("tsconfig.json");

gulp.task("default", function(){
    gulp.src(["./src/**/*.scss"])
        .pipe(scss().on("error", scss.logError))
        .pipe(mcss({compatibility:"ie8"}))
        .pipe(gulp.dest("./dist/themes"));

    var tsResult = tsproj.src().pipe(map.init()).pipe(ts(tsproj));
    tsResult.js
        //.pipe(minify({ext:{src:".js", min:"-min.js"}, ignoreFiles:["-min.js"], exclude:["tasks"]}))
        .pipe(map.write())
        .pipe(gulp.dest("./dist/scripts"));    
});
gulp.task("test", function(){
    gulp.src(["./src/**/*.scss"])
        .pipe(scss().on("error", scss.logError))
        .pipe(mcss({compatibility:"ie8"}))
        .pipe(gulp.dest("./dist/themes"));

    var tsResult = tsproj.src().pipe(ts(tsproj));
    tsResult.js
        .pipe(minify({ext:{src:".js", min:"-min.js"}, ignoreFiles:["-min.js"], exclude:["tasks"]}))
        .pipe(gulp.dest("./dist/scripts"));    
});
gulp.task("dev", function(){
    gulp.src('.').pipe(web({
        fallback:"index.html",
        port:9999,
        livereload:true,
        directoryListing:true,
        open:true
    }));
});
gulp.task("host", function(){
    gulp.src('.').pipe(web({
        fallback:"index.html",
        port:9999,
        livereload:false,
        directoryListing:false,
        open:false
    }));
});
gulp.task("watch", ["default"], function(){
    gulp.watch("./src/**/*.*", ["default"]);
});
