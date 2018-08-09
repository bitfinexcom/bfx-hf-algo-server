'use strict'

const _isArray = require('lodash/isArray')
const onNotification = require('./on_notification')

module.exports = async (asState, msg) => {
  const [chanId, type, payload] = msg

  if (chanId !== 0 || type !== 'n' || !_isArray(payload)) {
    return asState
  }

  return onNotification(asState, payload)
}
