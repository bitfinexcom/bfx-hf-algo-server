'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:events:on_connect')
const onMessage = require('./on_message')
const onDisconnect = require('./on_disconnect')
const send = require('../../wss/send')

module.exports = (asState, ws) => {
  debug('ws client connected')

  ws.on('message', msg => onMessage(asState, ws, msg))
  ws.on('close', () => onDisconnect(ws))

  send(ws, ['connected'])
}
