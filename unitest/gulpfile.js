var gulp    =   require("gulp");
var mcss    =   require("gulp-clean-css");
var scss    =   require("gulp-sass");
var ts      =   require("gulp-typescript");
var ut      =   require("gulp-typescript");
var minify  =   require("gulp-minify");
var map     =   require("gulp-sourcemaps");
var web     =   require("gulp-webserver");
var bnd     =   require("gulp-concat");
var nocmt   =   require("gulp-strip-comments");
var jade    =   require("gulp-jade");
var b64     =   require("gulp-base64");

var tsproj = ts.createProject("tsconfig.json");
var utproj = ut.createProject("tsconfig.test.json");


function buildev(){
    gulp.src(["./node_modules/jquery/dist/jquery.js", "./src/lib/velocity.js"])
        .pipe(gulp.dest("./dist/scripts"))
    gulp.src(["./src/**/*.scss"])
        .pipe(scss().on("error", scss.logError))
        .pipe(b64({
            maxImageSize: 8*1024,
            deleteAfterEncoding: false
        }))
        .pipe(gulp.dest("./dist/themes"));
    gulp.src("./src/**/*.jade")
        .pipe(jade({
            pretty:true,
            compileDebug:true,
            doctype:"html",
            locals:{mode:"dev"}
        }))
        .pipe(gulp.dest("./dist"));

    var tsResult = tsproj.src()
        .pipe(map.init())
        .pipe(ts(tsproj));

    tsResult.js
        .pipe(bnd("wo.js"))
        .pipe(map.write())
        .pipe(gulp.dest("./dist/scripts"));    
}

function buildtest(){
    gulp.src(["./node_modules/jquery/dist/jquery.js", "./src/lib/velocity.js"])
        .pipe(minify({ext:{src:".js", min:"-min.js"}, ignoreFiles:["-min.js"], exclude:["tasks"]}))
        .pipe(gulp.dest("./dist/scripts"))
    gulp.src(["./src/**/*.scss"])
        .pipe(scss().on("error", scss.logError))
        .pipe(mcss({compatibility:"ie8"}))
        .pipe(gulp.dest("./dist/themes"));

    gulp.src("./src/**/*.jade")
        .pipe(jade({
            pretty:false,
            doctype:"html",
            locals:{mode:"test"}
        }))
        .pipe(gulp.dest("./dist"));

    var tsResult = tsproj.src()
        .pipe(ts(tsproj));

    tsResult.js
        .pipe(nocmt())
        .pipe(bnd("wo.js"))
        .pipe(minify({ext:{src:".js", min:"-min.js"}, ignoreFiles:["-min.js"], exclude:["tasks"]}))
        .pipe(gulp.dest("./dist/scripts"));    
}

gulp.task("default", function(){
    buildev();
});

gulp.task("ut", function(){
    buildev();
    var tsResult = utproj.src()
        .pipe(ts(utproj));

    tsResult.js
        .pipe(nocmt())
        .pipe(bnd("tests.js"))
        .pipe(minify({ext:{src:".js", min:"-min.js"}, ignoreFiles:["-min.js"], exclude:["tasks"]}))
        .pipe(gulp.dest("./dist/tests"));

    gulp.src('./').pipe(web({
        fallback:"spec/specrunner.html",
        host:"127.0.0.1",
        port:9999,
        livereload:true,
        directoryListing:false,
        open:true
    }));    
});

gulp.task("deploy", function(){
    gulp.src(["./dist/scripts/*-min.*"])
        .pipe(gulp.dest("../../widgetonline.github.io/scripts"));
    gulp.src(["./dist/themes/lib/*.*"])
        .pipe(gulp.dest("../../widgetonline.github.io/themes/lib"));
    gulp.src(["./dist/themes/wo/*.*"])
        .pipe(gulp.dest("../../widgetonline.github.io/themes/wo"));
    gulp.src(["./dist/*.html"])
        .pipe(gulp.dest("../../widgetonline.github.io"));
});


gulp.task("test", function(){
    buildtest();
});

gulp.task("dev", function(){
    buildev();
    gulp.src('./dist').pipe(web({
        fallback:"index.html",
        host:"127.0.0.1",
        port:9999,
        livereload:true,
        directoryListing:false,
        open:false
    }));
});

gulp.task("watch", ["default"], function(){
    gulp.watch("./src/**/*.*", ["default"]);
});
