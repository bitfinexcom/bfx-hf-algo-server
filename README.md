## Bitfinex Honey Framework Algorithmic Order Server for Node.JS

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-algo-server.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-algo-server)

This is a thin wrapper around the
[`bfx-hf-algo`](https://github.com/bitfinexcom/bfx-hf-algo) `AOHost` class,
which connects it to the Bitfinex notification system in order to start algo
orders from the order form in the bfx UI. The AOHost automatically uploads all
relevant order form layouts on startup.

The algo orders themselves are implemented in
[`bfx-hf-algo`](https://github.com/bitfinexcom/bfx-hf-algo).

Algo orders are automatically persisted via a DB backend provided by the user,
and are resumed when the algo server starts up.

### Features

* Enables the execution of algorithmic orders via the official Bitfinex UI
* Exposes a WebSocket API for executing & managing the operation of algo orders
* Allows for the usage of custom DB backends via the `bfx-hf-models` system

### Installation

For standalone usage:

```bash
git clone https://github.com/bitfinexcom/bfx-hf-algo-server
cd bfx-hf-algo-server
npm i

touch .env

echo 'DB_FILENAME=db/algo-server-db.json' >> .env
echo 'API_KEY=...' >> .env
echo 'API_SECRET=...' >> .env

npm start
```

For usage/extension within an existing project:

```bash
npm i --save bfx-hf-algo-server
```

### Quickstart

By default, the `lowdb` DB backend is used. To run the standard server,
populate `.env` with your API credentials and DB path:

```env
API_KEY=...
API_SECRET=...
DB_FILENAME=...
```

Then run `npm start`

Refresh your Bitfinex UI after all order form layouts have been uploaded. Once
the server is listening, select an algorithmic order from the order form
dropdown and fill in your desired arguments.

To start an algo order click the 'Submit' button in the Bitfinex UI to generate
a broadcast notification which will be picked up by your running algo server
instance, starting the desired order.

The server can be stopped/started at will, with running algo orders
automatically resuming if the contents of `db/*` have not been cleared.

### Docs

API documentation can be found in [`docs/reference.md`](docs/reference.md), and
examples in the [`examples`](examples) folder.

A list of WebSocket API commands can be found at
[`docs/ws_api.md`](docs/ws_api.md).

### Example

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

### Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
