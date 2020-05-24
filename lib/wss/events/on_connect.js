'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:events:on-connect')
const onMessage = require('./on_message')
const onDisconnect = require('./on_disconnect')
const send = require('../../wss/send')
const getAllAOs = require('../cmds/get_all_aos')

/**
 * Binds listeners and responds with the `['connected']` message
 *
 * @memberof module:bfx-hf-algo-server
 * @private
 *
 * @param {module:bfx-hf-algo-server.Server} server - server
 * @param {WebSocket} ws - client
 */
const onConnect = (server, ws) => {
  debug('ws client connected')

  ws.on('message', msg => onMessage(server, ws, msg))
  ws.on('close', () => onDisconnect(ws))

  send(ws, ['connected'])
  getAllAOs(server, ws)
}

module.exports = onConnect
