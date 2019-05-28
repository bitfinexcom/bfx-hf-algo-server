'use strict'

process.env.DEBUG = 'bfx:hf:algo-server:scripts:stop-all-orders'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:scripts:stop-all-orders')
const { AlgoOrder } = require('bfx-hf-models')
const _isEmpty = require('lodash/isEmpty')
const db = require('./util/get_db')

const { stop, getAll, idString } = AlgoOrder(db)
const aos = getAll()

if (_isEmpty(aos)) {
  debug('no orders found')
  process.exit(0)
}

const activeOrders = aos.filter(({ active }) => active)

if (_isEmpty(activeOrders)) {
  debug('no active orders')
  process.exit(0)
}

activeOrders.forEach(ao => {
  stop(ao)
  debug('stopped %s', idString(ao))
})

debug('stopped %d orders', activeOrders.length)
