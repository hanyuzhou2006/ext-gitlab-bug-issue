const path = require('path');
module.exports = {
  devtool: false,
  entry: {
    background: './src/background.tsx',
    content: {
      import: './src/content.tsx',
    },
    popup: {
      import: './src/popup.tsx',
    },
    settings: {
      import: './src/settings.tsx',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'esbuild-loader',
          options: {
            loader: 'tsx',
            target: 'es2015'
          }
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      }
    ],

  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"],
  },
  output: {
    path: path.resolve(__dirname, 'prod/js'),
    filename: '[name].js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};