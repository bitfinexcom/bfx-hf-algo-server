'use strict'

const _isError = require('lodash/isError')
const notifyRes = require('./notify_res')

/**
 * Responds to an incoming broadcast with an error.
 *
 * @memberof module:bfx-hf-algo-server
 * @private
 *
 * @param {module:bfx-hf-algo-server.Server} server - server
 * @param {number} mid - incoming broadcast ID
 * @param {string} type - incoming broadcast type
 * @param {Error|string} err - error object or message
 */
const notifyResError = (server, mid, type, err) => {
  const message = _isError(err) ? err.message : err

  notifyRes(server, mid, type, {
    notify: {
      level: 'error',
      message
    }
  })
}

module.exports = notifyResError
