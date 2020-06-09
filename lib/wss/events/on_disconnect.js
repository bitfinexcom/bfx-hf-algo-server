'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:events:on-disconnect')

/**
 * @private
 */
const onDisconnect = () => {
  debug('ws client disconnected')
}

module.exports = onDisconnect
