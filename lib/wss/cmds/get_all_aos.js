'use strict'

const { getAllAOs } = require('bfx-hf-algo/lib/db/ao')
const send = require('../send')

module.exports = async (as, ws) => {
  const aos = await getAllAOs()

  send(ws, ['data.aos', aos.map(ao => ([
    ao.gid,
    ao.algoID,
    ao.active,
    ao.state,
    +(new Date(ao.createdAt))
  ]))])
}