/**
 * Incoming request that contain remote service info, input data, input headers,...
 * That must be create before pass to middleware/route functions
 *
 * @class IncomingRequest
 */
class IncomingRequest {
  constructor(payload) {
    this.body = payload.body || {}
    this.headers = payload.headers || {}
    this.meta = payload.meta || {}
  }
}

module.exports = IncomingRequest
