const eventBus = require('../event-bus')
const OutgoingResponse = require('../response/outgoing')

class Transporter {
  static throwMissingImplementError(func) {
    throw new Error(`Method ${func} must be implement!`)
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
      let replyTo = (Date.now()).toString() // TODO

      eventBus.on(replyTo, response => resolve(response))
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
