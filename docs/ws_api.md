### WebSocket API

The following commands can be sent to a running `bfx-hf-algo-server` instance:

* `['get.aos']` - request a `data.aos` packet (see below)
* `['submit.ao', type, params]` - start a new algo order with the specified parameters
* `['stop.ao', gid]` - stop a running algo order by GID

The response to `get.aos` has the following format:
```js
['data.aos', [[
  gid,
  algoID, // i.e. 'bfx-iceberg'
  active,
  state, // current execution state (contains execution parameters)
  mtsCreated
], [
  // ...
]]]
```
