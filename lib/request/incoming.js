const broker = require('../broker') // Broker

/**
 * Incoming request that contain remote service info, input data, input headers,...
 * That must be create before pass to middleware/route functions
 *
 * @class IncomingRequest
 */
class ImcomingRequest {
  constructor(body) {
    this.body = body
    this.headers = {}
  }
}
