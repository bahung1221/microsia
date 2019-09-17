const EventEmitter2 = require('eventemitter2').EventEmitter2

/**
 * Function to create singleton broker and transporter instance and functions of it (wrapper)
 *
 * @return {object}
 */
const broker = function () {
  /**
   * Broker transit singleton instance
   *
   * @type {Transporter}
   */
  let transporter = null

  /**
   * Event bus, using for emit/listen internal event
   *
   * @type {EventEmitter2}
   */
  let eventBus = null

  /**
   * Middleware list,
   * Each middleware in array will be call one by one each incoming request
   *
   * @type {Array}
   */
  let middlewares = []

  /**
   * Start broker,
   * Create singleton instances: transporter, event emitter,...
   *
   * @param transporterClass
   * @param opt
   */
  function start(transporterClass, opt) {
    // Init transporter
    if (!transporter) {
      transporter = new transporterClass(opt)
      transporter.connect()
      console.log('Broker was started')
    }

    // Init event bus
    if (!eventBus) {
      eventBus = new EventEmitter2({
        wildcard: true,
        maxListeners: 100
      })
    }
  }

  /**
   * Add an middleware to broker
   * This middleware will be call for each incoming request
   *
   * @param {String} subject
   * @param {Function} func
   */
  function use(subject, func) {
    if (!func) {
      func = subject
      subject = null
    }

    middlewares.push(func)
  }

  /**
   * Subscribe to given subject
   *
   * @param subject
   * @param middleware
   * @param func
   * @return {Promise<void>}
   */
  function subscribe(subject, middleware, func) {
    transporter.subscribe(subject, middlewares.concat([middleware, func]))
  }

  /**
   *
   * @param subject
   * @param body
   */
  function publish(subject, body) {
    transporter.publish(subject, body)
  }

  /**
   *
   * @param subject
   * @param body
   */
  function request(subject, body) {
    return transporter.request(subject, body)
  }

  function emit(event, body) {
    eventBus.emit(event, ...body)
  }

  function on(event, func) {
    eventBus.on(event, func)
  }

  function once(event, func) {
    eventBus.once(event, func)
  }

  return {
    start,
    use,
    subscribe,
    publish,
    request,
    emit,
    on,
    once,
  }
}

module.exports = broker()
