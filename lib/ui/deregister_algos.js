'use strict'

const debug = require('debug')('hf:algo-server:ui:deregister-algos')
const { AlgoOrder } = require('bfx-hf-algo')
const _pick = require('lodash/pick')

module.exports = async (asState = {}) => {
  const { algos = {}, rest } = asState
  const aos = Object.values(algos)

  debug(`deleting algo UI settings: ${_pick(aos, 'name').join(', ')}`)

  await AlgoOrder.deregisterAlgoUIs(rest, aos)
}
