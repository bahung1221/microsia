const { EventEmitter2 } = require('eventemitter2')
const OutgoingRequest = require('../request/outgoing')
const Context = require('../context')

const OPTINAL_CONFIGS = {
  timeout: 10000,
}

/**
 * Base transporter and also local transporter
 * Using local pubsub system to handle in-memory messaging
 *
 * @class Transporter
 */
class Transporter {
  constructor(opt = {}) {
    this.opt = { ...OPTINAL_CONFIGS, ...opt }
    this.replyCounter = 0
    this.eventBus = new EventEmitter2({
      wildcards: true,
      maxListeners: 1000,
    })
  }

  /**
   * Aggregate given data into outgoing request object
   *
   * @param {Object} req
   * @param {Object} opt
   * @return {Context}
   */
  static createContext(req, opt = {}) {
    return new Context(req, {
      responseCb: opt.responseCb,
      service: opt.caller,
      transporter: this,
    })
  }

  /**
   * Aggregate given data into outgoing request object
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Object} opt
   * @return {Object}
   */
  static createOutgoingRequest(subject, body, opt = {}) {
    return OutgoingRequest.createRequest(subject, body, opt)
  }

  /**
   *
   *
   * @param {Context} ctx
   * @param {Function|Array} func
   * @return {Promise<void>}
   */
  async handleImcomingRequest(ctx, func) {
    const done = () => {
      // console.log('done')
      // TODO: What should i do when functions chain was done?
    }
    const fn = this.funcCompose(func)

    fn(ctx, done)
  }

  /**
   * Compose given functions chain into one function
   *
   * @param {Array} fnList
   * @return {Function}
   */
  funcCompose(fnList) {
    if (!Array.isArray(fnList)) {
      throw new Error('Middleware stack must be an array!')
    }

    let fnIndex = fnList.length - 1
    while (fnIndex >= 0) {
      if (typeof fnList[fnIndex] !== 'function') {
        throw new Error('Middleware must be composed of functions!')
      }
      fnIndex--
    }

    /**
     * Return an function that received request, response and done callback
     * This function will pass req, res and next function to each middleware one by one
     * `next` is an recursive function, that will invoke and wait for response from next middleware/function
     * The `index` variable is just an closure variable to guaranteed that next only can be call one time for each middleware/function
     *
     * @param {IncomingRequest} req
     * @param {OutgoingResponse} res
     * @param {Function} next
     * @return {Promise}
     * @api public
     */
    return function executable(ctx, done) {
      let index = -1
      function dispatch (i) {
        if (i <= index) return Promise.reject(new Error('next() called many t'))

        index = i
        let fn = fnList[i]
        if (i === fnList.length) fn = done

        try {
          return fn
            ? Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)))
            : Promise.resolve()
        } catch (err) {
          return Promise.reject(err)
        }
      }

      return dispatch(0)
    }
  }

  /**
   * Local transporter doesn't need connect to anywhere
   *
   * @return void
   */
  connect() {
    // Do nothing
  }

  /**
   * Local transporter doesn't need connect to anywhere
   *
   * @return {Promise<void>}
   */
  disconnect() {
    // Do nothing
  }

  /**
   * Subscribe to an event on local pubsub
   * Each message received will be run one by one in functions chain (middleware)
   *
   * @param {String} subject
   * @param {Array} func
   * @param {Object} opt
   */
  subscribe(subject, func, opt = {}) {
    this.eventBus.on(subject, payload => {
      const responseCb = data => {
        this.eventBus.emit(payload.replyTo, data)
      }
      const ctx = Transporter.createContext(payload.request, {
        responseCb,
        caller: opt.caller,
      })

      this.handleImcomingRequest(ctx, func)
    })
  }

  /**
   * Publish an event to local pubsub without need to waiting for any response
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Object} opt
   */
  publish(subject, body, opt = {}) {
    const request = Transporter.createOutgoingRequest(subject, body, opt)
    this.eventBus.emit(subject, { request })
  }

  /**
   * Publish an event to local pubsub and then waiting for corresponding response
   * Each request will be attach an unique reply event name
   * Unique reply event name will be used to listen response from target service
   * In other side, target service will send response to that reply event name after processed request
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Object} opt
   * @return {Promise<*>}
   */
  request(subject, body, opt = {}) {
    const request = Transporter.createOutgoingRequest(subject, body, opt)

    return new Promise((resolve, reject) => {
      const replyTo = (++this.replyCounter).toString()
      const handler = response => resolve(response)
      this.eventBus.once(replyTo, handler)
      this.eventBus.emit(subject, { request, replyTo })

      setTimeout(() => {
        reject(new Error(`Request to ${subject} was timed out`))
        this.eventBus.off(replyTo, handler)
      }, this.opt.timeout)

      // Reset counter
      if (this.replyCounter >= Number.MAX_SAFE_INTEGER) this.replyCounter = 0
    })
  }
}

module.exports = Transporter
