'use strict'

/**
 * Responds to an incoming broadcast by ID
 *
 * @memberof module:bfx-hf-algo-server
 * @private
 *
 * @param {module:bfx-hf-algo-server.Server} server - server
 * @param {number} mid - incoming broadcast ID
 * @param {string} type - incoming broadcast type
 * @param {object} info - broadcast data
 */
const notifyRes = (server, mid, type, info = {}) => {
  const { adapter } = server
  const t = type.split('-')
  t[3] = 'res'

  adapter.sendWithAnyConnection([0, 'n', null, {
    mid: mid + 1,
    type: t.join('-'),
    info
  }])
}

module.exports = notifyRes
