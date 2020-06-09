'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:cmd:submit-ao')
const send = require('../send')

/**
 * Starts a new algorithmic order with the provided parameters, or sends an
 * error on failure.
 *
 * @private
 *
 * @param {AOServer} server - server
 * @param {ws.WebSocket} ws - client
 * @param {Array} msg - incoming message
 */
const submitAO = async (server, ws, msg) => {
  const [, type, params] = msg

  try {
    await server.host.startAO(type, params)
  } catch (e) {
    send(ws, ['error', e.message])
    debug('%s', e.stack)
  }
}

module.exports = submitAO
