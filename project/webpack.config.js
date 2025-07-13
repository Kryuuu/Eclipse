const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/russian_roulette_frontend/assets/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.CANISTER_ID_RUSSIAN_ROULETTE_BACKEND': JSON.stringify(process.env.CANISTER_ID_RUSSIAN_ROULETTE_BACKEND || 'rrkah-fqaaa-aaaah-qcu7q-cai'),
      'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
      'process.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaah-qdrqq-cai'),
      'process': JSON.stringify({})
    }),
    new HtmlWebpackPlugin({
      template: './src/russian_roulette_frontend/assets/index.html',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/russian_roulette_frontend/assets',
          to: '.',
          globOptions: {
            ignore: ['**/index.html', '**/main.js'],
          },
        },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    hot: true,
  },
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer/"),
      "events": require.resolve("events/"),
      "stream": require.resolve("stream-browserify/"),
      "util": require.resolve("util/"),
    }
  },
};