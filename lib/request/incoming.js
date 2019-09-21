/**
 * Incoming request that contain remote service info, input data, input headers,...
 * That must be create before pass to middleware/route functions
 *
 * @class IncomingRequest
 */
class ImcomingRequest {
  constructor(payload) {
    this.body = payload.body || {}
    this.headers = payload.headers || {}
    this.meta = payload.meta || {}
  }

  getHeader(header) {
    if (!header) {
      return this.headers
    }
    if (this.headers[header]) {
      return this.headers[header]
    }

    return null
  }
}

module.exports = ImcomingRequest
