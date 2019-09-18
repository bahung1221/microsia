const broker = require('../broker') // Broker

class OutgoingResponse {
  constructor(replyTo) {
    this.replyTo = replyTo
  }

  send(data) {

  }

  publish(subject, body) {
    // Must be implement in children class
    throw new Error('publish method must be implement in children class')
  }
}
