'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:start-wss')
const WS = require('ws')
const onWSConnected = require('./events/on_connect')

/**
 * @private
 *
 * @param {AOServer} server - server
 * @returns {ws.Server} server
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
