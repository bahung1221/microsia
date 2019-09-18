const broker = require('../broker') // Broker

class OutgoingRequest {
  constructor(body) {
    this.body = body
    this.headers = {}
  }
}
