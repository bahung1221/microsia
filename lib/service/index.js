class Service {
  constructor(broker, opt) {
    this.broker = broker
    this.opt = opt
    this.name = opt.name
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
    const listFuncs = this.middlewares
      .concat([middleware, func])
      .filter(func => func && typeof func === 'function')

    this.broker.subscribe(subject, listFuncs, this)
  }

  /**
   *
   * @param subject
   * @param body
   */
  publish(subject, body) {
    this.broker.publish(subject, body, this)
  }

  /**
   *
   * @param subject
   * @param body
   */
  request(subject, body) {
    return this.broker.request(subject, body, this)
  }
}

module.exports = Service
