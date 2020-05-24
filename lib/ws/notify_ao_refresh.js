'use strict'

const notifyRes = require('./notify_res')

/**
 * Sends a broadcast notification to trigger a refresh of available algorithmic
 * orders displayed by any connected UI.
 *
 * @memberof module:bfx-hf-algo-server
 * @private
 *
 * @param {module:bfx-hf-algo-server.Server} server - server
 */
const notifyAORefresh = (server = {}) => {
  notifyRes(server, Date.now(), 'ucm-ao-reload-req')
}

module.exports = notifyAORefresh
