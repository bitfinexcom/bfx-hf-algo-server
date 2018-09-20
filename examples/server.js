'use strict'

process.env.DEBUG = '*' // 'bfx:hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:examples:server')
const { IcebergOrder, TWAPOrder, AccumulateDistribute } = require('bfx-hf-algo')
const AOServer = require('../lib/experimental/server')
const { args: aoServerArgs } = require('./bfx')

const server = new AOServer({
  ...aoServerArgs,
  aos: [IcebergOrder, TWAPOrder, AccumulateDistribute],
  port: 8877,
})

server.on('auth:success', () => {
  debug('authenticated')
})

server.on('auth:error', (error) => {
  debug('auth error: %j', error)
})
