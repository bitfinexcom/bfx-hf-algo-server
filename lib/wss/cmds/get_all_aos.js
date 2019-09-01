'use strict'

const send = require('../send')

module.exports = async (as, ws) => {
  const { db } = as
  const { AlgoOrder } = db
  const aos = await AlgoOrder.getAll()

  send(ws, ['data.aos', Object.values(aos).map(ao => ([
    ao.gid,
    ao.algoID,
    ao.active,
    ao.state,
    +(new Date(+ao.gid)) // created
  ]))])
}
