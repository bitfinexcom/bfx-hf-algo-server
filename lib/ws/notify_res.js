'use strict'

/**
 * Responds to an incoming broadcast by ID
 *
 * @param {Object} asState
 * @param {number} mid - incoming broadcast ID
 * @param {string} type - incoming broadcast type
 * @param {Object} info - broadcast data
 */
module.exports = (asState, mid, type, info = {}) => {
  const { adapter } = asState
  const t = type.split('-')
  t[3] = 'res'

  adapter.sendWithAnyConnection([0, 'n', null, {
    mid: mid + 1,
    type: t.join('-'),
    info
  }])
}
