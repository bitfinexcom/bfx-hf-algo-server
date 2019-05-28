'use strict'

process.env.DEBUG = 'bfx:hf:algo-server:scripts:start-order'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const debug = require('debug')('bfx:hf:algo-server:scripts:start-order')
const { AlgoOrder } = require('bfx-hf-models')
const _last = require('lodash/last')

const parseAOIDArg = require('./util/parse_ao_id_arg')
const db = require('./util/get_db')

const aoID = parseAOIDArg(_last(process.argv))

if (!aoID) process.exit(1)

const { start, get, idString } = AlgoOrder(db)
const aoIDString = idString(aoID)
const ao = get(aoID)

if (!ao) {
  debug('ao %s not found', aoIDString)
  process.exit(0)
}

if (ao.active) {
  debug('ao %s already active, no change', aoIDString)
  process.exit(0)
}

const updatedAO = start(aoID)
const { active } = updatedAO

if (!active) {
  debug('failed to start AO %s, panic', aoIDString)
  process.exit(1)
}

debug('started AO %s', aoIDString)
