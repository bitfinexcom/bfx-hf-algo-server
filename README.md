## HF Algorithmic Order Server

[![Build Status](https://travis-ci.org/bitfinexcom/bfx-hf-algo-server.svg?branch=master)](https://travis-ci.org/bitfinexcom/bfx-hf-algo-server)

This is a thin wrapper around the `bfx-hf-algo` `AOHost` class, which connects it to the Bitfinex notification system in order to start algo orders from the order form in the bfx UI. The AOHost automatically uploads all relevant order form layouts on startup.

Algo orders are automatically persisted via an embedded MongoDB instance within the `db/` folder, and are resumed when the algo server starts up.

To use, populate `.env` with your API key/secret combo:
```
API_KEY=...
API_SECRET=...
```

Then run `npm start`, and refresh your Bitfinex UI after all order form layouts have been uploaded. Once the server is listening, select an algorithmic order from the order form dropdown and fill in your desired arguments.

To start an algo order click the 'Submit' button in the Bitfinex UI to generate a broadcast notification which will be picked up by your running algo server instance, starting the desired order.

The server can be stopped/started at will, with running algo orders automatically resuming if the contents of `db/*` have not been cleared.
