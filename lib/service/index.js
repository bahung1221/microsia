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
    const fn = !func ? subject : func
    if (typeof fn === 'function') {
      return this.middlewares.push(func)
    }
    throw new Error('Middleware is invalid')
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
    const subjectWithPrefix = `${this.opt.name}.${subject}`
    const listFuncs = this.middlewares
      .concat([middleware, func])
      .filter((fn) => fn && typeof fn === 'function')

    this.broker.subscribe(subjectWithPrefix, listFuncs, this)
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
  call(subject, body) {
    return this.broker.call(subject, body, this)
  }
}

module.exports = Service
