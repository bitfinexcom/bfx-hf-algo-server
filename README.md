## HF Algorithmic Order Server

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-algo-server.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-algo-server)

<img src="https://github.com/bitfinexcom/bfx-hf-algo-server/raw/master/res/ad_screenshot.png" width="300" align="left" />

This is a thin wrapper around the [`bfx-hf-algo`](https://github.com/bitfinexcom/bfx-hf-algo) `AOHost` class, which connects it to the Bitfinex notification system in order to start algo orders from the order form in the bfx UI. The AOHost automatically uploads all relevant order form layouts on startup.

The algo orders themselves are implemented in [`bfx-hf-algo`](https://github.com/bitfinexcom/bfx-hf-algo).

Algo orders are automatically persisted via an embedded MongoDB instance within the `db/` folder, and are resumed when the algo server starts up.

### Usage

Populate `.env` with your API key/secret combo:
```
API_KEY=...
API_SECRET=...
```

Then run `npm start`

Refresh your Bitfinex UI after all order form layouts have been uploaded. Once the server is listening, select an algorithmic order from the order form dropdown and fill in your desired arguments.

To start an algo order click the 'Submit' button in the Bitfinex UI to generate a broadcast notification which will be picked up by your running algo server instance, starting the desired order.

The server can be stopped/started at will, with running algo orders automatically resuming if the contents of `db/*` have not been cleared.<br />

<br /><br /><br /><br /><br /><br /><br />
---

### Example Invocation

```js
'use strict'

process.env.DEBUG = '*' // 'bfx:hf:*'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:examples:server')
const SocksProxyAgent = require('socks-proxy-agent')
const { IcebergOrder, TWAPOrder, AccumulateDistribute } = require('bfx-hf-algo')
const { connectDB, startDB } = require('bfx-hf-models')

const AOServer = require('../lib/server')
const { API_KEY, API_SECRET, WS_URL, REST_URL, SOCKS_PROXY_URL } = process.env

const run = async () => {
  await startDB(`${__dirname}/../db`)
  await connectDB('hf-as')

  const server = new AOServer({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    wsURL: WS_URL,
    restURL: REST_URL,
    agent: SOCKS_PROXY_URL ? new SocksProxyAgent(SOCKS_PROXY_URL) : null,

    aos: [IcebergOrder, TWAPOrder, AccumulateDistribute],
    port: 8877,
  })

  server.on('auth:success', () => {
    debug('authenticated')
  })

  server.on('auth:error', (error) => {
    debug('auth error: %j', error)
  })
}

try {
  run()
} catch (err) {
  debug('error: %s', err)
}
```
