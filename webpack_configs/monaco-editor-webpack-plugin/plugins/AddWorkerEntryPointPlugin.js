const singleEntry = require('webpack/lib/SingleEntryPlugin');
const loaderTarget = require('webpack/lib/LoaderTargetPlugin');
const webworker = require('webpack/lib/webworker/WebWorkerTemplatePlugin');

class AddWorkerEntryPointPlugin {
  constructor({
    id,
    entry,
    filename,
    chunkFilename = undefined,
    plugins = undefined,
  }) {
    this.options = { id, entry, filename, chunkFilename, plugins };
  }

  apply(compiler) {
    const { id, entry, filename, chunkFilename, plugins } = this.options;
    compiler.plugin('make', (compilation, callback) => {
      const outputOptions = {
        filename,
        chunkFilename,
        publicPath: compilation.outputOptions.publicPath,
        // HACK: globalObject is necessary to fix https://github.com/webpack/webpack/issues/6642
        globalObject: 'this',
      };
      const childCompiler = compilation.createChildCompiler(id, outputOptions, [
        new webworker(),
        new loaderTarget('webworker'),
        new singleEntry(compiler.context, entry, 'main'),
      ]);
      plugins.forEach((plugin) => plugin.apply(childCompiler));
      childCompiler.runAsChild(callback);
    });
  }
}

module.exports = AddWorkerEntryPointPlugin;
