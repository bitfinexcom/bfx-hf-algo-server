const { initDB } = require('bfx-hf-models')
const DB_FILENAME = require('./require_db_fn')

module.exports = initDB(`${__dirname}/../../${DB_FILENAME}`)
