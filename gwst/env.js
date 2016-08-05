exports.karma = {
    files: ['dist/tests/*tests.js']
    ,preprocessors: {
        // "dist/scripts/*.js":["coverage"],
        "dist/tests/*tests.js":["coverage"]
    }
    ,frameworks: ['angular','jasmine']
    ,basepath: ''
    ,reporters: {
        names:['spec', 'coverage']
        ,coverageReporter:{
            type:'html',
            dir:'test-coverage/'
        }
    }
    ,browsers: ["Chrome"]
};

exports.gulp = {
    browserify:{
        basedir: '..'
        ,root: 'gdc.web.spa.test'
        ,entries: function(){
            var rlt = [
                this.dir('spec/1st.tests.ts'), 
                this.dir('spec/2nd.tests.ts')
            ];
            return rlt;
        }
        ,externals: ["jquery","jasmine","react","react-dom"]
        ,outname: 'tests.js'
        ,outdir: 'dist/tests'
        ,dir:function(path){
            var rlt = this.root + "/" + path;
            return rlt;
        }
    }
};

