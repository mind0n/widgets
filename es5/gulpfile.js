var gulp        =   require("gulp");
var runSequence =   require('run-sequence');

var reg         =   require('gulp-task-register');
reg([
    'clean'
    , 'vendor'
    , 'bundle'
    , '_host'
    , '_watch:css'
    , '_watch:html'
]);
gulp.task("default", function(done){
    runSequence('vendor', 'bundle', function() {
        done();
    });
});
