var gulp = require("gulp");
var mcss = require("gulp-clean-css")
var scss = require("gulp-sass");

gulp.task("default", function(){
    gulp.src(["./src/wo/wo.scss"])
        .pipe(scss().on("error", scss.logError))
        .pipe(gulp.dest("./dist/themes"));
});
