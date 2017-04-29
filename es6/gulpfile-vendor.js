var gulp        =   require("gulp");
var clean       =   require('gulp-clean');
var runSequence =   require('run-sequence');
var shell       =   require('gulp-shell');

gulp.task('default', function(done){
    return runSequence('theme:prepare', 'theme:copy', function(){
        done();
    });
});

gulp.task('theme:prepare',shell.task(['gulp --gulpfile ../../themes/gulpfile.js']));
gulp.task('theme:copy', function(done){
    return gulp.src([
            '../../themes/dist/**/*.*'
            ,'!../../themes/dist/**/*.html'

        ])
        .pipe(gulp.dest('./dist'));
});
