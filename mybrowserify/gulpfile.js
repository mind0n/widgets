// https://zhongsp.gitbooks.io/typescript-handbook/content/doc/handbook/tutorials/Gulp.html

var gulp        = require("gulp");
var browserify  = require("browserify");
var source      = require('vinyl-source-stream');
var tsify       = require("tsify");
var web         = require("gulp-webserver");

var paths = {
    pages: ['src/*.html']
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("default", ["copy-html"], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("dist"));
});

gulp.task("dev", ["default"], function(){
    gulp.src('./dist').pipe(web({
        fallback:"index.html",
        host:"127.0.0.1",
        port:9999,
        livereload:true,
        directoryListing:false,
        open:false
    }));
});