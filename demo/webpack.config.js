var webpack = require("webpack");

var ug = new webpack.optimize.UglifyJsPlugin({
	output:{
		comments:false
	}
});
module.exports = {
    entry: {
        demo:"./src/index.tsx"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].bundle.js",
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ],
        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins:[ug],
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};