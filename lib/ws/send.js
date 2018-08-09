'use strict'

module.exports = (asState, msg = []) => {
  const { ws } = asState
  ws.send(msg)
}
