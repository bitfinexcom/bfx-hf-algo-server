'use strict'

const PI = require('p-iteration')
const _isEmpty = require('lodash/isEmpty')
const debug = require('debug')('hf:data-server:orders:stop_all')

const notifyUI = require('../ws/notify_ui')

/**
 * Stops the internal orders marked as active
 *
 * @param {Object} asState
 * @param {Object} stopOpts
 * @param {boolean} stopOpts.persist - default true
 */
module.exports = async (asState = {}, stopOpts) => {
  const { orders = [] } = asState
  const activeOrders = orders.filter(o => o.isActive())

  if (_isEmpty(activeOrders)) {
    return debug('no orders to stop')
  }

  await PI.forEach(activeOrders, async (o) => {
    await o.stop(stopOpts)

    debug('stopped order %s (%s)', o.id, o.uiName)
  })

  notifyUI(asState, 'info', 'Stopped orders')
}
