## HF Algorithmic Order Server

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-algo-server.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-algo-server)

<img src="https://github.com/bitfinexcom/bfx-hf-algo-server/raw/master/res/ad_screenshot.png" width="300" align="left" />

This is a thin wrapper around the [`bfx-hf-algo`](https://github.com/bitfinexcom/bfx-hf-algo) `AOHost` class, which connects it to the Bitfinex notification system in order to start algo orders from the order form in the bfx UI. The AOHost automatically uploads all relevant order form layouts on startup.

The algo orders themselves are implemented in [`bfx-hf-algo`](https://github.com/bitfinexcom/bfx-hf-algo).

Algo orders are automatically persisted via an embedded MongoDB instance within the `db/` folder, and are resumed when the algo server starts up.

### Usage

By default, the `lowdb` DB backend is used. To run the standard server, populate `.env` with your API credentials and DB path:
```
API_KEY=...
API_SECRET=...
DB_FILENAME=...
```

Then run `npm start`

Refresh your Bitfinex UI after all order form layouts have been uploaded. Once the server is listening, select an algorithmic order from the order form dropdown and fill in your desired arguments.

To start an algo order click the 'Submit' button in the Bitfinex UI to generate a broadcast notification which will be picked up by your running algo server instance, starting the desired order.

The server can be stopped/started at will, with running algo orders automatically resuming if the contents of `db/*` have not been cleared.<br />

<br /><br /><br /><br /><br /><br /><br />
---

### Example Invocation
```js
const {
  IcebergOrder, TWAPOrder, AccumulateDistribute, MACrossover
} = require('bfx-hf-algo')

const WebSocket = require('ws')
const AOServer = require('bfx-hf-algo-server')
const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const {
  AOAdapter: BFXAOAdapter, schema: HFDBBitfinexSchema
} = require('bfx-hf-ext-plugin-bitfinex')

const DB_PATH = './some_path/db.json'

// create database instance for persisting algo orders
const db = new HFDB({
  schema: HFDBBitfinexSchema,
  adapter: HFDBLowDBAdapter({
    dbPath: DB_PATH,
    schema: HFDBBitfinexSchema
  })
})

// create exchange adapter for order execution
const adapter = new BFXAOAdapter({
  apiKey: '...',
  apiSecret: '...'
})

// spawn algo server instance
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

server.on('auth:success', () => { /* ... */ })
server.on('auth:error', (error) => { /* ... */ })

// ao server now ready to accept orders on port 8877
// example order submit

const ws = new WebSocket('ws://localhost:8877')

ws.on('open', () => {
  ws.send(JSON.stringify(['submit.ao', 'bfx-accumulate_distribute', {
    symbol: 'tEOSUSD',
    amount: 10,
    sliceAmount: 1,
    sliceInterval: 5 * 1000,
    intervalDistortion: 0.20,
    amountDistortion: 0.20,
    orderType: 'MARKET',
    submitDelay: 150,
    cancelDelay: 150,
    catchUp: true,
    awaitFill: true,
    _margin: true
  }]))
})
```
