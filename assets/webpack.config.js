var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var exCss = new ExtractTextPlugin('[name].bundle.css');
var exScss = new ExtractTextPlugin('[name].bundle.css');
var exTs = new ExtractTextPlugin('[name].bundle.js');
var exJs = new ExtractTextPlugin('[name].bundle.js');

var ugjs = new webpack.optimize.UglifyJsPlugin({
	output:{
		comments:false
	}
});

module.exports = {
    entry: {
		wo:"./src/wo.script.entry.js",
        themes:"./src/wo.css.entry.js",
        lib:"./src/lib.script.entry.js"
	},
	devtool: "source-map",
    output: {
        path: __dirname + "/bundle",
		publicPath: "/assets/",
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [
			{ test: /\.css$/, loader: exCss.extract(["css"]) },
			{ test: /\.scss$/, loader: exScss.extract(["css", "sass"]) },
            { test:/\.ts$/, loader: exTs.extract([path.join(__dirname, "my-loader.js"), "ts-loader"]) },
            { test:/\jquery.js$/, loader: exJs.extract([path.join(__dirname, "my-loader.js")]) },
        ]
    },
	plugins: [exCss, exTs, exJs, exScss],
    sassLoader:{
        includePaths:[path.resolve(__dirname, "./src")]
    }
};