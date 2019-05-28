'use strict'

process.env.DEBUG = 'bfx:hf:algo-server:scripts:stop-order'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:scripts:stop-order')
const { AlgoOrder } = require('bfx-hf-models')
const _last = require('lodash/last')

const parseAOIDArg = require('./util/parse_ao_id_arg')
const db = require('./util/get_db')

const aoID = parseAOIDArg(_last(process.argv))

if (!aoID) process.exit(1)

const { stop, get, idString } = AlgoOrder(db)
const aoIDString = idString(aoID)
const ao = get(aoID)

if (!ao) {
  debug('ao %s not found', aoIDString)
  process.exit(0)
}

if (!ao.active) {
  debug('ao %s already inactive, no change', aoIDString)
  process.exit(0)
}

const updatedAO = stop(aoID)
const { active } = updatedAO

if (active) {
  debug('failed to stop AO %s, panic', aoIDString)
  process.exit(1)
}

debug('stopped AO %s', aoIDString)
