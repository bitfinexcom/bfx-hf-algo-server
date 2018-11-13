'use strict'

const _isFunction = require('lodash/isFunction')
const debug = require('debug')('bfx:hf:algo-server:wss:events:on_message')
const getAllAOs = require('../cmds/get_all_aos')
const submitAO = require('../cmds/submit_ao')

// TODO: (see data server for an example implementation)
const cmdMap = {
  'get.aos': getAllAOs,
  'submit.ao': submitAO
}

module.exports = async (asState, ws, msgJSON = '') => {
  let msg

  try {
    msg = JSON.parse(msgJSON)
  } catch (e) {
    debug('error reading ws client msg: %s', msgJSON)
  }

  if (!Array.isArray(msg)) {
    debug('ws client msg not an array: %j', msg)
    return
  }

  const [ cmd ] = msg
  const handler = cmdMap[cmd]

  if (!_isFunction(handler)) {
    debug('received unknown command: %s', cmd)
    return
  }

  return handler(asState, ws, msg)
}
