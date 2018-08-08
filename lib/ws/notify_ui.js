'use strict'

module.exports = (asState, type, message) => {
  const { ws } = asState

  ws.notifyUI(type, `HF: ${message}`)
}
