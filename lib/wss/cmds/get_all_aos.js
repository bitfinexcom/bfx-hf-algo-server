'use strict'

const _values = require('lodash/values')
const send = require('../send')

/**
 * Responds with an array of all algo orders in the database
 *
 * @memberof module:bfx-hf-algo-server
 * @private
 *
 * @param {module:bfx-hf-algo-server.Server} server - server
 * @param {WebSocket} ws - client
 */
const getAllAOs = async (server, ws) => {
  const { db } = server
  const { AlgoOrder } = db
  const aos = await AlgoOrder.getAll()

  send(ws, ['data.aos', _values(aos).map(ao => ([
    ao.gid,
    ao.algoID,
    ao.active,
    ao.state,
    +(new Date(+ao.gid)) // created
  ]))])
}

module.exports = getAllAOs
