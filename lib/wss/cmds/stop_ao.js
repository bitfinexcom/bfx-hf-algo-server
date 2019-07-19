'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:cmd:stop-ao')
const send = require('../send')

module.exports = async (as, ws, msg) => {
  const [, type, params] = msg

  try {
    await as.host.stopAO(type, params)
  } catch (e) {
    send(ws, ['error', e.message])
    debug('%s', e.stack)
  }
}