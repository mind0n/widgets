var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var exCss = new ExtractTextPlugin('[name].bundle.css');
var exTs = new ExtractTextPlugin('[name].bundle.js');

var ugjs = new webpack.optimize.UglifyJsPlugin({
	output:{
		comments:false
	}
});

module.exports = {
    entry: {
		wo:"./src/wo.script.entry"
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
            { test:/\.ts$/, loader: exTs.extract([path.join(__dirname, "my-loader.js"), "ts-loader"]) }
        ]
    },
	plugins: [exCss, exTs],
};