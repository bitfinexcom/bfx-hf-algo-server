'use strict'

const debug = require('debug')('bfx:hf:algo-server:ui:deregister-algos')
const { AlgoOrder } = require('bfx-hf-algo')
const _pick = require('lodash/pick')

module.exports = async (asState = {}) => {
  const { algos = {}, rest } = asState
  const aos = Object.values(algos)
  const names = aos.map(ao => ao.name)

  debug(`deleting algo UI settings: ${names.join(', ')}`)

  await AlgoOrder.deregisterAlgoUIs(rest, aos)
}
