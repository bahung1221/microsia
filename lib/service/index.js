const { uuid } = require('../util')

class Service {
  constructor(broker, opt) {
    this.broker = broker
    this.opt = opt
    this.middlewares = []
    this.name = opt.name
    this.id = uuid()
  }

  /**
   * Add an middleware to broker
   * This middleware will be call for each incoming request
   *
   * @param {Function} func
   */
  use(func) {
    if (typeof func === 'function') {
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
      .filter(fn => fn && typeof fn === 'function')

    this.broker.subscribe(subjectWithPrefix, listFuncs, {
      caller: this,
    })
  }

  /**
   *
   * @param subject
   * @param body
   * @param opt
   */
  publish(subject, body, opt = {}) {
    this.broker.publish(subject, body, {
      ...opt,
      ...{ caller: this },
    })
  }

  /**
   *
   * @param subject
   * @param body
   * @param opt
   */
  call(subject, body, opt = {}) {
    return this.broker.call(subject, body, {
      ...opt,
      ...{ caller: this },
    })
  }
}

module.exports = Service
