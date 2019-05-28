'use strict'

const { AlgoOrder: AlgoOrderModel } = require('bfx-hf-models')
const db = require('../../db')
const send = require('../send')

const AlgoOrder = AlgoOrderModel(db)
const { getAll } = AlgoOrder

module.exports = async (as, ws) => {
  const aos = getAll()

  send(ws, ['data.aos', aos.map(ao => ([
    ao.gid,
    ao.algoID,
    ao.active,
    ao.state,
    +(new Date(ao.createdAt))
  ]))])
}