
/**
 * 
 * hover
 * 
 */

/**
 * Module dependencies.
 */

var events = require('event')

/**
 * Export hover.
 */

module.exports = hover

/**
 * Binds `mouseenter` and `mouseleave` events
 * on an `el`.
 *
 * @param {element} el
 * @param {fn} onmouseenter
 * @param {fn} onmouseleave
 *
 * @return {element} el
 */

function hover (el, onmouseenter, onmouseleave) {
  events.bind(el, 'mouseenter', onmouseenter)
  events.bind(el, 'mouseleave', onmouseleave)
  return el
}

/**
 * Hovers only once.
 *
 * @param {element} el 
 * @param {fn} onmouseenter 
 * @param {fn} onmouseleave 
 *
 * @return {element} el
 */

hover.once = function (el, onmouseenter, onmouseleave) {
  events.bind(el, 'mouseenter', onmouseenter)
  events.bind(el, 'mouseleave', function wrapper (ev) {
    events.unbind(el, 'mouseenter', onmouseenter)
    events.unbind(el, 'mouseleave', wrapper)

    onmouseleave.apply(this, arguments)
  })
}
