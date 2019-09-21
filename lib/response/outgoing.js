const EventEmitter2 = require('eventemitter2').EventEmitter2

/**
 *
 * @class OutgoingResponse
 */
class OutgoingResponse extends EventEmitter2 {
  constructor() {
    super({
      wildcard: true,
      maxListeners: 100,
    })
    this.isSent = false
  }

  send(data) {
    this.emit('send', data)
    this.isSent = true
  }
}

module.exports = OutgoingResponse
