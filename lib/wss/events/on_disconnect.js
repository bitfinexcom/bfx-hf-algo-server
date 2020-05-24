'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:events:on-disconnect')

/**
 * @memberof module:bfx-hf-algo-server
 * @private
 */
const onDisconnect = () => {
  debug('ws client disconnected')
}

module.exports = onDisconnect
