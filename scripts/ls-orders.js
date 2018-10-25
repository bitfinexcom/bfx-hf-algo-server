'use strict'

process.env.DEBUG = 'bfx:hf:algo-server:scripts:ls-orders'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:scripts:ls-orders')
const { connectDB, startDB, AlgoOrder } = require('bfx-hf-models')

const run = async () => {
  await startDB(`${__dirname}/../db`)
  await connectDB('hf-as')

  const orders = await AlgoOrder
    .find({})
    .sort({ gid: 1 })
    .exec()

  orders.forEach(({ algoID, gid, active, _id }) => {
    debug('order %s gid %d | active %s | id %s', algoID, gid, active, _id)
  })
}

try {
  run()
} catch (err) {
  debug('error: %s', err)
}
