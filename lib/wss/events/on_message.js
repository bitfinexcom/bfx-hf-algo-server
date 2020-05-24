'use strict'

const _isArray = require('lodash/isArray')
const _isFunction = require('lodash/isFunction')
const debug = require('debug')('bfx:hf:algo-server:wss:events:on-message')
const getAllAOs = require('../cmds/get_all_aos')
const submitAO = require('../cmds/submit_ao')
const stopAO = require('../cmds/stop_ao')

const cmdMap = {
  'get.aos': getAllAOs,
  'submit.ao': submitAO,
  'stop.ao': stopAO
}

/**
 * Calls the relevant handler if the incoming message is recognised. Does
 * nothing if the incoming message is malformed or contains an unknown command.
 *
 * @memberof module:bfx-hf-algo-server
 * @private
 * @async
 *
 * @param {module:bfx-hf-algo-server.Server} server - server
 * @param {WebSocket} ws - client
 * @param {string} msgJSON - incoming message JSON string
 */
const onMessage = async (server, ws, msgJSON = '') => {
  let msg

  try {
    msg = JSON.parse(msgJSON)
  } catch (e) {
    debug('error reading ws client msg: %s', msgJSON)
  }

  if (!_isArray(msg)) {
    debug('ws client msg not an array: %j', msg)
    return
  }

  const [cmd] = msg
  const handler = cmdMap[cmd]

  if (!_isFunction(handler)) {
    debug('received unknown command: %s', cmd)
    return
  }

  return handler(server, ws, msg)
}

module.exports = onMessage
