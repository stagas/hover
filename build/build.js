

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("stagas-within/index.js", Function("exports, require, module",
"\n/**\n * within\n */\n\nmodule.exports = within\n\n/**\n * Check if an event came from inside of a given element\n *\n * @param object the event object\n * @param Element the element in question\n * @param string the fallback property if relatedTarget is not defined\n * @return boolean\n */\n\nfunction within (evt, elem, fallback) {\n  var targ = evt.relatedTarget, ret;\n  if (targ == null) {\n    targ = evt[fallback] || null;\n  }\n  try {\n    while (targ && targ !== elem) {\n      targ = targ.parentNode;\n    }\n    ret = (targ === elem);\n  } catch(e) {\n    ret = false;\n  }\n  return ret;\n}\n//@ sourceURL=stagas-within/index.js"
));
require.register("stagas-mouseenter/index.js", Function("exports, require, module",
"\n/**\n * mouseenter\n */\n\nvar within = require('within')\n\nmodule.exports = mouseenter\n\nvar listeners = []\nvar fns = []\n\nfunction mouseenter (el, fn) {\n  function listener (ev) {\n    var inside = within(ev, ev.target, 'fromElement')\n    if (inside) return\n    if (fn) fn.call(this, ev)\n  }\n  listeners.push(listener)\n  fns.push(fn)\n  el.addEventListener('mouseover', listener)\n}\n\nmouseenter.bind = mouseenter\n\nmouseenter.unbind = function (el, fn) {\n  var idx = fns.indexOf(fn)\n  if (!~idx) return\n  fns.splice(idx, 1)\n  el.removeEventListener('mouseover', listeners.splice(idx, 1)[0])\n}\n//@ sourceURL=stagas-mouseenter/index.js"
));
require.register("stagas-mouseleave/index.js", Function("exports, require, module",
"\n/**\n * mouseleave\n */\n\nvar within = require('within')\n\nmodule.exports = mouseleave\n\nvar listeners = []\nvar fns = []\n\nfunction mouseleave (el, fn) {\n  function listener (ev) {\n    var inside = within(ev, ev.target, 'toElement')\n    if (inside) return\n    if (fn) fn.call(this, ev)\n  }\n  listeners.push(listener)\n  fns.push(fn)\n  el.addEventListener('mouseout', listener)\n}\n\nmouseleave.bind = mouseleave\n\nmouseleave.unbind = function (el, fn) {\n  var idx = fns.indexOf(fn)\n  if (!~idx) return\n  fns.splice(idx, 1)\n  el.removeEventListener('mouseout', listeners.splice(idx, 1)[0])\n}\n//@ sourceURL=stagas-mouseleave/index.js"
));
require.register("hover/index.js", Function("exports, require, module",
"\n/**\n * \n * hover\n * \n */\n\n/**\n * Module dependencies.\n */\n\nvar mouseenter = require('mouseenter')\nvar mouseleave = require('mouseleave')\n\n/**\n * Export hover.\n */\n\nmodule.exports = hover\n\n/**\n * Binds `mouseenter` and `mouseleave` events\n * on an `el`.\n *\n * @param {element} el\n * @param {fn} onmouseenter\n * @param {fn} onmouseleave\n *\n * @return {element} el\n */\n\nfunction hover (el, onmouseenter, onmouseleave) {\n  mouseenter(el, onmouseenter)\n  mouseleave(el, onmouseleave)\n  return el\n}\n\n/**\n * Hovers only once.\n *\n * @param {element} el \n * @param {fn} onmouseenter \n * @param {fn} onmouseleave \n *\n * @return {element} el\n */\n\nhover.once = function (el, onmouseenter, onmouseleave) {\n  mouseenter(el, onmouseenter)\n  mouseleave(el, function wrapper (ev) {\n    mouseenter.unbind(el, onmouseenter)\n    mouseleave.unbind(el, wrapper)\n\n    onmouseleave.apply(this, arguments)\n  })\n}\n//@ sourceURL=hover/index.js"
));
require.alias("stagas-mouseenter/index.js", "hover/deps/mouseenter/index.js");
require.alias("stagas-within/index.js", "stagas-mouseenter/deps/within/index.js");

require.alias("stagas-mouseleave/index.js", "hover/deps/mouseleave/index.js");
require.alias("stagas-within/index.js", "stagas-mouseleave/deps/within/index.js");

