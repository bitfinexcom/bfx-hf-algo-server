'use strict'

const PI = require('p-iteration')
const _isEmpty = require('lodash/isEmpty')
const debug = require('debug')('bfx:hf:data-server:orders:load_all')
const loadOrder = require('./load')

const { AlgoOrder } = require('../db/models')

/**
 * @param {Object} asState
 * @return {Order[]} orders
 */
module.exports = async (asState) => {
  const orders = await AlgoOrder.queryAll()

  if (_isEmpty(orders)) {
    debug('no orders to load')
    return []
  }

  return PI.map(orders, async (oModel) => (
    loadOrder(asState, oModel)
  ))
}
