'use strict'

const send = require('./send')

module.exports = (asState, err) => {
  send(asState, ['error', err])
}
