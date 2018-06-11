"use strict";

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var singleEntry = require("webpack/lib/SingleEntryPlugin");
var loaderTarget = require("webpack/lib/LoaderTargetPlugin");
var webworker = require("webpack/lib/webworker/WebWorkerTemplatePlugin");

var AddWorkerEntryPointPlugin = (function() {
  function AddWorkerEntryPointPlugin(_ref) {
    var id = _ref.id,
      entry = _ref.entry,
      filename = _ref.filename,
      _ref$chunkFilename = _ref.chunkFilename,
      chunkFilename =
        _ref$chunkFilename === undefined ? undefined : _ref$chunkFilename,
      _ref$plugins = _ref.plugins,
      plugins = _ref$plugins === undefined ? undefined : _ref$plugins;

    _classCallCheck(this, AddWorkerEntryPointPlugin);

    this.options = {
      id: id,
      entry: entry,
      filename: filename,
      chunkFilename: chunkFilename,
      plugins: plugins
    };
  }

  _createClass(AddWorkerEntryPointPlugin, [
    {
      key: "apply",
      value: function apply(compiler) {
        var _options = this.options,
          id = _options.id,
          entry = _options.entry,
          filename = _options.filename,
          chunkFilename = _options.chunkFilename,
          plugins = _options.plugins;

        compiler.plugin("make", function(compilation, callback) {
          var outputOptions = {
            filename: filename,
            chunkFilename: chunkFilename,
            publicPath: compilation.outputOptions.publicPath,
            // HACK: globalObject is necessary to fix https://github.com/webpack/webpack/issues/6642
            globalObject: "this"
          };
          var childCompiler = compilation.createChildCompiler(
            id,
            outputOptions,
            [
              new webworker(),
              new loaderTarget("webworker"),
              new singleEntry(compiler.context, entry, "main")
            ]
          );
          plugins.forEach(function(plugin) {
            return plugin.apply(childCompiler);
          });
          childCompiler.runAsChild(callback);
        });
      }
    }
  ]);

  return AddWorkerEntryPointPlugin;
})();

module.exports = AddWorkerEntryPointPlugin;
