const path = require('path');

module.exports = {
    entry: './src/client/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'bin/public'),
    },
    module: {
        rules: [
            { test: /\.css$/, use: 'css-loader' },
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                    ['@babel/preset-env', { targets: "defaults" }]
                    ]
                }
                }
            }
        ]
    }
};