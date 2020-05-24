'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:start-wss')
const WS = require('ws')
const onWSConnected = require('./events/on_connect')

/**
 * @memberof module:bfx-hf-algo-server
 * @private
 *
 * @param {module:bfx-hf-algo-server.Server} server - server
 * @returns {WS.Server} server
 */
const startWSS = (server) => {
  const { port } = server
  const wss = new WS.Server({ port })

  wss.on('connection', ws => {
    onWSConnected(server, ws)
  })

  debug(`websocket API open on localhost:${port}`)

  return wss
}

module.exports = startWSS
