const path = require('path');

module.exports = {
  entry: path.resolve('src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'xstream-connect.js',
    library: 'xstreamConnect',
    libraryTarget: "umd",
  },
  externals: {
    'lodash/fp': {
      commonjs: "lodash/fp",
      commonjs2: "lodash/fp",
      amd: "lodash/fp",
      root: "_",
    },
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React",
    },
    xstream: {
      commonjs: "xstream",
      commonjs2: "xstream",
      amd: "xstream",
      root: "xs",
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: [
        path.resolve('node_modules'),
      ],
    }]
  }
};
