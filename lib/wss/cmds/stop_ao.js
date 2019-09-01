'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:cmd:submit-ao')
const send = require('../send')

module.exports = async (as, ws, msg) => {
  const [, gid] = msg

  try {
    await as.host.stopAO(+gid)
  } catch (e) {
    send(ws, ['error', e.message])
    debug('%s', e.stack)
  }
}
