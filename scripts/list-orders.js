'use strict'

process.env.DEBUG = 'bfx:hf:algo-server:scripts:list-orders'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:scripts:list-orders')
const _isEmpty = require('lodash/isEmpty')
const { AlgoOrder } = require('bfx-hf-models')
const db = require('./util/get_db')

const { getAll } = AlgoOrder(db)
const aos = getAll()

if (_isEmpty(aos)) {
  debug('no orders found')
  process.exit(0)
}

aos.forEach(({ algoID, gid, active }) => (
  debug('%s gid %d (active: %s)', algoID, gid, active)
))
