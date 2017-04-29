var gulp        =   require("gulp");
var runSequence =   require('run-sequence');

var reg         =   require('gulp-task-register');
reg([
    'clean'
    , 'vendor'
    , 'static'
    , 'ts'
    , '_host'
    , '_watch:css'
    , '_watch:html'
]);
gulp.task("default", function(done){
    runSequence('vendor', 'static', function() {
        done();
    });
});
gulp.task("prod", function(done){
    runSequence('clean', 'vendor', 'ts', function() {
        done();
    });
});

