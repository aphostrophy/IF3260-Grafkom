const path = require('path');

module.exports = {
    entry: './src/client/client.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ],
    },
    resolve: {
        alias: {
            '@cameras': path.resolve('./src/client', 'cameras/'),
            '@core': path.resolve('./src/client', 'core/'),
            '@geometries': path.resolve('./src/client', 'geometries'),
            '@assets': path.resolve('./src/client', 'assets'),
            '@math': path.resolve('./src/client', 'math/'),
            '@typings': path.resolve('./src/client', 'typings/'),
            '@shaders': path.resolve('./src/client', 'shaders/'),
        },
        extensions: ['.ts', '.tsx', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../../dist/client'),
    },
};
