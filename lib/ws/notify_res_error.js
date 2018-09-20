'use strict'

const notifyRes = require('./notify_res')

module.exports = (asState, mid, type, err) => {
  const message = err instanceof Error ? err.message : err

  notifyRes(asState, mid, type, {
    notify: {
      level: 'error',
      message
    }
  })
}
