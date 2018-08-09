'use strict'

const { AlgoOrder } = require('../db/models')
const debug = require('debug')('hf:data-server:orders:save')

/**
  * @param {Object} ao
  * @return [AlgoOrder] model
  */
module.exports = async (ao) => {
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

  await AlgoOrder.knex().raw(sql)

  const [n] = await AlgoOrder
    .query()
    .select('id')
    .where('gid', ao.gid)
    .limit(1)

  debug('saved order %s (%s)', ao.id, ao.uiName)

  return n
}
