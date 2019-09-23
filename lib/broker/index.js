const Service = require('../service')
const Transporter = require('../transporter/base')

const TRANSPORTERS = {
  nats: '../transporter/nats',
  kafka: '../transporter/kafka',
}

class Broker {
  constructor(opt = {}) {
    try {
      this.TransporterClass = require(TRANSPORTERS[opt.transporter])
    } catch (e) {
      console.log('No valid trans was given => create only local transporter')
    }
    this.transporterOpt = { ...opt.transporterOptions }
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
      console.log('Transporter was started')
    }
    if (!this.localTransporter) {
      this.localTransporter = new Transporter(this.transporterOpt)
      this.localTransporter.connect()
      console.log('Local transporter was started')
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
   * @param {Service} caller
   * @return {Promise<void>}
   */
  subscribe(subject, funcList, caller) {
    if (this.transporter) {
      this.transporter.subscribe(subject, funcList, caller)
    }
    this.localTransporter.subscribe(subject, funcList, caller)
  }

  /**
   * Publish an message without need to receive response
   *
   * @param {String} subject
   * @param {Service} caller
   * @param {Object} body
   */
  publish(subject, body, caller) {
    const transporter = this.getTransporterBaseOnSubject(subject)

    return transporter.publish(subject, body, caller)
  }

  /**
   * Publish an message and then listen to their response
   *
   * @param {String} subject
   * @param {Object} body
   * @param {Service} caller
   */
  request(subject, body, caller) {
    const transporter = this.getTransporterBaseOnSubject(subject)

    return transporter.request(subject, body, caller)
  }

  /**
   * Get corresponding transporter based on given subject
   * If given subject is a request to local service, return local transporter
   * Else return remote transporter
   *
   * @param {String} subject
   * @return {Transporter}
   */
  getTransporterBaseOnSubject(subject) {
    if (this.hasLocalService(subject)) {
      return this.localTransporter
    }
    return this.transporter
  }

  /**
   * Check if given subject can be call as local
   *
   * @param {String} subject
   * @return {Boolean}
   */
  hasLocalService(subject) {
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
