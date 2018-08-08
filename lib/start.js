'use strict'

const startWSS = require('./wss/start_wss')
const { AlgoOrder } = require('./db/models')
const { WSv2, RESTv2 } = require('bitfinex-api-node')
const {
  MarketMakerOrder,
  IcebergOrder,
  TWAPOrder,
  VWAPOrder
} = require('bfx-hf-algo')

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

  const orders = await AlgoOrder.query().select('*')
  const asState = {
    algos: {
      ...algos,
      ...customAlgos
    },

    hbi: null, // heartbeat interval ID
    orders,
    port,
    rest,
    ws
  }

  return {
    ...asState,
    wss: startWSS(asState),
  }
}
