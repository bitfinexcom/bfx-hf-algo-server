'use strict'

process.env.DEBUG = '*' // 'bfx:hf:*'

require('dotenv').config()
require('bfx-hf-util/lib/catch_uncaught_errors')

const { RESTv2 } = require('bfx-api-node-rest')
const { API_KEY, API_SECRET, REST_URL } = process.env

const rest = new RESTv2({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  url: REST_URL,
})

rest.updateSettings({
  ['api:bitfinex_algorithmic_orders']: {},
  ['api:ethfinex_algorithmic_orders']: {},
}).then(() => {
  console.log('cleared all algorithmic order definitions')
})
