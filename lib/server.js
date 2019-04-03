'use strict'

const { EventEmitter } = require('events')
const { AOHost } = require('bfx-hf-algo')
const _isFunction = require('lodash/isFunction')
const _last = require('lodash/last')
const debug = require('debug')('bfx:hf:algo-server:server')

const startHB = require('./ws/hb/start')
const startWSS = require('./wss/start_wss')
const notifyResError = require('./ws/notify_res_error')
const notifyRes = require('./ws/notify_res')

module.exports = class AlgoServer extends EventEmitter {
  /**
   * @param {Object} args - passed to internal AO host
   * @param {Object[]} args.aos - algorithmic order definitions
   * @param {string} args.apiKey
   * @param {string} args.apiSecret
   * @param {Object?} args.agent
   * @param {string?} args.wsURL
   * @param {string?} args.restURL
   * @param {number} args.port - websocket server port
   */
  constructor (args = {}) {
    super()

    this.onAOStart = this.onAOStart.bind(this)
    this.onAOStop = this.onAOStop.bind(this)
    this.onWSNotification = this.onWSNotification.bind(this)
    this.onWSAuthError = this.onWSAuthError.bind(this)
    this.onWSAuthSuccess = this.onWSAuthSuccess.bind(this)
    this.onError = this.onError.bind(this)

    const {
      aos, apiKey, apiSecret, agent, wsURL, restURL, port
    } = args

    this.port = port
    this.host = new AOHost({
      aos, apiKey, apiSecret, agent, wsURL, restURL
    })

    this.host.on('ao:start', this.onAOStart)
    this.host.on('ao:stop', this.onAOStop)
    this.host.on('ws2:notification', this.onWSNotification)
    this.host.on('ws2:auth:error', this.onWSAuthError)
    this.host.on('ws2:auth:success', this.onWSAuthSuccess)
    this.host.on('error', this.onError)

    this.hbi = startHB(this)
    this.wss = startWSS(this)

    // Give algo UIs time to upload to avoid nonce error
    setTimeout(() => {
      this.host.m.openWS()
    }, 5000)
  }

  close () {
    this.host.close()
    this.wss.close()
  }

  onAOStart (instance) {
    const { state = {} } = instance
    const { id, gid } = state

    debug('started AO %s [gid %s]', id, gid)
    this.emit('ao:start', instance)
  }

  onAOStop (instance) {
    const { state = {} } = instance
    const { id, gid } = state

    debug('stopped AO %s [gid %s]', id, gid)
    this.emit('ao:stop', instance)
  }

  onWSAuthError (data) {
    debug('auth error: %j', data)
    this.emit('auth:error', data)
  }

  onWSAuthSuccess (data) {
    debug('authenticated')
    this.emit('auth:success', data)
  }

  onError (err) {
    debug('error: %s', err)
    this.emit('error', err)
  }

  async onWSNotification (packet = {}) {
    const { type, messageID, notifyInfo = {} } = packet
    const splitType = type.split('-')
    const req = splitType.splice(splitType.length - 1, 1)[0]
    const [ ucm, nType, ...idContents ] = splitType

    if (_last(idContents) === 'res') { // ignore responses
      return
    }

    const id = idContents.join('-')

    if (ucm !== 'ucm' || req !== 'req') {
      return
    }

    if (nType === 'preview') {
      debug('recv preview for %s', id)
      this.onPreview(id, messageID, type, notifyInfo)
    } else if (nType === 'submit') {
      debug('recv submit for %s', id)
      await this.onSubmit(id, messageID, type, notifyInfo)
    }
  }

  onPreview (id, mid, type, payload) {
    const ao = this.host.getAO(id)

    if (!ao) {
      return this.onError(new Error(`preview requested for unknown AO: ${id}`))
    }

    const { meta = {} } = ao
    const { validateParams, processParams, genPreview } = meta

    const params = _isFunction(processParams)
      ? processParams(payload)
      : { ...payload }

    if (_isFunction(validateParams)) {
      const err = validateParams(params)

      if (err) {
        notifyResError(this, mid, type, err)
        debug('error in preview request: %s', err)
        return
      }
    }

    if (!_isFunction(genPreview)) {
      debug('requested preview for AO with no genPreview method: %s', id)
      return
    }

    const orders = genPreview(params)

    notifyRes(this, mid, type, {
      orders: orders.map(o => {
        return typeof o.toPreview === 'function'
          ? o.toPreview()
          : o
      }),

      notify: {
        level: 'info',
        message: `Generated ${orders.filter(o => !o.label).length} preview orders`
      }
    })
  }

  async onSubmit (id, mid, type, payload) {
    const ao = this.host.getAO(id)

    if (!ao) {
      return this.onError(new Error(`submit requested for unknown AO: ${id}`))
    }

    const { meta = {} } = ao
    const { validateParams, processParams } = meta

    const params = _isFunction(processParams)
      ? processParams(payload)
      : { ...payload }

    if (_isFunction(validateParams)) {
      const err = validateParams(params)

      if (err) {
        notifyResError(this, mid, type, err)
        debug('error in submit request: %s', err)
        return
      }
    }

    try {
      await this.host.startAO(id, payload)
      notifyRes(this, mid, type, {
        notify: {
          level: 'success',
          message: `Started ${ao.name} order`
        }
      })
    } catch (err) {
      notifyResError(this, mid, type, 'Internal AO Server Error')
      debug('error starting AO: %s', err.stack)
    }
  }
}
