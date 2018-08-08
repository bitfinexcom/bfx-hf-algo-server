'use strict'

const debug = require('debug')('hf:algo-server:wss:events:on_connect')
const onMessage = require('./on_message')
const onDisconnect = require('./on_disconnect')
const send = require('../../ws/send')

module.exports = (asState, ws) => {
  debug('ws client connected')

  ws.on('message', msg => onMessage(asState, ws, msg))
  ws.on('close', () => onDisconnect(ws))

  send(ws, ['connected'])
}
