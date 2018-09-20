'use strict'

const debug = require('debug')('bfx:hf:algo-server:ws:hb:stop')

module.exports = (asState = {}) => {
  const { hbi } = asState

  if (!hbi) {
    return asState
  }

  clearInterval(hbi)
  debug('stopping heartbeat interval')

  return {
    ...asState,
    hbi: null
  }
}
