'use strict'

const debug = require('debug')('hf:data-server:orders:load')
const saveOrder = require('./save')

/**
 * Creates a new algo order from serialized init params (type, arguments)
 *
 * @param {Object} asState
 * @param {Object} order
 * @return {Order} o - loaded order instance
 */
module.exports = async (asState = {}, order = {}) => {
  const { algos = {}, ws, rest } = asState
  const { name, args, id } = order
  const argsJSON = decodeURI(args)
  const params = JSON.parse(argsJSON)
  const C = algos[name]

  if (!C) {
    throw new Error('Unknown algo name')
  }

  const o = C.load(ws, rest, {
    ...params,
    id
  })

  if (o instanceof Error) {
    debug('failed to spawn order: %s', o.message)
    throw o
  }

  debug(
    'loaded algo order %s:%d [active %d]',
    o.name, o.gid, o.active
  )

  o.on('persist', saveOrder)

  return o
}
