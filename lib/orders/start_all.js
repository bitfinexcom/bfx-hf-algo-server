'use strict'

const PI = require('p-iteration')
const _isEmpty = require('lodash/isEmpty')
const debug = require('debug')('bfx:hf:data-server:orders:start_all')

const notifyUI = require('../ws/notify_ui')

/**
 * Starts the internal orders marked as active
 *
 * @param {Object} asState
 * @param {Object} startOpts
 * @param {boolean} startOpts.persist - default true
 */
module.exports = async (asState = {}, startOpts) => {
  const { orders = [] } = asState
  const activeOrders = orders.filter(o => o.isActive())

  if (_isEmpty(activeOrders)) {
    return debug('no orders to start')
  }

  await PI.forEach(activeOrders, async (o) => {
    await o.start(startOpts)

    debug('started order %s (%s)', o.id, o.uiName)
  })

  notifyUI(asState, 'info', 'Started orders')
}

