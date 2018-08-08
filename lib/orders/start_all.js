'use strict'

const PI = require('p-iteration')
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

  await PI.forEach(activeOrders, async (o) => {
    await o.start(startOpts)
  })

  notifyUI(asState, 'info', 'Started orders')
}

