const NATS = require('nats')
const Transporter = require('./base')
const OPTINAL_CONFIGS = {
  servers: ['nats://127.0.0.1:4222'],
  timeout: 10000,
  pingInterval: 120000,
  reconnect: true,
  reconnectTimeWait: 2000,
  maxReconnectAttempts: 10,
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
    this.opt = Object.assign({}, OPTINAL_CONFIGS, opt, NON_OPTINAL_CONFIGS)
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
   * @return void
   */
  disconnect() {
    this.client.flush(() => {
      this.client.close()
      this.client = null
    })
  }

  /**
   * Subscribe to an topic on nats server
   * Each message received from nats server will be run one by one in functions chain (middleware)
   *
   * @param {String} subject
   * @param {Function|Array} func
   * @param {Service} caller
   */
  subscribe(subject, func, caller) {
    this.client.subscribe(subject, async (payload, replyTo) => {
      const request = super.makeIncomingRequest(payload)
      const response = super.makeOutgoingResponse()

      response.once('send', (data) => this.publish(replyTo, data, caller))
      super.handleImcomingRequest(request, response, func)
    })
  }

  /**
   * Publish an message to nats server without need to waiting for any response
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Service} caller
   */
  publish(subject, body, caller) {
    const request = super.makeOutgoingRequest(subject, body, caller)
    this.client.publish(subject, request)
  }

  /**
   * Publish an message to nats server and waiting for corresponding response
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Service} caller
   */
  request(subject, body, caller) {
    const request = super.makeOutgoingRequest(subject, body, caller)
    return new Promise((resolve, reject) => {
      this.client.requestOne(subject, request, {}, this.opt.timeout, (response) => {
        if (NatsTransporter.isNatsError(response)) {
          return reject(new Error('Request to nats timed out.'))
        }
        resolve(response)
      })
    })
  }

  static isNatsError(response) {
    return response instanceof NATS.NatsError && response.code === NATS.REQ_TIMEOUT
  }
}

module.exports = NatsTransporter
