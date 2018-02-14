/**
* upath http://github.com/anodynos/upath/
*
* A proxy to `path`, replacing `\` with `/` for all results & new methods to normalize & join keeping leading `./` and add, change, default, trim file extensions.
* Version 1.0.0 - Compiled on 2017-02-07 15:36:16
* Repository git://github.com/anodynos/upath
* Copyright(c) 2017 Angelos Pikoulas <agelos.pikoulas@gmail.com>
* License MIT
*/

// Generated by uRequire v0.7.0-beta.29 target: 'lib' template: 'nodejs'

var _ = require('lodash');

var VERSION = '1.0.0'; // injected by urequire-rc-inject-version

var extraFn, extraFunctions, isValidExt, name, path, propName, propValue, toUnix, upath, __slice = [].slice, __indexOf = [].indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item)
        return i;
    }
    return -1;
  };
_.mixin(require("underscore.string").exports());
path = require("path");
upath = exports;
upath.VERSION = typeof VERSION !== "undefined" && VERSION !== null ? VERSION : "NO-VERSION";
toUnix = function (p) {
  var double;
  p = p.replace(/\\/g, "/");
  double = /\/\//;
  while (p.match(double)) {
    p = p.replace(double, "/");
  }
  return p;
};
for (propName in path) {
  propValue = path[propName];
  if (_.isFunction(propValue)) {
    upath[propName] = function (propName) {
      return function () {
        var args, result;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args = _.map(args, function (p) {
          if (_.isString(p)) {
            return toUnix(p);
          } else {
            return p;
          }
        });
        result = path[propName].apply(path, args);
        if (_.isString(result)) {
          return toUnix(result);
        } else {
          return result;
        }
      };
    }(propName);
  } else {
    upath[propName] = propValue;
  }
}
extraFunctions = {
  toUnix: toUnix,
  normalizeSafe: function (p) {
    p = toUnix(p);
    if (_.startsWith(p, "./")) {
      if (_.startsWith(p, "./..") || p === "./") {
        return upath.normalize(p);
      } else {
        return "./" + upath.normalize(p);
      }
    } else {
      return upath.normalize(p);
    }
  },
  normalizeTrim: function (p) {
    p = upath.normalizeSafe(p);
    if (_.endsWith(p, "/")) {
      return p.slice(0, p.length - 2 + 1 || 9000000000);
    } else {
      return p;
    }
  },
  joinSafe: function () {
    var p, result;
    p = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    result = upath.join.apply(null, p);
    if (_.startsWith(p[0], "./") && !_.startsWith(result, "./")) {
      result = "./" + result;
    }
    return result;
  },
  addExt: function (file, ext) {
    if (!ext) {
      return file;
    } else {
      if (ext[0] !== ".") {
        ext = "." + ext;
      }
      return file + (_.endsWith(file, ext) ? "" : ext);
    }
  },
  trimExt: function (filename, ignoreExts, maxSize) {
    var oldExt;
    if (maxSize == null) {
      maxSize = 7;
    }
    oldExt = upath.extname(filename);
    if (isValidExt(oldExt, ignoreExts, maxSize)) {
      return filename.slice(0, filename.length - oldExt.length - 1 + 1 || 9000000000);
    } else {
      return filename;
    }
  },
  removeExt: function (filename, ext) {
    if (!ext) {
      return filename;
    } else {
      ext = ext[0] === "." ? ext : "." + ext;
      if (upath.extname(filename) === ext) {
        return upath.trimExt(filename);
      } else {
        return filename;
      }
    }
  },
  changeExt: function (filename, ext, ignoreExts, maxSize) {
    if (maxSize == null) {
      maxSize = 7;
    }
    return upath.trimExt(filename, ignoreExts, maxSize) + (!ext ? "" : ext[0] === "." ? ext : "." + ext);
  },
  defaultExt: function (filename, ext, ignoreExts, maxSize) {
    var oldExt;
    if (maxSize == null) {
      maxSize = 7;
    }
    oldExt = upath.extname(filename);
    if (isValidExt(oldExt, ignoreExts, maxSize)) {
      return filename;
    } else {
      return upath.addExt(filename, ext);
    }
  }
};
isValidExt = function (ext, ignoreExts, maxSize) {
  return ext && ext.length <= maxSize && __indexOf.call(_.map(ignoreExts, function (e) {
    return (e && e[0] !== "." ? "." : "") + e;
  }), ext) < 0;
};
for (name in extraFunctions) {
  extraFn = extraFunctions[name];
  if (!_.isUndefined(upath[name])) {
    throw new Error("path." + name + " already exists.");
  } else {
    upath[name] = extraFn;
  }
}

;