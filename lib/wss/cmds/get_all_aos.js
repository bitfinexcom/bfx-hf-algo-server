'use strict'

const { AlgoOrder } = require('bfx-hf-models')
const send = require('../send')

module.exports = async (as, ws, msg) => {
  const aos = await AlgoOrder
    .find({})
    .exec()

  send(ws, ['data.aos', aos.map(ao => ([
    ao.gid,
    ao.algoID,
    ao.active,
    ao.state,
  ]))])
}