'use strict'

process.env.DEBUG = 'hf:*'

const debug = require('debug')('hf:algo-server:examples:server')
const { IcebergOrder, TWAPOrder, MarketMakerOrder } = require('bfx-hf-algo')
const { onExit: OnExit } = require('bfx-hf-util')

const bfx = require('./bfx')
const AlgoServer = require('../lib/server')

let server
const UPDATE_UI = false
const rest = bfx.rest(2)
const ws = bfx.ws(2, {
  manageOrderBooks: true
})

OnExit(() => (ws && ws.isOpen()) && ws.close(), -2)
OnExit(() => (server && server.isActive()) && server.stop(), -1)

ws.on('error', debug)

const run = async () => {
  server = new AlgoServer({
    algos: {
      ao_market_maker: MarketMakerOrder,
      ao_iceberg: IcebergOrder,
      ao_twap: TWAPOrder
    },
    rest,
    ws
  })

  if (UPDATE_UI) {
    await server.registerAlgos()
  }

  ws.open()
  ws.on('open', ws.auth.bind(ws, 0, 4))
  ws.on('auth', async () => {
    await server.start()
  })
}

try {
  run().then(() => {
    debug('server running')
  }).catch((e) => {
    debug('error: %s', e.message)
  })
} catch (e) {
  debug(e.stack)
}
