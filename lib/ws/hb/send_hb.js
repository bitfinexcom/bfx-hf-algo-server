'use strict'

const send = require('../send')

module.exports = (asState = {}) => {
  send(asState, [0, 'n', null, {
    mid: Date.now(),
    type: 'ucm-hb',
    info: {}
  }])
}
