'use strict'

const { EventEmitter } = require('events')
const { AOHost } = require('bfx-hf-algo')
const _isObject = require('lodash/isObject')
const _isFunction = require('lodash/isFunction')
const _last = require('lodash/last')
const debug = require('debug')('bfx:hf:algo-server:server')

const startWSS = require('./wss/start_wss')
const notifyResError = require('./ws/notify_res_error')
const notifyRes = require('./ws/notify_res')

/**
 * Honey Framework Algorithmic Order Server
 *
 * @class
 * @augments events.EventEmitter
 */
class AOServer extends EventEmitter {
  /**
   * @param {object} args - passed to internal AO host
   * @param {object} args.db - bfx-hf-models DB instance
   * @param {object} args.adapter - exchange API adapter instance
   * @param {object[]} args.aos - algorithmic order definitions
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

    const { aos, port, db, adapter } = args

    this.db = db
    this.port = port
    this.adapter = adapter

    // If provided with order definitions then create the algoHost instance
    // Mostly just for backwards compatibility
    if (aos) {
      const host = new AOHost({ aos, db, adapter })
      this.setAlgoHost(host)
    }
  }

  /**
   * Starts the WebSocket API server and opens the exchange connection.
   * If the API server has already been started, an error is thrown.
   */
  open () {
    if (this.wss) {
      throw new Error('already open')
    }

    this.wss = startWSS(this)

    if (this.host) {
      this.host.connect()
    }
  }

  /**
   * Closes both the WebSocket API server and the exchange connection.
   * If the API server is already closed, an error is thrown.
   */
  close () {
    if (!this.wss) {
      throw new Error('already closed')
    }

    if (this.host) {
      this.host.close()
    }

    this.wss.close()
    this.wss = null
  }

  /**
   * Removes all of the event bindings from the current established algo host
   * before calling for the algo host object to be closed. If there is no host
   * established then this function is a no-op.
   */
  clearAlgoHost () {
    if (this.host) {
      // remove all events from old host
      Object
        .keys(this.host.listeners)
        .forEach(eventName => this.host.removeAllListeners(eventName))

      // close connection of old host
      this.host.close()
    }
  }

  /**
   * Sets the event bindings to use the given algo host instance. This function
   * also manages the closing of the old host instance and the establishment of
   * the new host instance.
   *
   * If the WebSocket API server is running, the exchange connection is opened.
   *
   * @param {bfx-hf-algo.AOHost} aoHost - algo host
   */
  setAlgoHost (aoHost) {
    this.clearAlgoHost()
    this.host = aoHost

    // bind new events to new algo host
    this.host.on('ao:start', this.onAOStart)
    this.host.on('ao:stop', this.onAOStop)
    this.host.on('notification', this.onWSNotification)
    this.host.on('auth:error', this.onWSAuthError)
    this.host.on('auth:success', this.onWSAuthSuccess)
    this.host.on('error', this.onError)

    if (this.wss) {
      this.host.connect()
    }
  }

  /**
   * @param {bfx-hf-algo.AOInstance} instance - algo order instance
   * @private
   */
  onAOStart (instance) {
    const { state = {} } = instance
    const { id, gid } = state

    debug('started AO %s [gid %s]', id, gid)
    this.emit('ao:start', instance)
  }

  /**
   * @param {bfx-hf-algo.AOInstance} instance - algo order instance
   * @private
   */
  onAOStop (instance) {
    const { state = {} } = instance
    const { id, gid } = state

    debug('stopped AO %s [gid %s]', id, gid)
    this.emit('ao:stop', instance)
  }

  /**
   * @param {Error|string} err - error
   * @private
   */
  onWSAuthError (err) {
    this.onError(err)
  }

  /**
   * @param {object} data - data
   * @private
   */
  onWSAuthSuccess (data) {
    debug('authenticated')
    this.emit('auth:success', data)
  }

  /**
   * @param {Error|string} err - error
   * @private
   */
  onError (err) {
    debug('error: %s', _isObject(err) ? err.message : err)
    this.emit('error', _isObject(err) ? err : new Error(err))
  }

  /**
   * @param {object} packet - notification data
   * @private
   */
  async onWSNotification (packet = {}) {
    const { type, messageID, notifyInfo = {} } = packet
    const splitType = type.split('-')
    const req = splitType.splice(splitType.length - 1, 1)[0]
    const [ucm, nType, ...idContents] = splitType

    // no algo host established
    if (!this.host) {
      return
    }

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

  /**
   * Like @onSubmit, but generates a set of preview orders and sends them via
   * the exchange connection to be displayed to the user on success.
   *
   * @private
   *
   * @param {string} id - algo order ID
   * @param {number} mid - incoming notification ID, used to generate response
   *   ID
   * @param {string} type - incoming notification type, replicated on outgoing
   *   success/error notification
   * @param {object} payload - algo order parameters
   */
  onPreview (id, mid, type, payload) {
    const ao = this.host.getAO(id)

    if (!ao) {
      this.onError(new Error(`preview requested for unknown AO: ${id}`))
      return
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
        return _isFunction(o.toPreview)
          ? o.toPreview()
          : o
      }),

      notify: {
        level: 'info',
        message: `Generated ${orders.filter(o => !o.label).length} preview orders`
      }
    })
  }

  /**
   * Attempts to start the specified algo order with the provided parameters.
   * In case of failure (i.e. invalid paramters) an error notification is
   * passed to the internal host and propagated to the exchange connection. If
   * successfull, a similar notification is passed to the exchange connection.
   *
   * @private
   *
   * @param {string} id - algo order ID
   * @param {number} mid - incoming notification ID, used to generate res ID
   * @param {string} type - incoming notification type, replicated on outgoing
   *   success/error notification
   * @param {object} payload - algo order parameters
   */
  async onSubmit (id, mid, type, payload) {
    const ao = this.host.getAO(id)

    if (!ao) {
      this.onError(new Error(`submit requested for unknown AO: ${id}`))
      return
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

module.exports = AOServer
