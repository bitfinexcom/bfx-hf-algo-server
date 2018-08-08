'use strict'

const notifyResError = require('../notify_res_error')
const onPreview = require('../cmds/on_preview')
const onSubmit = require('../cmds/on_submit')

module.exports = async (asState, ws, msg) => {
  const { algos } = asState
  const [, type = '', mid, , data = {}] = msg

  // ignore heartbeats
  if (type === 'ucm-hb') {
    return asState
  }

  const actionData = type.split('-')
  const [ucm, action, algoName, reqType] = actionData

  // Validate structure
  if (ucm !== 'ucm' || reqType !== 'req') {
    return asState
  }

  if (!algos[algoName]) {
    return notifyResError(asState, mid, type, `Unknown algo: ${algoName}`)
  }

  const cmdArgs = { asState, ws, mid, type, algoName, data }

  if (action === 'preview') {
    return onPreview(cmdArgs)
  } else if (action === 'submit') {
    return onSubmit(cmdArgs)
  }

  return notifyResError(asState, mid, type, `Unknown action: ${action}`)
}
