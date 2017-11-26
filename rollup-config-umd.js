var nodeResolve = require('rollup-plugin-node-resolve');

module.exports = {
  sourceMap: false,
  treeshake: false,
  output: {
    format: 'umd'
  },
  name: "alina",
  context: 'window',
  plugins: [
    nodeResolve({
        jsnext: true, main: true, module: true, browser: true
    })
  ]
};
