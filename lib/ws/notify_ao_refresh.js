'use strict'

const notifyRes = require('./notify_res')

/**
 * Sends a broadcast notification to trigger a refresh of available algorithmic
 * orders displayed by any connected UI.
 *
 * @private
 *
 * @param {AOServer} server - server
 */
const notifyAORefresh = (server = {}) => {
  notifyRes(server, Date.now(), 'ucm-ao-reload-req')
}

module.exports = notifyAORefresh
