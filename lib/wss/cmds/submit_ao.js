'use strict'

const { AlgoOrder } = require('bfx-hf-models')
const send = require('../send')

module.exports = async (as, ws, msg) => {
  const [, type, params] = msg

  try {
    await as.host.startAO(type, params)
  } catch (e) {
    send(ws, ['error', e.message])
  }
}