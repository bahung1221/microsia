/**
 * Class to create outgoing requests,
 * That must be create before call/reply to other services (publish/request)
 * TODO: Consider using factory function for outgoing request, because it seem unnecessary to create an class instance
 *
 * @class OutgoingRequest
 */
class OutgoingRequest {
  /**
   * @param {String} subject
   * @param {Object} body
   * @param {Object} opt
   * @return {Object}
   */
  static createRequest(subject, body, opt = {}) {
    const caller = opt.caller || {}
    const meta = {
      ...(opt.meta || {}),
      ...{
        serviceName: caller.name,
        serviceId: caller.id,
      },
    }
    return {
      body,
      headers: opt.headers || {},
      meta,
    }
  }
}

module.exports = OutgoingRequest
