var gulp        =   require("gulp");
var clean       =   require('gulp-clean');
var runSequence =   require('run-sequence');
var shell       =   require('gulp-shell');
var bnd         =   require("gulp-concat")
var rename      =   require('gulp-rename');

gulp.task('default', function(done){
    return runSequence('theme:prepare', 'theme:copy', 'js', function(){
        done();
    });
});

gulp.task('theme:prepare',shell.task(['gulp --gulpfile ../../themes/gulpfile.js']));
gulp.task('theme:copy', function(done){
    gulp.src([
            '../../themes/dist/**/*.*'
            ,'!../../themes/dist/**/*.html'
            ,'!../../themes/dist/**/*.css'
        ])
        .pipe(gulp.dest('./dist'));
    return gulp.src([
            '../../themes/dist/**/*.css'
        ])
        .pipe(bnd('vendors.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('js', function(done){
    gulp.src('./node_modules/vue/dist/vue.common.js')
        .pipe(rename('vue.runtime.common.js'))
        .pipe(gulp.dest('./node_modules/vue/dist'));
    gulp.src('./node_modules/vue/dist/vue.js')
        .pipe(rename('vue.runtime.js'))
        .pipe(gulp.dest('./node_modules/vue/dist'));
    gulp.src('./node_modules/vue/dist/vue.esm.js')
        .pipe(rename('vue.runtime.esm.js'))
        .pipe(gulp.dest('./node_modules/vue/dist'));
    gulp.src('./node_modules/vue/dist/vue.min.js')
        .pipe(rename('vue.runtime.min.js'))
        .pipe(gulp.dest('./node_modules/vue/dist'));
    return gulp.src([
            './node_modules/requirejs/require.js'
            ,'./node_modules/vue/dist/vue.js'
            ,'./node_modules/vue/dist/vue.common.js'
        ])
        .pipe(gulp.dest('./dist'));
});
