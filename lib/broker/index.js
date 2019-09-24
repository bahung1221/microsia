const Service = require('../service')
const Transporter = require('../transporter/base')

const TRANSPORTERS = {
  nats: '../transporter/nats',
  kafka: '../transporter/kafka',
}

class Broker {
  constructor(opt = {}) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    this.TransporterClass = require(TRANSPORTERS[opt.transporter.name])
    this.transporterOpt = { ...opt.transporter.options }
    this.transporter = null
    this.localTransporter = null
    this.services = new Map()
  }

  /**
   * Start broker,
   * Create remote and local transporter
   *
   * @return void
   */
  start() {
    // Init transporter
    if (!this.transporter && this.TransporterClass) {
      this.transporter = new this.TransporterClass(this.transporterOpt)
      this.transporter.connect()
      // console.log('Transporter was started')
    }
    if (!this.localTransporter) {
      this.localTransporter = new Transporter(this.transporterOpt)
      this.localTransporter.connect()
      // console.log('Local transporter was started')
    }
  }

  /**
   * Create an new service and then add that service to endpoints list
   *
   * @param {Object} opt
   * @return {Service}
   */
  createService(opt = {}) {
    if (!opt.name || this.services.has(opt.name)) {
      throw new Error('Duplicate service name')
    }
    const service = new Service(this, opt)
    this.services.set(opt.name, service)
    return service
  }

  /**
   * Subscribe to given subject
   *
   * @param {String} subject
   * @param {Array} funcList
   * @param {Object} opt
   * @return {Promise<void>}
   */
  subscribe(subject, funcList, opt = {}) {
    if (this.transporter) {
      this.transporter.subscribe(subject, funcList, opt)
    }
    this.localTransporter.subscribe(subject, funcList, opt)
  }

  /**
   * Publish an message without need to receive response
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Object} opt
   */
  publish(subject, body, opt = {}) {
    const transporter = this._getTransporterBaseOnSubject(subject)

    return transporter.publish(subject, body, opt)
  }

  /**
   * Publish an message and then listen to their response
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Object} opt
   */
  call(subject, body, opt = {}) {
    const transporter = this._getTransporterBaseOnSubject(subject)

    return transporter.request(subject, body, opt)
  }

  /**
   * Get corresponding transporter based on given subject
   * If given subject is a request to local service, return local transporter
   * Else return remote transporter
   *
   * @param {String} subject
   * @return {Transporter}
   * @private
   */
  _getTransporterBaseOnSubject(subject) {
    if (this._hasLocalService(subject)) {
      return this.localTransporter
    }
    return this.transporter
  }

  /**
   * Check if given subject can be call as local
   *
   * @param {String} subject
   * @return {Boolean}
   * @private
   */
  _hasLocalService(subject) {
    const service = subject.split('.').shift()

    return this.services.has(service)
  }
}

// Singleton pattern
// Init only one broker for entire app
function broker() {
  let inst = null

  /**
   * Init broker once
   *
   * @param opt
   * @return {Broker}
   */
  function init(opt) {
    if (!inst) {
      inst = new Broker(opt)
      inst.start()
    }
    return inst
  }

  return init
}

module.exports = broker()
