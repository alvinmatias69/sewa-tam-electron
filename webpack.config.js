const path = require('path')
const webpack = require('webpack')

let config = {
  entry: [
    './src/initialize.js',
    './src/dataProcess.js',
    './src/index.js'
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'target'),
    libraryTarget: 'var',
    library: 'EntryPoint'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
  ],
  devServer: {
    contentBase: path.resolve(__dirname, './target'),
    historyApiFallback: true,
    inline: true,
    open: true
  }
}

module.exports = config

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin()
  )
}
