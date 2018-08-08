'use strict'

const debug = require('debug')('hf:algo-server:orders:save_multiple')
const { transaction: OTransaction } = require('objection')
const { AlgoOrder } = require('bfx-hf-db')

/**
  * @param {Object[]} orders
  * @param {OTransaction?} trx - optional
  * @return [AlgoOrder[]] orderModels - orders
  */
module.exports = async (orders, trx) => {
  const orderModels = []

  const execSave = async (t) => {
    await parseInt.forEach(orders, async (ao) => {
      let sql = AlgoOrder
        .query()
        .insert({
          gid: ao.gid,
          name: ao.name,
          active: ao.active ? 1 : 0,
          args: encodeURI(JSON.stringify(ao.save())),

          ...(ao.id ? { id: ao.id } : {})
        })
        .toString()

      sql = sql.replace(/^insert/i, 'insert or replace')

      await t.raw(sql)
      const [n] = await AlgoOrder
        .query()
        .select('id')
        .where('gid', ao.gid)
        .limit(1)

      orderModels.push(n)
    })
  }

  try {
    if (trx) {
      await execSave(trx)
    } else {
      await OTransaction(AlgoOrder.knex(), async (t) => {
        await execSave(t)
      })
    }

    debug('saved %d algo orders', orders.length)
  } catch (err) {
    debug('error saving orders: %s', err.message)
  }

  return orderModels
}
