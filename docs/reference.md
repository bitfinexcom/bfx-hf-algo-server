## Modules

<dl>
<dt><a href="#module_bfx-hf-algo-server">bfx-hf-algo-server</a></dt>
<dd><p>This is a thin wrapper around the <a href="https://github.com/bitfinexcom/bfx-hf-algo">bfx-hf-algo</a> <code>AOHost</code>
class, which connects it to the Bitfinex notification system in order to
start algo orders from the order form in the bfx UI. The <code>AOHost</code>
automatically uploads all relevant order form layouts on startup.</p>
<p>The algo orders themselves are implemented in <a href="https://github.com/bitfinexcom/bfx-hf-algo">bfx-hf-algo</a>.</p>
<p>Algo orders are automatically persisted via a DB backend provided by the
user, and are resumed when the algo server starts up.</p>
<h3 id="quickstart">Quickstart</h3>
<p>By default, the <code>lowdb</code> DB backend is used. To run the standard server,
populate <code>.env</code> with your API credentials and DB path:</p>
<pre><code>API_KEY=...
API_SECRET=...
DB_FILENAME=...</code></pre>
<p>Then run <code>npm start</code></p>
<p>Refresh your Bitfinex UI after all order form layouts have been uploaded.
Once the server is listening, select an algorithmic order from the order
form dropdown and fill in your desired arguments.</p>
<p>To start an algo order click the &#39;Submit&#39; button in the Bitfinex UI to
generate a broadcast notification which will be picked up by your running
algo server instance, starting the desired order.</p>
<p>The server can be stopped/started at will, with running algo orders
automatically resuming if the contents of <code>db/*</code> have not been cleared.</p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#AOServer">AOServer</a> ⇐ <code>events.EventEmitter</code></dt>
<dd><p>Honey Framework Algorithmic Order Server</p>
</dd>
</dl>

<a name="module_bfx-hf-algo-server"></a>

## bfx-hf-algo-server
This is a thin wrapper around the [bfx-hf-algo](https://github.com/bitfinexcom/bfx-hf-algo) `AOHost`
class, which connects it to the Bitfinex notification system in order to
start algo orders from the order form in the bfx UI. The `AOHost`
automatically uploads all relevant order form layouts on startup.

The algo orders themselves are implemented in [bfx-hf-algo](https://github.com/bitfinexcom/bfx-hf-algo).

Algo orders are automatically persisted via a DB backend provided by the
user, and are resumed when the algo server starts up.

### Quickstart

By default, the `lowdb` DB backend is used. To run the standard server,
populate `.env` with your API credentials and DB path:

```
API_KEY=...
API_SECRET=...
DB_FILENAME=...
```

Then run `npm start`

Refresh your Bitfinex UI after all order form layouts have been uploaded.
Once the server is listening, select an algorithmic order from the order
form dropdown and fill in your desired arguments.

To start an algo order click the 'Submit' button in the Bitfinex UI to
generate a broadcast notification which will be picked up by your running
algo server instance, starting the desired order.

The server can be stopped/started at will, with running algo orders
automatically resuming if the contents of `db/*` have not been cleared.

**License**: Apache-2.0  
**Example**  
```js
require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:examples:server')
const SocksProxyAgent = require('socks-proxy-agent')
const _isFunction = require('lodash/isFunction')
const {
  PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover, OCOCO
} = require('bfx-hf-algo')

const { RESTv2 } = require('bfx-api-node-rest')
const HFDB = require('bfx-hf-models')
const HFDBLowDBAdapter = require('bfx-hf-models-adapter-lowdb')
const {
  AOAdapter: BFXAOAdapter,
  schema: HFDBBitfinexSchema
} = require('bfx-hf-ext-plugin-bitfinex')

const AOServer = require('bfx-hf-algo-server')
const {
  API_KEY, API_SECRET, WS_URL, REST_URL, SOCKS_PROXY_URL, DB_FILENAME,
  PLATFORM = 'bitfinex'
} = process.env

const AO_SETTINGS_KEY = `api:${PLATFORM}_algorithmic_orders`
const algoOrders = [
  PingPong, Iceberg, TWAP, AccumulateDistribute, MACrossover, OCOCO
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
  withHeartbeat: true
  // dms: 4
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
  debug('starting algo server')

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
```
<a name="AOServer"></a>

## AOServer ⇐ <code>events.EventEmitter</code>
Honey Framework Algorithmic Order Server

**Kind**: global class  
**Extends**: <code>events.EventEmitter</code>  

* [AOServer](#AOServer) ⇐ <code>events.EventEmitter</code>
    * [new AOServer(args)](#new_AOServer_new)
    * [.open()](#AOServer+open)
    * [.close()](#AOServer+close)
    * [.clearAlgoHost()](#AOServer+clearAlgoHost)
    * [.setAlgoHost(aoHost)](#AOServer+setAlgoHost)

<a name="new_AOServer_new"></a>

### new AOServer(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | passed to internal AO host |
| args.db | <code>object</code> | bfx-hf-models DB instance |
| args.adapter | <code>object</code> | exchange API adapter instance |
| args.aos | <code>Array.&lt;object&gt;</code> | algorithmic order definitions |
| args.port | <code>number</code> | websocket server port |

<a name="AOServer+open"></a>

### aoServer.open()
Starts the WebSocket API server and opens the exchange connection.
If the API server has already been started, an error is thrown.

**Kind**: instance method of [<code>AOServer</code>](#AOServer)  
<a name="AOServer+close"></a>

### aoServer.close()
Closes both the WebSocket API server and the exchange connection.
If the API server is already closed, an error is thrown.

**Kind**: instance method of [<code>AOServer</code>](#AOServer)  
<a name="AOServer+clearAlgoHost"></a>

### aoServer.clearAlgoHost()
Removes all of the event bindings from the current established algo host
before calling for the algo host object to be closed. If there is no host
established then this function is a no-op.

**Kind**: instance method of [<code>AOServer</code>](#AOServer)  
<a name="AOServer+setAlgoHost"></a>

### aoServer.setAlgoHost(aoHost)
Sets the event bindings to use the given algo host instance. This function
also manages the closing of the old host instance and the establishment of
the new host instance.

If the WebSocket API server is running, the exchange connection is opened.

**Kind**: instance method of [<code>AOServer</code>](#AOServer)  

| Param | Type | Description |
| --- | --- | --- |
| aoHost | <code>bfx-hf-algo.AOHost</code> | algo host |

