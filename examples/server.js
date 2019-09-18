'use strict'

process.env.DEBUG = '*' // 'bfx:hf:*'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:examples:server')
const SocksProxyAgent = require('socks-proxy-agent')
const _isFunction = require('lodash/isFunction')
const {
  PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover
} = require('bfx-hf-algo')

const { version: VERSION } = require('../package.json')
const { RESTv2 } = require('bfx-api-node-rest')
const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const {
  AOAdapter: BFXAOAdapter,
  schema: HFDBBitfinexSchema
} = require('bfx-hf-ext-plugin-bitfinex')

const AOServer = require('../lib/server')
const {
  API_KEY, API_SECRET, WS_URL, REST_URL, SOCKS_PROXY_URL, DB_FILENAME,
  PLATFORM = 'bitfinex'
} = process.env

const AO_SETTINGS_KEY = `api:${PLATFORM}_algorithmic_orders`
const algoOrders = [
  PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover
]

// init db
const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBLowDBAdapter({
    dbPath: `${__dirname}/../${DB_FILENAME}`,
    schema: HFDBBitfinexSchema
  })
})

// init algo order adapter
const adapter = new BFXAOAdapter({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  wsURL: WS_URL,
  restURL: REST_URL,
  agent: SOCKS_PROXY_URL ? new SocksProxyAgent(SOCKS_PROXY_URL) : null,
  withHeartbeat: true,
  dms: 4,
})

// init algo order server
const server = new AOServer({
  db,
  adapter,
  port: 8877,
  aos: algoOrders
})

server.on('auth:success', () => {
  debug('authenticated')
})

server.on('auth:error', (error) => {
  debug('auth error: %j', error)
})

// register algo order UI definitions
const aoUIDefs = algoOrders.filter((ao) => {
  const { meta = {} } = ao
  const { getUIDef } = meta

  return _isFunction(getUIDef)
}).map((ao) => {
  const { meta = {} } = ao
  const { getUIDef } = meta
  const { id } = ao

  return {
    id,
    uiDef: getUIDef({
      timeframes: Object.values(BFXAOAdapter.getTimeFrames())
    })
  }
})

const rest = new RESTv2({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  url: REST_URL
})

const run = async () => {
  debug('starting algo server version %s', VERSION)

  const res = await rest.getSettings([AO_SETTINGS_KEY])
  const [keyResult = []] = res
  const [, aoSettings = {}] = keyResult

  aoUIDefs.forEach(({ id, uiDef }) => {
    debug('setting UI def for %s', id)
    aoSettings[id] = uiDef
  })

  await rest.updateSettings({ [AO_SETTINGS_KEY]: aoSettings })

  debug('all UIs registered!')

  // start server
  server.open()
}

try {
  run()
} catch (e) {
  debug('error: %s', e.stack)
}
