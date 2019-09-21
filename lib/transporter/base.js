const eventBus = require('../event-bus')
const OutgoingResponse = require('../response/outgoing')
const OutgoingRequest = require('../request/outgoing')

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

  subscribe(subject, func, caller) {
    eventBus.on(subject, payload => {
      const response = this.makeOutgoingResponse()

      response.once('send', (data) => {
        this.publish(payload.replyTo, data, caller)
      })
      this.handleImcomingRequest(payload.request, response, func)
    })
  }

  publish(subject, body, caller) {
    const request = this.makeOutgoingRequest(subject, body, caller)
    eventBus.emit(subject, request)
  }

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

  makeIncomingRequest(req) {
    // TODO
  }

  makeOutgoingResponse(replyTo, publishFunc) {
    return new OutgoingResponse(replyTo, publishFunc)
  }

  makeOutgoingRequest(subject, body, caller) {
    return OutgoingRequest.createRequest(subject, body, caller)
  }
}

module.exports = Transporter
