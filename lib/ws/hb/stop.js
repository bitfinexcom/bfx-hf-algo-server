'use strict'

module.exports = (asState = {}) => {
  const { hbi } = asState

  if (!hbi) {
    return asState
  }

  clearIntreval(hbi)

  return {
    ...asState,
    hbi: null
  }
}
