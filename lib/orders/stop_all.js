'use strict'

const PI = require('p-iteration')
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

  await PI.forEach(activeOrders, async (o) => {
    await o.stop(stopOpts)
  })

  notifyUI(asState, 'info', 'Stopped orders')
}

