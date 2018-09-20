'use strict'

const debug = require('debug')('bfx:hf:algo-server:ws:hb:stop')

/**
 * @param {Object} asState
 * @return {number} hbi - heartbeat interval
 */
module.exports = (asState = {}) => {
  const { hbi } = asState

  if (!hbi) {
    return hbi
  }

  clearInterval(hbi)
  debug('stopping heartbeat interval')

  return null
}
