const NATS = require('nats')
const Transporter = require('./base')

const OPTINAL_CONFIGS = {
  servers: ['nats://127.0.0.1:4222'],
  timeout: 10000,
  pingInterval: 120000,
  reconnect: true,
  reconnectTimeWait: 2000,
  maxReconnectAttempts: 10,
  maxRequestRetryAttempts: 3,
}
const NON_OPTINAL_CONFIGS = {
  json: true,
}

/**
 * Nats transporter
 *
 * @class NatsTransporter
 */
class NatsTransporter extends Transporter {
  constructor(opt = {}) {
    super(opt)
    this.opt = { ...OPTINAL_CONFIGS, ...opt, ...NON_OPTINAL_CONFIGS }
    this.client = null
  }

  /**
   * Connect to Nats server
   *
   * @return void
   */
  connect() {
    this.client = NATS.connect(this.opt)
  }

  /**
   * Disconnect with nats server
   *
   * @return {Promise<void>}
   */
  disconnect() {
    return new Promise(resolve => {
      this.client.flush(() => {
        this.client.close()
        this.client = null
        resolve()
      })
    })
  }

  /**
   * Subscribe to an topic on nats server
   * Each message received from nats server will be run one by one in functions chain (middleware)
   *
   * @param {String} subject
   * @param {Array} func
   * @param {Object} opt
   */
  subscribe(subject, func, opt = {}) {
    this.client.subscribe(subject, async (payload, replyTo) => {
      const responseCb = data => {
        this.client.publish(replyTo, data)
      }
      const ctx = Transporter.createContext(payload, {
        responseCb,
        caller: opt.caller,
      })

      super.handleImcomingRequest(ctx, func)
    })
  }

  /**
   * Publish an message to nats server without need to waiting for any response
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Object} opt
   */
  publish(subject, body, opt = {}) {
    const request = Transporter.createOutgoingRequest(subject, body, opt)
    this.client.publish(subject, request)
  }

  /**
   * Publish an message to nats server and waiting for corresponding response
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Object} opt
   * @return {Promise<*>}
   */
  async request(subject, body, opt = {}) {
    let retryCount = 0
    const request = Transporter.createOutgoingRequest(subject, body, opt)

    do {
      try {
        const resp = await this._requestOne(subject, request)
        return resp
      } catch (e) {
        retryCount++
      }
    } while (retryCount < this.opt.maxRequestRetryAttempts)

    return Promise.reject(new Error(`Request to ${subject} timed out.`))
  }

  /**
   * Send given request to remote service
   *
   * @param {String} subject
   * @param {Object} request
   * @return {Promise<*>}
   * @private
   */
  _requestOne(subject, request) {
    return new Promise((resolve, reject) => {
      this.client.requestOne(subject, request, {}, this.opt.timeout, resp => {
        if (NatsTransporter.isNatsError(resp)) {
          return reject(new Error('Request to nats timed out.'))
        }
        return resolve(resp)
      })
    })
  }

  /**
   * Check if given response is an error
   *
   * @param {Object} response
   * @return {boolean}
   */
  static isNatsError(response) {
    return response instanceof NATS.NatsError
      && response.code === NATS.REQ_TIMEOUT
  }
}

module.exports = NatsTransporter
