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
    ],
  },
  resolve: {
    alias: {
      '@cameras': path.resolve('./src/client', 'cameras/'),
      '@core': path.resolve('./src/client', 'core/'),
      '@math': path.resolve('./src/client', 'math/'),
      '@libs': path.resolve('./src/client', 'libs/'),
      '@typings': path.resolve('./src/client', 'typings/'),
      '@geometries': path.resolve('./src/client', 'geometries/'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../dist/client'),
  },
};
