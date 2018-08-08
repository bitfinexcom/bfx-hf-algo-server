'use strict'

const notifyRes = require('./notify_res')

module.exports = (asState = {}) => {
  notifyRes(asState, Date.now(), 'ucm-ao-reload-req')
}
