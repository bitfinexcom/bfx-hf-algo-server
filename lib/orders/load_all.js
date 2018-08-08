'use strict'

const { AlgoOrder } = require('bfx-hf-algos')
const PI = require('p-iteration')

/**
 * @param {Object} asState
 * @return {Order[]} orders
 */
module.exports = async (asState) => {
  const orders = await AlgoOrder.queryActive()

  return PI.map(orders, async (o) => loadOrder(asState, o))
}
