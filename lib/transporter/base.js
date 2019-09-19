const OutgoingResponse = require('../response/outgoing')

class Transporter {
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
