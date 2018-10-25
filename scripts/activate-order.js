'use strict'

process.env.DEBUG = 'bfx:hf:algo-server:scripts:ls-orders'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:scripts:ls-orders')
const { connectDB, startDB, AlgoOrder } = require('bfx-hf-models')
const _isString = require('lodash/isString')

const ID = process.argv[2]

if (!_isString(ID)) {
  debug('ID required as first argument')
  process.exit(0)
}

const run = async () => {
  await startDB(`${__dirname}/../db`)
  await connectDB('hf-as')

  await AlgoOrder
    .updateOne({ _id: ID }, { active: true })
    .exec()
  
  const order = await AlgoOrder.findById(ID).exec()
  const { algoID, gid, active, _id } = order

  debug('order %s gid %d | active %s | id %s', algoID, gid, active, _id)
}

try {
  run()
} catch (err) {
  debug('error: %s', err)
}
