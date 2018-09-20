'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:start_wss')
const WS = require('ws')
const onWSConnected = require('./events/on_connect')

module.exports = (asState) => {
  const { port } = asState
  const wss = new WS.Server({ port })

  wss.on('connection', ws => {
    onWSConnected(asState, ws)
  })

  debug(`websocket API open on localhost:${port}`)

  return wss
}
