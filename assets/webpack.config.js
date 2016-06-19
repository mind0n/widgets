var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var exCss = new ExtractTextPlugin('[name].bundle.css');
var exScss = new ExtractTextPlugin('[name].bundle.css');

var ugjs = new webpack.optimize.UglifyJsPlugin({
	output:{
		comments:false
	}
});

module.exports = {
    entry: {
		entry:"./src/entry.js"
	},
	devtool: "source-map",
    output: {
        path: __dirname + "/bundle",
		publicPath: "/assets/",
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [
			{ test: /\.css$/, loader: exCss.extract(["css"])},
        ]
    },
	plugins: [exScss, exCss, ugjs]
};