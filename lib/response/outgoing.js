/**
 * @class OutgoingResponse
 */
class OutgoingResponse {
  constructor(handler, transporter) {
    this.transporter = transporter
    this.handler = handler
    this.status = 200
    this.headers = {}
    this.isSent = false
  }

  send(data) {
    if (!this.isSent) {
      this.handler.call(this.transporter, this._makeResponse(data))
      this.isSent = true
    }
  }

  setStatus(status) {
    this.status = status
  }

  setHeader(key, val) {
    if (typeof key === 'object') {
      Object.entries(key).forEach(([header, headerVal]) => {
        this.headers[header] = headerVal
      })
      return
    }

    if (val) {
      this.headers[key] = val
    }
  }

  _makeResponse(data) {
    return {
      body: data,
      status: this.status,
      headers: this.headers,
    }
  }
}

module.exports = OutgoingResponse
