'use strict'

const HFDB = require('bfx-hf-db')
const KnexConfig = require('../../knexfile')

module.exports = HFDB(KnexConfig)
