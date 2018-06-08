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

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

var _slicedToArray = (function() {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function(arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance"
      );
    }
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var path = require("path");
var webpack = require("webpack");
var AddWorkerEntryPointPlugin = require("./plugins/AddWorkerEntryPointPlugin");
var INCLUDE_LOADER_PATH = require.resolve("./loaders/include");

var IGNORED_IMPORTS = _defineProperty(
  {},
  resolveMonacoPath("vs/language/typescript/lib/typescriptServices"),
  ["fs", "path", "os", "crypto", "source-map-support"]
);
var MONACO_EDITOR_API_PATHS = [
  resolveMonacoPath("vs/editor/editor.main"),
  resolveMonacoPath("vs/editor/editor.api")
];
var WORKER_LOADER_PATH = resolveMonacoPath(
  "vs/editor/common/services/editorSimpleWorker"
);
var EDITOR_MODULE = {
  label: "editorWorkerService",
  entry: undefined,
  worker: {
    id: "vs/editor/editor",
    entry: "vs/editor/editor.worker",
    output: "editor.worker.js",
    fallback: undefined
  },
  alias: undefined
};
var LANGUAGES = require("./languages");
var FEATURES = require("./features");

function resolveMonacoPath(filePath) {
  return require.resolve(path.join("monaco-editor/esm", filePath));
}

var languagesById = fromPairs(
  flatMap(toPairs(LANGUAGES), function(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      id = _ref2[0],
      language = _ref2[1];

    return [id]
      .concat(_toConsumableArray(language.alias || []))
      .map(function(label) {
        return [label, _extends({ label: label }, language)];
      });
  })
);
var featuresById = mapValues(FEATURES, function(feature, key) {
  return _extends({ label: key }, feature);
});

var MonacoWebpackPlugin = (function() {
  function MonacoWebpackPlugin() {
    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, MonacoWebpackPlugin);

    var languages = options.languages || Object.keys(languagesById);
    var features = options.features || Object.keys(featuresById);
    var output = options.output || "";
    this.options = {
      languages: languages
        .map(function(id) {
          return languagesById[id];
        })
        .filter(Boolean),
      features: features
        .map(function(id) {
          return featuresById[id];
        })
        .filter(Boolean),
      output: output
    };
  }

  _createClass(MonacoWebpackPlugin, [
    {
      key: "apply",
      value: function apply(compiler) {
        var _options = this.options,
          languages = _options.languages,
          features = _options.features,
          output = _options.output;

        var publicPath = getPublicPath(compiler);
        var modules = [EDITOR_MODULE].concat(
          _toConsumableArray(languages),
          _toConsumableArray(features)
        );
        var workers = modules
          .map(function(_ref3) {
            var label = _ref3.label,
              alias = _ref3.alias,
              worker = _ref3.worker;
            return worker && _extends({ label: label, alias: alias }, worker);
          })
          .filter(Boolean);
        var rules = createLoaderRules(languages, features, workers, publicPath);
        var plugins = createPlugins(workers, output);
        addCompilerRules(compiler, rules);
        addCompilerPlugins(compiler, plugins);
      }
    }
  ]);

  return MonacoWebpackPlugin;
})();

function addCompilerRules(compiler, rules) {
  var compilerOptions = compiler.options;
  var moduleOptions = compilerOptions.module || (compilerOptions.module = {});
  var existingRules = moduleOptions.rules || (moduleOptions.rules = []);
  existingRules.push.apply(existingRules, _toConsumableArray(rules));
}

function addCompilerPlugins(compiler, plugins) {
  plugins.forEach(function(plugin) {
    return plugin.apply(compiler);
  });
}

function getPublicPath(compiler) {
  return (compiler.options.output && compiler.options.output.publicPath) || "";
}

function stripTrailingSlash(string) {
  return string.replace(/\/$/, "");
}

function createLoaderRules(languages, features, workers, publicPath) {
  if (!languages.length && !features.length) {
    return [];
  }
  var languagePaths = languages
    .map(function(_ref4) {
      var entry = _ref4.entry;
      return entry;
    })
    .filter(Boolean);
  var featurePaths = features
    .map(function(_ref5) {
      var entry = _ref5.entry;
      return entry;
    })
    .filter(Boolean);
  var workerPaths = workers.reduce(function(acc, _ref6) {
    var label = _ref6.label,
      output = _ref6.output;
    return Object.assign(
      acc,
      _defineProperty(
        {},
        label,
        "" + (publicPath ? stripTrailingSlash(publicPath) + "/" : "") + output
      )
    );
  }, {});
  var globals = {
    MonacoEnvironment:
      "((paths) => ({ getWorkerUrl: (moduleId, label) => paths[label] }))(" +
      JSON.stringify(workerPaths, null, 2) +
      ")"
  };
  return [
    {
      test: MONACO_EDITOR_API_PATHS,
      use: [
        {
          loader: INCLUDE_LOADER_PATH,
          options: {
            globals: globals,
            pre: featurePaths.map(function(importPath) {
              return resolveMonacoPath(importPath);
            }),
            post: languagePaths.map(function(importPath) {
              return resolveMonacoPath(importPath);
            })
          }
        }
      ]
    }
  ];
}

function createPlugins(workers, outputPath) {
  var workerFallbacks = workers.reduce(function(acc, _ref7) {
    var id = _ref7.id,
      fallback = _ref7.fallback;
    return fallback
      ? Object.assign(acc, _defineProperty({}, id, resolveMonacoPath(fallback)))
      : acc;
  }, {});
  return [].concat(
    _toConsumableArray(
      Object.keys(IGNORED_IMPORTS).map(function(id) {
        return createIgnoreImportsPlugin(id, IGNORED_IMPORTS[id]);
      })
    ),
    _toConsumableArray(
      uniqBy(workers, function(_ref8) {
        var id = _ref8.id;
        return id;
      }).map(function(_ref9) {
        var id = _ref9.id,
          entry = _ref9.entry,
          output = _ref9.output;
        return new AddWorkerEntryPointPlugin({
          id: id,
          entry: resolveMonacoPath(entry),
          filename: path.join(outputPath, output),
          plugins: [
            createContextPlugin(WORKER_LOADER_PATH, {}),
            new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
          ]
        });
      })
    ),
    _toConsumableArray(
      workerFallbacks
        ? [createContextPlugin(WORKER_LOADER_PATH, workerFallbacks)]
        : []
    )
  );
}

function createContextPlugin(filePath, contextPaths) {
  return new webpack.ContextReplacementPlugin(
    new RegExp("^" + path.dirname(filePath) + "$"),
    "",
    contextPaths
  );
}

function createIgnoreImportsPlugin(targetPath, ignoredModules) {
  return new webpack.IgnorePlugin(
    new RegExp(
      "^(" +
        ignoredModules
          .map(function(id) {
            return "(" + id + ")";
          })
          .join("|") +
        ")$"
    ),
    new RegExp("^" + path.dirname(targetPath) + "$")
  );
}

function flatMap(items, iteratee) {
  return items.map(iteratee).reduce(function(acc, item) {
    return [].concat(_toConsumableArray(acc), _toConsumableArray(item));
  }, []);
}

function toPairs(object) {
  return Object.keys(object).map(function(key) {
    return [key, object[key]];
  });
}

function fromPairs(values) {
  return values.reduce(function(acc, _ref10) {
    var _ref11 = _slicedToArray(_ref10, 2),
      key = _ref11[0],
      value = _ref11[1];

    return Object.assign(acc, _defineProperty({}, key, value));
  }, {});
}

function mapValues(object, iteratee) {
  return Object.keys(object).reduce(function(acc, key) {
    return Object.assign(
      acc,
      _defineProperty({}, key, iteratee(object[key], key))
    );
  }, {});
}

function uniqBy(items, iteratee) {
  var keys = {};
  return items.reduce(function(acc, item) {
    var key = iteratee(item);
    if (key in keys) {
      return acc;
    }
    keys[key] = true;
    acc.push(item);
    return acc;
  }, []);
}

module.exports = MonacoWebpackPlugin;
