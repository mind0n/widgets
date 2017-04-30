var gulp        =   require("gulp");
var browserify  =   require("browserify");
var source      =   require('vinyl-source-stream');
var tsify       =   require("tsify");
var uglify      =   require('gulp-uglify');
var buffer      =   require('vinyl-buffer');

gulp.task("default", function () {
    return browserify({
        basedir: './src',
        debug: true,
        entries: ['./app/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('widgets.js'))
    .pipe(gulp.dest("dist"));
});

gulp.task("prod", function () {
    return browserify({
        basedir: './src',
        debug: false,
        entries: ['./app/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('widgets.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest("dist"));
});