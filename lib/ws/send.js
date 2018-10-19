'use strict'

const debug = require('debug')('bfx:hf:algo-server:ws:send')

module.exports = (asState, msg = []) => {
  const { host } = asState

  host.m.withAuthSocket((wsState = {}) => {
    const { ws } = wsState

    debug('%j', msg)

    try {
      ws.send(JSON.stringify(msg))
    } catch (err) {
      debug('error sending packet: %s', err.message)
    }
  })
}
