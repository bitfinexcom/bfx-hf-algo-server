'use strict'

process.env.DEBUG = 'bfx:hf:algo-server:scripts:start-all-orders'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:scripts:start-all-orders')
const { AlgoOrder } = require('bfx-hf-models')
const _isEmpty = require('lodash/isEmpty')
const db = require('./util/get_db')

const { start, getAll, idString } = AlgoOrder(db)
const aos = getAll()

if (_isEmpty(aos)) {
  debug('no orders found')
  process.exit(0)
}

const inactiveOrders = aos.filter(({ active }) => !active)

if (_isEmpty(inactiveOrders)) {
  debug('no inactive orders')
  process.exit(0)
}

inactiveOrders.forEach(ao => {
  start(ao)
  debug('started %s', idString(ao))
})

debug('started %d orders', inactiveOrders.length)
