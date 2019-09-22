/**
 * @class OutgoingResponse
 */
class OutgoingResponse {
  constructor(handler, caller) {
    this.isSent = false
    this.caller = caller
    this.handler = handler
  }

  send(data) {
    if (!this.isSent) {
      this.handler.call(this.caller, data)
      this.isSent = true
    }
  }
}

module.exports = OutgoingResponse
