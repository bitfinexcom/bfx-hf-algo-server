'use strict'

const send = require('./send')

module.exports = (asState, level, message) => {
  send(asState, [0, 'n', null, {
    type: 'ucm-notify-ui',
    info: {
      level,
      message: `HF: ${message}`
    }
  }])
}
