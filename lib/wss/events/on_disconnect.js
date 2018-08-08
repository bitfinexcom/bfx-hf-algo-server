'use strict'

const debug = require('debug')('hf:algo-server:wss:events:on_close')

module.exports = (asState, ws) => {
  debug('ws client disconnected')
}
