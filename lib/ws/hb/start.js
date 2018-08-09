'use strict'

const HB_INTERVAL = 2500
const sendHB = require('./send_hb')
const debug = require('debug')('hf:algo-server:ws:hb:start')

module.exports = (asState = {}) => {
  const { hbi } = asState

  if (hbi !== null) {
    return asState
  }

  debug('starting heartbeat interval [%d]', HB_INTERVAL)

  return {
    ...asState,
    hbi: setInterval(sendHB.bind(null, asState), HB_INTERVAL)
  }
}
