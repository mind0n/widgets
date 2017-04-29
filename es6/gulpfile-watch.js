var gulp    =   require('gulp');
var shell   =   require('gulp-shell');

gulp.task("css", function(){
    gulp.watch(["./src/**/*.ts"], ["rebuild"]);
});
gulp.task("html", function(){
    gulp.watch(["./src/**/*.html"], ["recopy"]);
});
gulp.task("rebuild", shell.task(['gulp --gulpfile gulpfile.js']));
gulp.task("recopy", shell.task(['gulp --gulpfile gulpfile-static.js']));
