'use strict'

const send = require('./send')

module.exports = (ws, err) => {
  send(ws, ['error', err])
}
