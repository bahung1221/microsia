const eventBus = require('../event-bus')
const OutgoingResponse = require('../response/outgoing')

class Transporter {
  constructor(opt = {}) {
    this.replyCounter = 0
    this.opt = opt
  }

  async handleImcomingRequest(request, response, func) {
    if (typeof func === 'function') {
      return func(request, response)
    }

    if (Array.isArray(func)) {
      for (let i = 0; i < func.length; i++) {
        if (typeof func[i] === 'function') {
          await func[i](request, response)
        }

        if (response.isSent) {
          break
        }
      }
    }
  }

  connect() {
    // Do nothing
  }

  disconnect() {
    // Do nothing
  }

  subscribe(subject, func) {
    eventBus.on(subject, payload => {
      let response = this.makeOutgoingResponse()

      response.once('send', (data) => {
        eventBus.emit(payload.replyTo, data)
      })
      this.handleImcomingRequest(payload.body, response, func)
    })
  }

  publish(subject, body) {
    eventBus.emit(subject, body)
  }

  request(subject, body) {
    return new Promise(resolve => {
      let replyTo = (++this.replyCounter).toString()

      // Reset counter
      if (this.replyCounter >= Number.MAX_SAFE_INTEGER) {
        this.replyCounter = 0
      }

      eventBus.once(replyTo, response => resolve(response))
      eventBus.emit(subject, {
        body,
        replyTo,
      })
    })
  }

  makeIncomingRequest(req) {
    // TODO
  }

  makeOutgoingResponse(replyTo, publishFunc) {
    return new OutgoingResponse(replyTo, publishFunc)
  }

  makeOutgoingRequest() {
    // TODO
  }
}

module.exports = Transporter
