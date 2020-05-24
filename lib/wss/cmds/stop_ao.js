'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:cmd:stop-ao')
const send = require('../send')

/**
 * Stops a running algorithmic order by GID, or sends an error to the client
 *
 * @memberof module:bfx-hf-algo-server
 * @private
 * @async
 *
 * @param {module:bfx-hf-algo-server.Server} server - server
 * @param {WebSocket} ws - client
 * @param {Array} msg - incoming message
 */
const stopAO = async (server, ws, msg) => {
  const [, gid] = msg

  try {
    await server.host.stopAO(+gid)
  } catch (e) {
    send(ws, ['error', e.message])
    debug('%s', e.stack)
  }
}

module.exports = stopAO
