const broker = require('../broker') // Broker

/**
 * Class to create outgoing requests,
 * That must be create before call/reply to other services (publish/request)
 * TODO: Consider using factory function for outgoing request, because it seem unnecessary to create an object
 *
 * @class OutgoingRequest
 */
class OutgoingRequest {
  constructor(body) {
    this.body = body
    this.headers = {}
  }
}
