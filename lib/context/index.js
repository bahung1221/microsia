const OutgoingResponse = require('../response/outgoing')
const IncomingRequest = require('../request/incoming')
const { uuid } = require('../util')

class Context {
  constructor(req, opt = {}) {
    this.req = Context.makeIncomingRequest(req)
    this.res = Context.makeOutgoingResponse(opt)
    this.service = opt.service
    this.requestId = (req.meta || {}).requestId || uuid()
  }

  /**
   * Create an IncomingRequest instance,
   * Which represent for incoming data
   *
   * @param {Object} req
   * @return {IncomingRequest}
   */
  static makeIncomingRequest(req) {
    return new IncomingRequest(req)
  }

  /**
   * Create an OutgoingResponse instance,
   * Which will be use to attach response data and send back to requester
   *
   * @return {OutgoingResponse}
   */
  static makeOutgoingResponse(opt) {
    return new OutgoingResponse(opt.responseCb, opt.transporter)
  }

  /**
   *
   * @param subject
   * @param body
   * @param opt
   * @return {Promise<*>}
   */
  call(subject, body, opt = {}) {
    return this.service.call(subject, body, {
      ...opt,
      ...{
        meta: {
          requestId: this.requestId,
        },
      },
    })
  }
}

module.exports = Context
