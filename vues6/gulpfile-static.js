var gulp        =   require("gulp");

gulp.task("default", function () {
    return gulp.src("./src/*.html")
        .pipe(gulp.dest("dist/"));
});

