const _ = require('lodash');
const fs = require('fs');
const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const flow = require('rollup-plugin-flow');
const resolve = require('rollup-plugin-node-resolve');

const
  readJSON = _.flow(fs.readFileSync, JSON.parse),
  pkg = readJSON('package.json');

module.exports = {
  entry: 'src/index.js',
  targets: [{
    dest: pkg.main,
    format: 'cjs'
  }, {
    dest: pkg.module,
    format: 'es'
  }],
  sourceMap: false,
  external: ['react', 'xstream', 'prop-types'],
  plugins: [
    commonjs(),
    resolve(),
    flow(),
    buble({
      objectAssign: 'Object.assign',
    }),
  ]
};
