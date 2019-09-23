/**
 * Incoming request that contain remote service info, input data, input headers,...
 * That must be create before pass to middleware/route functions
 *
 * @class IncomingRequest
 */
class IncomingRequest {
  constructor(payload) {
    const input = payload ? { ...payload } : {}
    this.body = input.body || {}
    this.headers = input.headers || {}
    this.meta = input.meta || {}
  }
}

module.exports = IncomingRequest
