const makeEntry = require('./webpack.entries.js');
const path = require('path');
const WebpackBar = require('webpackbar');
const DotEnv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// Only use for mesuring and checking build performance
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

/**
 *  Cleanup empty chunkes js files generated by MiniCssExtractPlugin's bug on webpack 5
 */
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

const isDevelopment = process.env.NODE_ENV !== 'production';

const mode = isDevelopment ? 'development' : 'production';
const devtool = isDevelopment ? 'source-map' : 'hidden-source-map';
const watchOptions = {
  ignored: /node_modules/,
  aggregateTimeout: 500
};
const cacheOptions = isDevelopment
  ? {
    type: 'filesystem',
    cacheLocation: path.resolve(__dirname, 'node_modules/.cache')
  }
  : false;

const plugins = [
  new WebpackBar(),
  new RemoveEmptyScriptsPlugin(),
  new DotEnv({ path: '.env' }),
  new MiniCssExtractPlugin({ filename: '[name].css' })
];

if (isDevelopment) {
  plugins.push(new ForkTsCheckerWebpackPlugin());
}
const entry = makeEntry();

const config = {
  entry,
  mode,
  devtool,
  watchOptions,
  cache: cacheOptions,
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true // https://webpack.js.org/guides/build-performance/#typescript-loader
            }
          }
        ]
      },
      {
        test: /\.module\.scss$/,
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
        test: /\.scss?$/,
        exclude: /\.module\.scss?$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              modules: false,
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
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '/fonts'
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|svg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: false,
              fallback: 'file-loader',
              name: 'images/[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFiles: ['index'],
    // Map all alias from tsconfig.json to webpack alias
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      '@common-styles': path.resolve(__dirname, 'resources/stylesheets/commons')
    }
  },
  plugins,
  optimization: {
    removeAvailableModules: !isDevelopment,
    removeEmptyChunks: !isDevelopment,
    usedExports: true
  },
  output: {
    path: path.resolve(__dirname, 'public/'),
    publicPath: '/'
  }
};

module.exports = config;
