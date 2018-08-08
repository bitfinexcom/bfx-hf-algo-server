'use strict'

const onNotification = require('./on_notification')

module.exports = (asState, ws, msg) => {
  const [chanId, type] = msg

  if (chanId !== 0 || type !== 'n') {
    return asState
  }

  return onNotification(asState, ws, msg)
}
