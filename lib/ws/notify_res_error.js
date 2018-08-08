'use strict'

const notifyRes = require('./notify_res')

module.exports = (asState, mid, type, err) => {
  console.trace(err)

  notifyRes(asState, mid, type, {
    notify: {
      type: 'error',
      message: err
    }
  })
}
