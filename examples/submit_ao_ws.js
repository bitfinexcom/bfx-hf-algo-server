'use strict'

process.env.DEBUG = 'bfx:*'

const WebSocket = require('ws')
const debug = require('debug')('bfx:hf:algo-server:examples:submit-ws')

const ws = new WebSocket('ws://localhost:8877')

ws.on('open', () => {
  debug('socket opened')

  ws.send(JSON.stringify(['submit.ao', 'bfx-accumulate_distribute', {
    symbol: 'tBTCUSD',
    amount: -0.2,
    sliceAmount: -0.1,
    sliceInterval: 10000,
    intervalDistortion: 0.20,
    amountDistortion: 0.20,
    orderType: 'RELATIVE',
    offsetType: 'ask',
    offsetDelta: -10,
    capType: 'bid',
    capDelta: 10,
    submitDelay: 150,
    cancelDelay: 150,
    catchUp: true,
    awaitFill: true,
    _margin: false,
  }]))
})

ws.on('message', (msgJSON) => {
  debug('recv %s', msgJSON)

  let msg

  try {
    msg = JSON.parse(msgJSON)
  } catch (e) {
    debug('error parsing received JSON: %s', e.message)
    return
  }
})