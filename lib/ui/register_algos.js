'use strict'

const debug = require('debug')('hf:algo-server:ui:register-algos')
const { AlgoOrder } = require('bfx-hf-algo')
const _pick = require('lodash/pick')

const notifyAORefresh = require('../ws/notify_ao_refresh')

module.exports = async (asState = {}) => {
  const { algos = {}, rest, ws } = asState
  const aos = Object.values(algos)
  const names = aos.map(ao => ao.name)

  debug(`setting algo UI settings: ${names.join(', ')}`)

  await AlgoOrder.registerAlgoUIs(rest, aos)

  if (ws.isAuthenticated()) {
    notifyAORefresh(asState)
  } else {
    ws.once('auth', notifyAORefresh.bind(null, asState))
  }
}
