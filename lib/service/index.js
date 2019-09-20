class Service {
  constructor(broker, opt) {
    this.broker = broker
    this.opt = opt
    this.middlewares = []
  }

  /**
   * Add an middleware to broker
   * This middleware will be call for each incoming request
   *
   * @param {String} subject
   * @param {Function} func
   */
  use(subject, func) {
    if (!func) {
      func = subject
      subject = null
    }

    this.middlewares.push(func)
  }

  /**
   * Subscribe to given subject
   *
   * @param subject
   * @param middleware
   * @param func
   * @return {Promise<void>}
   */
  subscribe(subject, middleware, func) {
    subject = `${this.opt.name}.${subject}`

    this.broker.subscribe(subject, this.middlewares.concat([middleware, func]))
  }

  /**
   *
   * @param subject
   * @param body
   */
  publish(subject, body) {
    this.broker.publish(subject, body)
  }

  /**
   *
   * @param subject
   * @param body
   */
  request(subject, body) {
    return this.broker.request(subject, body)
  }
}

module.exports = Service
