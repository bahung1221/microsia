/**
 * Class to create outgoing requests,
 * That must be create before call/reply to other services (publish/request)
 * TODO: Consider using factory function for outgoing request, because it seem unnecessary to create an class instance
 *
 * @class OutgoingRequest
 */
class OutgoingRequest {
  static createRequest(subject, body, caller) {
    const meta = {
      serviceName: caller.name,
    }
    return {
      body: body,
      headers: {},
      meta,
    }
  }
}

module.exports = OutgoingRequest
