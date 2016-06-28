var webpack = require("webpack");

var ug = new webpack.optimize.UglifyJsPlugin({
	output:{
		comments:false
	}
});

module.exports = {
    entry: {
        demo:"./src/index.tsx",
        theme:"./src/theme.tsx"
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
            { test: /\.tsx?$/, loader: "ts-loader" },
            { test: /\.css?$/, loader: "style-loader!css-loader" }
        ],
        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins:[
        new webpack.ProvidePlugin({$: "jquery", jQuery:"jquery", jquery:"jquery"})
    ],
    externals: {
        "jquery": "jquery",
        "react": "React",
        "react-dom": "ReactDOM",
    },
    devServer:{
        contentBase: ".",
        host:"localhost",
        port:8888,
        inline:true,
        hot:true,
        watchOptions: {
            aggregateTimeout: 300,
            poll:100
        }
    }
};