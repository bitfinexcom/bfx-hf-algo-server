'use strict'

process.env.DEBUG = 'hf:*'

require('bfx-hf-util/lib/catch_uncaught_errors')

const PI = require('p-iteration')
const debug = require('debug')('hf:algo-server:examples:server')
const { onExit: OnExit } = require('bfx-hf-util')
const {
  IcebergOrder, TWAPOrder, MarketMakerOrder
} = require('bfx-hf-algo')

const bfx = require('./bfx')
const startAlgoServer = require('../lib/start')
const registerAlgos = require('../lib/ui/register_algos')
const startAllOrders = require('../lib/orders/start_all')
const onWSMessage = require('../lib/ws/events/on_message')
const stopHB = require('../lib/ws/hb/stop')
const saveOrder = require('../lib/orders/save')

const UPDATE_UI = true
const rest = bfx.rest(2)
const ws = bfx.ws(2, {
  manageOrderBooks: true
})

let as = null // algo server state

OnExit(() => (ws && ws.isOpen()) && ws.close(), -2)
OnExit(async () => { // stop heartbeat
  if (as === null) {
    return
  }

  if (as.hbi !== null) {
    as = stopHB(as)
  }

  await PI.forEach(as.orders, async (o) => saveOrder(o))
}, -1)

ws.on('error', debug)
ws.on('open', () => {
  debug('bfx ws client connected')
  ws.auth(0, 4) // note active DMS
})

ws.on('auth', async () => {
  debug('bfx ws client authenticated')

  as = await startAlgoServer({
    id: 'example',
    algos: {
      ao_market_maker: MarketMakerOrder,
      ao_iceberg: IcebergOrder,
      ao_twap: TWAPOrder
    },
    rest,
    ws
  })

  if (UPDATE_UI) {
    await registerAlgos(as)
    debug('registered algo order UI layouts')
  }

  await startAllOrders(as)

  ws.onMessage({}, async (msg) => {
    as = await onWSMessage(as, msg)
  })
})

ws.open()
