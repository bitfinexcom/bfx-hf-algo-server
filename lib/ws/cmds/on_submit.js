'use strict'

const notifyUI = require('../notify_ui')
const notifyRes = require('../notify_res')
const notifyResError = require('../notify_res_error')
const spawnOrder = require('../../orders/spawn')
const saveOrder = require('../../orders/save')

/**
 * Spawns a new order with the provided param set and starts it. The order
 * is saved to the DB on 'persist' events.
 *
 * @param {Object} args
 * @param {Object} args.asState
 * @param {number} args.mid - initiating broadcast ID, used to generate the res ID
 * @param {string} args.type - initiating broadcast type (ucm-...)
 * @param {string} args.algoName - name of algo order to spawn
 * @param {Object} args.data - algo parameters
 * @return {Object} nextState
 */
module.exports = async ({ asState, mid, type, algoName, data } = {}) => {
  const o = spawnOrder(asState, algoName, data)

  if (o instanceof Error) {
    return notifyResError(asState, mid, type, o.message)
  }

  o.on('persist', saveOrder)
  o.on('started', () => {
    notifyUI(asState, 'success', `Started ${o.getUIName()}`)
  })

  o.on('stopped', () => {
    notifyUI(asState, 'info', `Stopped ${o.getUIName()}`)
  })

  try {
    await o.start()
    await o.saveOrder()

    notifyRes(asState, mid, type, { clearPreview: true })

    return {
      ...asState,
      orders: [
        ...asState.orders,
        o
      ]
    }
  } catch (err) {
    notifyResError(asState, mid, type, err.message)
  }
}
