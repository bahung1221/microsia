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

  connect() {
    this.client = NATS.connect(this.opt)
  }

  disconnect() {
    this.client.flush(() => {
      this.client.close()
      this.client = null
    })
  }

  subscribe(subject, func, caller) {
    this.client.subscribe(subject, async (request, replyTo) => {
      const response = super.makeOutgoingResponse()

      response.once('send', (data) => this.publish(replyTo, data, caller))
      super.handleImcomingRequest(request, response, func)
    })
  }

  publish(subject, body, caller) {
    const request = super.makeOutgoingRequest(subject, body, caller)
    this.client.publish(subject, request)
  }

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
