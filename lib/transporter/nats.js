const NATS = require('nats')
const Transporter = require('./base')
const servers = ['nats://127.0.0.1:4222']
const OPTINAL_CONFIGS = {
  servers,
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
    super()
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

  subscribe(subject, func) {
    this.client.subscribe(`${this.opt.name}.${subject}`, async (request, replyTo) => {
      let isResponsed = false,
        response = super.makeOutgoingResponse()
        // response = (data) => {
        //   this.client.publish(replyTo, data)
        //   isResponsed = true
        // }

      response.on('send', (data) => this.publish(replyTo, data))
      if (typeof func === 'function') {
        return func(request, response)
      }

      if (Array.isArray(func)) {
        for (let i = 0; i < func.length; i++) {
          if (typeof func[i] === 'function') {
            await func[i](request, response)
          }

          if (isResponsed) {
            break
          }
        }
      }
    })
  }

  publish(subject, body) {
    this.client.publish(subject, body)
  }

  request(subject, body) {
    return new Promise((resolve, reject) => {
      this.client.requestOne(subject, body, {}, this.opt.timeout, (response) => {
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
