'use strict'

/**
 * @private
 *
 * @param {ws.WebSocket} ws - client
 * @param {Array} msg - outgoing message, to be stringified
 */
const send = (ws, msg = []) => {
  ws.send(JSON.stringify(msg))
}

module.exports = send
