const entries = require('./webpack.entries.js');
const path = require('path');
const WebpackBar = require('webpackbar');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DotEnv = require('dotenv-webpack');

/**
 *  Cleanup empty chunkes js files generated by MiniCssExtractPlugin's bug on webpack 5
 */
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

const isDevelopment = process.env.NODE_ENV === 'local';

const fileLoaderName = () => isDevelopment ? '[name].[ext]' : '[contenthash].[ext]';

const config = {
  entry: entries,
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'inline-source-map' : 'hidden-source-map',
  cache: true,
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: isDevelopment
            }
          },
          {
            loader: 'resolve-url-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDevelopment
            }
          }
        ]
      },
      {
        test: /\.s(a|c)ss?$/,
        exclude: [/\.module\.s(a|c)ss?$/, /node_modules/],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'resolve-url-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDevelopment
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: fileLoaderName,
              outputPath: '/fonts'
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|svg|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: fileLoaderName,
              outputPath: '/images'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@assets': path.resolve(__dirname, 'resources/assets'),
      '@components': path.resolve(__dirname, 'resources/scripts/components'),
      '@containers': path.resolve(__dirname, 'resources/scripts/containers')
    }
  },
  plugins: [
    new WebpackBar(),
    new RemoveEmptyScriptsPlugin(),
    new DotEnv({
      path: '.env'
    }),
    new MiniCssExtractPlugin({
      filename: isDevelopment ? '[name].css' : '[name].[contenthash].css',
      chunkFilename: isDevelopment ? '[id].css' : '[id].[contenthash].css'
    })
  ],
  optimization: {
    removeEmptyChunks: true
  },
  output: {
    path: path.resolve(__dirname, 'public')
  }
};

module.exports = config;
