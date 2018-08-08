'use strict'

const spawnOrder = require('../../orders/spawn')
const notifyResError = require('../notify_res_error')
const notifyRes = require('../notify_res')

/**
 * Spawns a new order and starts it in preview model with the provided param
 * set. The generated preview order set is broadcast back over ws2.
 *
 * @param {Object} args
 * @param {Object} args.asState
 * @param {number} args.mid - initiating broadcast ID, used to generate the res ID
 * @param {string} args.type - initiating broadcast type (ucm-...)
 * @param {string} args.algoName - name of algo order to spawn
 * @param {Object} args.data - algo parameters
 * @return {Object} nextState
 */
module.exports = async ({ asState, mid, type, algoName, data }) => {
  const o = spawnOrder(asState, algoName, data)

  if (o instanceof Error) {
    console.error(o.stack)

    return notifyResError(asState, mid, type, o.message)
  }

  try {
    const previewOrders = await o.start({ preview: true })

    notifyRes(asState, mid, type, {
      orders: previewOrders.map(o => {
        return typeof o.toPreview === 'function'
          ? o.toPreview()
          : o
      }),

      notify: {
        type: 'info',
        message: `Generated ${orders.length} preview orders`
      }
    })
  } catch (err) {
    notifyResError(asState, mid, type, err.message)
  }

  return asState
}
