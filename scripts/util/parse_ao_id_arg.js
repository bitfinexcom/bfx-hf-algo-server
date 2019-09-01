const debug = require('debug')('bfx:hf:algo-server:scripts:util:parse-ao-id')
const _isString = require('lodash/isString')
const _isEmpty = require('lodash/isEmpty')
const _isFinite = require('lodash/isFinite')

/**
 * Parses an AO algoID:GID pair
 *
 * @param {string} idArgv - ID, usually taken from process arguments
 * @return {Object|null} - {algoID, gid} or null on failure
 */
module.exports = (idArgv) => {
  if (!_isString(idArgv) || _isEmpty(idArgv)) {
    debug('ID (algoID:GID) required as last argument')
    return null
  }

  const idParts = idArgv.split(':')

  if (idParts.length !== 2 || !_isFinite(+idParts[1])) {
    debug(
      'invalid order ID provided: %s (format is %s, i.e. %s)',
      idArgv, '\'algoID:GID\'', 'bfx-iceberg:1554278678815'
    )

    return null
  }

  return {
    algoID: idParts[0],
    gid: idParts[1]
  }
}
