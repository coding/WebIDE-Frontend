"use strict";

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

var loaderUtils = require("loader-utils");

module.exports.pitch = function pitch(remainingRequest) {
  var _this = this;

  var _ref = loaderUtils.getOptions(this) || {},
    _ref$globals = _ref.globals,
    globals = _ref$globals === undefined ? undefined : _ref$globals,
    _ref$pre = _ref.pre,
    pre = _ref$pre === undefined ? [] : _ref$pre,
    _ref$post = _ref.post,
    post = _ref$post === undefined ? [] : _ref$post;

  // HACK: NamedModulesPlugin overwrites existing modules when requesting the same module via
  // different loaders, so we need to circumvent this by appending a suffix to make the name unique
  // See https://github.com/webpack/webpack/issues/4613#issuecomment-325178346 for details

  this._module.userRequest = "include-loader!" + this._module.userRequest;

  return []
    .concat(
      _toConsumableArray(
        globals
          ? Object.keys(globals).map(function(key) {
              return (
                "self[" + JSON.stringify(key) + "] = " + globals[key] + ";"
              );
            })
          : []
      ),
      _toConsumableArray(
        pre.map(function(include) {
          return (
            "require(" + loaderUtils.stringifyRequest(_this, include) + ");"
          );
        })
      ),
      [
        "module.exports = require(" +
          loaderUtils.stringifyRequest(this, "!!" + remainingRequest) +
          ");"
      ],
      _toConsumableArray(
        post.map(function(include) {
          return (
            "require(" + loaderUtils.stringifyRequest(_this, include) + ");"
          );
        })
      )
    )
    .join("\n");
};
