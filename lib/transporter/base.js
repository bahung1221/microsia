const eventBus = require('../event-bus')
const OutgoingResponse = require('../response/outgoing')
const OutgoingRequest = require('../request/outgoing')
const IncomingRequest = require('../request/incoming')

/**
 * Base transporter and also local transporter
 * Using local pubsub system to handle in-memory messaging
 *
 * @class Transporter
 */
class Transporter {
  constructor() {
    this.replyCounter = 0
  }

  /**
   *
   *
   * @param {IncomingRequest} request
   * @param {OutgoingResponse} response
   * @param {Function|Array} func
   * @return {Promise<void>}
   */
  async handleImcomingRequest(request, response, func) {
    const done = () => {
      console.log('done')
      // TODO: What should i do when functions chain was done?
    }
    const fn = this.funcCompose(func)

    fn(request, response, done)
  }

  /**
   * Compose given functions chain into one function
   *
   * @param {Array} fnList
   * @return {Function}
   */
  funcCompose(fnList) {
    if (!Array.isArray(fnList)) throw new Error('Middleware stack must be an array!')
    for (const fn of fnList) {
      if (typeof fn !== 'function') throw new Error('Middleware must be composed of functions!')
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

    return function (req, res, done) {
      // last called middleware #
      let index = -1

      function dispatch (i) {
        if (i <= index) {
          return Promise.reject(new Error('next() called multiple times'))
        }

        index = i
        let fn = fnList[i]
        if (i === fnList.length) {
          fn = done
        }

        // If fn is undefined, break the functions chain
        if (!fn) {
          return Promise.resolve()
        }
        try {
          return Promise.resolve(fn(req, res, dispatch.bind(null, i + 1)))
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
   * @return void
   */
  disconnect() {
    // Do nothing
  }

  /**
   * Subscribe to an event on local pubsub
   * Each message received will be run one by one in functions chain (middleware)
   *
   * @param {String} subject
   * @param {Function|Array} func
   * @param {Service} caller
   */
  subscribe(subject, func, caller) {
    eventBus.on(subject, payload => {
      const request = this.makeIncomingRequest(payload.request)
      const response = this.makeOutgoingResponse()

      response.once('send', (data) => {
        this.publish(payload.replyTo, data, caller)
      })
      this.handleImcomingRequest(request, response, func)
    })
  }

  /**
   * Publish an event to local pubsub without need to waiting for any response
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Service} caller
   */
  publish(subject, body, caller) {
    const request = this.makeOutgoingRequest(subject, body, caller)
    eventBus.emit(subject, request)
  }

  /**
   * Publish an event to local pubsub and then waiting for corresponding response
   * Each request will be attach an unique reply event name
   * Unique reply event name will be used to listen response from target service
   * In other side, target service will send response to that reply event name after processed request
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Service} caller
   * @return {Promise<*>}
   */
  request(subject, body, caller) {
    const request = this.makeOutgoingRequest(subject, body, caller)
    return new Promise(resolve => {
      const replyTo = (++this.replyCounter).toString()

      // Reset counter
      if (this.replyCounter >= Number.MAX_SAFE_INTEGER) {
        this.replyCounter = 0
      }

      eventBus.once(replyTo, response => resolve(response))
      eventBus.emit(subject, {
        request,
        replyTo,
      })
    })
  }

  /**
   * Create an IncomingRequest instance,
   * Which represent for incoming data
   *
   * @param {Object} req
   * @return {IncomingRequest}
   */
  makeIncomingRequest(req) {
    return new IncomingRequest(req)
  }

  /**
   * Create an OutgoingResponse instance,
   * Which will be use to attach response data and send back to requester
   *
   * @return {OutgoingResponse}
   */
  makeOutgoingResponse() {
    return new OutgoingResponse()
  }

  /**
   * Aggregate given data into outgoing request object
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Service} caller
   * @return {Object}
   */
  makeOutgoingRequest(subject, body, caller) {
    return OutgoingRequest.createRequest(subject, body, caller)
  }
}

module.exports = Transporter
