'use strict'

/**
 * @param {string} asState
 * @param {string} name - algo name
 * @param {Object} params - algo param set
 * @return {AlgoOrder|Error} res - order object or an Error instance
 */
module.exports = (asState, name, params) => {
  const { algos = {}, ws, rest } = asState
  const C = algos[name]
  const data = C && C.processUIParams
    ? C.processUIParams(params)
    : params

  if (!C) {
    return new Error('Unknown algo name')
  }

  try {
    return new C(ws, rest, data)
  } catch (e) {
    return e
  }
}
