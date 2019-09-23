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
   * @param {Service} caller
   * @return {Object}
   */
  static createRequest(subject, body, caller) {
    const meta = {
      serviceName: caller.name,
    }
    return {
      body,
      headers: {},
      meta,
    }
  }
}

module.exports = OutgoingRequest
