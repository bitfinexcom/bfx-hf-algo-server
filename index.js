'use strict'

const AOServer = require('./lib/server')

/**
 * This is a thin wrapper around the
 * {@link module:bfx-hf-algo.AOHost|bfx-hf-algo.AOHost} class, which connects
 * it to the Bitfinex notification system in order to start algo orders from
 * the order form in the bfx UI. The AOHost automatically uploads all relevant
 * order form layouts on startup.
 *
 * The algo orders themselves are implemented in
 * {@link module:bfx-hf-algo|bfx-hf-algo}
 *
 * Algo orders are automatically persisted via a DB backend provided by the
 * user, and are resumed when the algo server starts up.
 *
 * ### Features
 *
 * * Enables the execution of algorithmic orders via the official Bitfinex UI
 * * Exposes an API for executing & managing the operation of algo orders
 * * Allows for the usage of custom DB backends via the
 *   {@link module:bfx-hf-models|bfx-hf-models} system.
 *
 * ### Installation
 *
 * For standalone usage:
 *
 * ```bash
 * git clone https://github.com/bitfinexcom/bfx-hf-algo-server
 * cd bfx-hf-algo-server
 * npm i
 *
 * touch .env
 *
 * echo 'DB_FILENAME=db/algo-server-db.json' >> .env
 * echo 'API_KEY=...' >> .env
 * echo 'API_SECRET=...' >> .env
 *
 * npm start
 * ```
 *
 * For usage/extension within an existing project:
 *
 * ```bash
 * npm i --save bfx-hf-algo-server
 * ```
 *
 * ### Quickstart
 *
 * By default, the `lowdb` DB backend is used. To run the standard server,
 * populate `.env` with your API credentials and DB path:
 *
 * ```
 * API_KEY=...
 * API_SECRET=...
 * DB_FILENAME=...
 * ```
 *
 * Then run `npm start`
 *
 * Refresh your Bitfinex UI after all order form layouts have been uploaded.
 * Once the server is listening, select an algorithmic order from the order
 * form dropdown and fill in your desired arguments.
 *
 * To start an algo order click the 'Submit' button in the Bitfinex UI to
 * generate a broadcast notification which will be picked up by your running
 * algo server instance, starting the desired order.
 *
 * The server can be stopped/started at will, with running algo orders
 * automatically resuming if the contents of `db/*` have not been cleared.
 *
 * @license Apache-2.0
 * @module bfx-hf-algo-server
 */

module.exports = AOServer
