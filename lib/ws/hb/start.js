'use strict'

const HB_INTERVAL = 2500
const sendHB = require('./send_hb')
const debug = require('debug')('bfx:hf:algo-server:ws:hb:start')

/**
 * @param {Object} asState
 * @return {number} hbi - heartbeat interval
 */
module.exports = (asState = {}) => {
  const { hbi } = asState

  if (hbi) {
    return hbi
  }

  debug('starting heartbeat interval [%d]', HB_INTERVAL)

  return setInterval(sendHB.bind(null, asState), HB_INTERVAL)
}
