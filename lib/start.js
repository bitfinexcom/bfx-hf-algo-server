'use strict'

const { WSv2, RESTv2 } = require('bitfinex-api-node')
const {
  MarketMakerOrder,
  IcebergOrder,
  TWAPOrder,
  VWAPOrder
} = require('bfx-hf-algo')

const startWSS = require('./wss/start_wss')
const loadAllOrders = require('./orders/load_all')
const startHB = require('./ws/hb/start')

module.exports = async ({
  algos = {
    MarketMakerOrder,
    IcebergOrder,
    TWAPOrder,
    VWAPOrder
  },

  customAlgos = {}, // user defined algos
  port = 8890, // command server port
  rest,
  ws,
}) => {
  if (!(ws instanceof WSv2)) {
    throw new Error('invalid ws client, expected WSv2 instance')
  }

  if (!(rest instanceof RESTv2)) {
    throw new Error('invalid rest client, expected RESTv2 instance')
  }

  if (!ws.isOpen()) {
    throw new Error('bfx ws client connection not open')
  }

  if (!ws.isAuthenticated()) {
    throw new Error('bfx ws client connection not authenticated')
  }

  const asState = {
    algos: {
      ...algos,
      ...customAlgos
    },

    hbi: null, // heartbeat interval ID
    port,
    rest,
    ws
  }

  const orders = await loadAllOrders(asState)

  return startHB({
    ...asState,
    wss: startWSS(asState),
    orders
  })
}
