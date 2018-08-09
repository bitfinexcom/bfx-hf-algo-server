'use strict'

const notifyRes = require('./notify_res')

module.exports = (asState, mid, type, err) => {
  const message = err instanceof Error ? err.message : err

  console.trace(err instanceof Error ? err.stack : err)

  notifyRes(asState, mid, type, {
    notify: {
      type: 'error',
      message
    }
  })
}
