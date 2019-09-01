'use strict'

process.env.DEBUG = '*' // 'bfx:hf:*'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:examples:server')
const SocksProxyAgent = require('socks-proxy-agent')
const {
  PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover
} = require('bfx-hf-algo')

const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const {
  AOAdapter,
  schema: HFDBBitfinexSchema
} = require('bfx-hf-ext-plugin-bitfinex')

const AOServer = require('../lib/server')
const {
  API_KEY, API_SECRET, WS_URL, REST_URL, SOCKS_PROXY_URL, DB_FILENAME
} = process.env

const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBLowDBAdapter({
    dbPath: `${__dirname}/../${DB_FILENAME}`,
    schema: HFDBBitfinexSchema
  })
})

const adapter = new AOAdapter({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  wsURL: WS_URL,
  restURL: REST_URL,
  agent: SOCKS_PROXY_URL ? new SocksProxyAgent(SOCKS_PROXY_URL) : null,
  withHeartbeat: true
})

const server = new AOServer({
  db,
  adapter,
  port: 8877,
  aos: [
    PingPong,
    Iceberg,
    TWAP,
    AccumulateDistribute,
    MACrossover
  ]
})

server.on('auth:success', () => {
  debug('authenticated')
})

server.on('auth:error', (error) => {
  debug('auth error: %j', error)
})
