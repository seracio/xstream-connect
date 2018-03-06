const fs = require('fs');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

module.exports = {
    input: 'src/index.js',
    outputs: [
        {
            file: pkg.main,
            format: 'cjs'
        },
        {
            file: pkg.module,
            format: 'es'
        }
    ],
    sourceMap: false,
    external: ['react', 'xstream'],
    plugins: [babel(), commonjs(), resolve()]
};
