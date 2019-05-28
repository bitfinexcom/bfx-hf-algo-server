const debug = require('debug')('bfx:hf:algo-server:scripts:util:req-db-fn')
const _isString = require('lodash/isString')
const _isEmpty = require('lodash/isEmpty')
const { DB_FILENAME } = process.env

if (!_isString(DB_FILENAME) || _isEmpty(DB_FILENAME)) {
  debug('DB_FILENAME env var required')
  process.exit(1)
}

module.exports = DB_FILENAME
