'use strict'

const debug = require('debug')('hf-algo-server:server')
const Promise = require('bluebird')
const PI = require('p-iteration')

const { AlgoOrder: AlgoOrderModel } = require('bfx-hf-db')
const { AlgoOrder } = require('bfx-hf-algo')
// const Server = require('./server')
const saveOrder = require('./orders/save')
const saveMultipleOrders = require('./orders/save_multiple')
const HB_INTERVAL = 2500

class AlgoServer { // extends Server {
  constructor ({ ws, rest, algos = {} }) {
    // super({
    //   id: 'AOS',
    //   ws
    // })

    this._active = false
    this._rest = rest
    // this._id = Date.now() - Math.floor(Math.random() * 1000)
    this._algos = algos
    this._hbInterval = null
    this._orders = []

    this._onNotification = this._onNotification.bind(this)
    this._onHB = this._onHB.bind(this)
    this.loadOrder = this.loadOrder.bind(this)
  }

  /**
   * Starts the internal orders marked as active
   *
   * @param {Object} opts
   * @return {Promise} p
   */
  async startOrders (opts = {}) {
    const activeOrders = this._orders.filter(o => o.isActive())

    await PI.forEach(activeOrders, async (o) => {
      await o.start(opts)
    })

    this._notifyUI('info', 'Started orders')
  }

  /**
   * Stops the internal orders marked as active
   *
   * @param {Object} opts
   * @return {Promise} p
   */
  async stopOrders (opts) {
    const activeOrders = this._orders.filter(o => o.isActive())

    await PI.forEach(activeOrders, async (o) => {
      await o.stop(opts)
    })

    this._notifyUI('info', 'Stopped orders')
  }

  async loadState () {
    this._orders = []

    debug('loading state...')
    const results = await AlgoOrderModel.queryActive()

    if (results.length === 0) {
      debug('no saved orders')
    } else {
      results.forEach(this.loadOrder)
    }
  }

  /**
   * Creates a new algo order from serialized init params (type, arguments)
   *
   * @param {Object} order
   * @return {Promise} p - resolves to the created order on success
   */
  loadOrder (order) {
    const { name, args, id } = order
    const argsJSON = decodeURI(args)
    let params

    try {
      params = JSON.parse(argsJSON)
    } catch (e) {
      debug('failed to parse saved order args: %s', e.message)
      return Promise.reject(e)
    }

    const C = this._algos[name]

    if (!C) {
      return Promise.reject(new Error('Unknown algo name'))
    }

    const o = C.load(this._ws, this._rest, {
      ...params,
      id
    })

    if (o instanceof Error) {
      debug('failed to spawn order: %s', o.message)
      return Promise.reject(o)
    }

    debug('loaded algo order %s:%d [active %d]', o.name, o.gid, o.active)

    this._orders.push(o)
    o.on('persist', o => { saveOrder(o) })

    return Promise.resolve(o)
  }

  /**
   * @return {Promise} p - resolves on success
   */
  async saveState () {
    debug('saving state...')

    return saveMultipleOrders(this._orders)
  }

  async registerAlgos () {
    const algos = Object.values(this._algos)

    debug(`setting algo UI settings: ${algos.map(a => a.name).join(', ')}`)

    await AlgoOrder.registerAlgoUIs(this._rest, algos)

    if (this._ws.isAuthenticated()) {
      return this._broadcastAORefresh()
    }

    this._ws.once('auth', this._broadcastAORefresh.bind(this))
    return null
  }

  async deregisterAlgos () {
    const algos = Object.values(this._algos)

    debug(`deleting algo UI settings: ${algos.map(a => a.name).join(', ')}`)

    await AlgoOrder.deregisterAlgoUIs(this._rest, algos)
  }

  isActive () {
    return this._active
  }

  /**
   * @return {Promise} P
   */
  async start () {
    if (this._active) {
      throw new Error('Already active')
    }

    this._startHBInterval()
    this._ws.onNotification({ cbGID: this._id }, this._onNotification)
    this._active = true

    await this.loadState()
    await this.startOrders()

    debug('started')
  }

  /**
   * @return {Promise} P
   */
  async stop () {
    if (!this._active) {
      throw new Error('Not active')
    }

    this._stopHBInterval()
    this._ws.removeListeners(this._id)
    this._active = false

    await this.saveState()
    await this.stopOrders({
      persist: false
    })

    debug('stopped')
  }

  _startHBInterval () {
    if (this._hbInterval !== null) return
    this._hbInterval = setInterval(this._onHB, HB_INTERVAL)
  }

  _stopHBInterval () {
    clearInterval(this._hbInterval)
    this._hbInterval = null
  }

  _onHB () {
    this._ws.send([0, 'n', null, {
      mid: Date.now(),
      type: 'ucm-hb',
      info: {}
    }])
  }

  _resError (mid, type, error) {
    console.trace(error)

    return this._res(mid, type, {
      notify: {
        type: 'error',
        message: error
      }
    })
  }

  /**
   * Responds to an incoming broadcast by ID
   *
   * @param {number} mid - incoming broadcast ID
   * @param {string} type - incoming broadcast type
   * @param {Object} info - broadcast data
   */
  _res (mid, type, info = {}) {
    const t = type.split('-')
    t[3] = 'res'

    return this._ws.send([0, 'n', null, {
      mid: mid + 1,
      type: t.join('-'),
      info
    }])
  }

  /**
   * Called when a broadcast is received.
   *
   * @param {Array} notification
   */
  _onNotification (notification = []) {
    const [, type = '', mid, , data = {}] = notification
    if (type === 'ucm-hb') return // ignore heartbeats

    const actionData = type.split('-')
    const [ucm, action, algoName, reqType] = actionData

    // Validate structure
    if (ucm !== 'ucm' || reqType !== 'req') return

    if (!this._algos[algoName]) {
      return this._resError(mid, type, `Unknown algo: ${algoName}`)
    }

    if (action === 'preview') {
      return this._onPreview(mid, type, algoName, data)
    } else if (action === 'submit') {
      return this._onSubmit(mid, type, algoName, data)
    }

    return this._resError(mid, type, `Unknown action: ${action}`)
  }

  /**
   * Spawns a new order and starts it in preview model with the provided param
   * set. The generated preview order set is broadcast back over ws2.
   *
   * @param {number} mid - initiating broadcast ID, used to generate the res ID
   * @param {string} type - initiating broadcast type (ucm-...)
   * @param {string} algoName - name of algo order to spawn
   * @param {Object} data - algo parameters
   */
  _onPreview (mid, type, algoName, data) {
    const o = this._spawnOrder(algoName, data)

    if (o instanceof Error) {
      console.error(o.stack)

      return this._resError(mid, type, o.message)
    }

    o.start({ preview: true }).then((orders) => {
      return this._res(mid, type, {
        orders: orders.map(o => {
          return typeof o.toPreview === 'function'
            ? o.toPreview()
            : o
        }),

        notify: {
          type: 'info',
          message: `Generated ${orders.length} preview orders`
        }
      })
    }).catch((err) => {
      return this._resError(mid, type, err.message)
    })
  }

  /**
   * Spawns a new order with the provided param set and starts it. The order
   * is saved to the DB on 'persist' events.
   *
   * @param {number} mid - initiating broadcast ID, used to generate the res ID
   * @param {string} type - initiating broadcast type (ucm-...)
   * @param {string} algoName - name of algo order to spawn
   * @param {Object} data - algo parameters
   */
  _onSubmit (mid, type, algoName, data) {
    const o = this._spawnOrder(algoName, data)

    if (o instanceof Error) {
      return this._resError(mid, type, o.message)
    }

    this._orders.push(o) // track

    o.on('persist', o => { saveOrder(o) })
    o.on('started', () => {
      this._notifyUI('success', `Started ${o.getUIName()}`)
    })
    o.on('stopped', () => {
      this._notifyUI('info', `Stopped ${o.getUIName()}`)
    })

    return o.start().then(() => {
      return saveOrder(o)
    }).then(() => {
      return this._res(mid, type, { clearPreview: true })
    }).catch((err) => {
      return this._resError(mid, type, err.message)
    })
  }

  /**
   * @param {string} name - algo name
   * @param {Object} params - algo param set
   * @return {AlgoOrder|Error} res - order object or an Error instance
   */
  _spawnOrder (name, params) {
    const C = this._algos[name]
    const data = C && C.processUIParams
      ? C.processUIParams(params)
      : params

    if (!C) {
      return new Error('Unknown algo name')
    }

    try {
      return new C(this._ws, this._rest, data)
    } catch (e) {
      return e
    }
  }

  _broadcastAORefresh () {
    this._res(Date.now(), 'ucm-ao-reload-req')
  }
}

module.exports = AlgoServer
