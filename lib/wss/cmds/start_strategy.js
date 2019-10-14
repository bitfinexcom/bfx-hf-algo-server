'use strict'

const debug = require('debug')('bfx:hf:algo-server:wss:cmd:submit-strategy')
const send = require('../send')

module.exports = async (as, ws, msg) => {
  const [, type, params] = msg

  // TODO: implement
}
