const Service = require('../service')
const Transporter = require('../transporter/base')
const TRANSPORTERS = {
  'nats': '../transporter/nats',
  'kafka': '../transporter/kafka'
}

class Broker {
  constructor(opt = {}) {
    try {
      this.transporterClass = require(TRANSPORTERS[opt.transporter])
    } catch (e) {
      console.log('No valid transporter was given => create only local transporter')
    }
    this.transporterOpt = opt.transporterOptions
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
    if (!this.transporter && this.transporterClass) {
      this.transporter = new this.transporterClass(this.transporterOpt)
      this.transporter.connect()
      console.log('Transporter was started')
    }
    if (!this.localTransporter) {
      this.localTransporter = new Transporter(this.transporterOpt)
      this.localTransporter.connect()
      console.log('Local transporter was started')
    }
  }

  createService(opt = {}) {
    if (!opt.name || this.services.has(opt.name)) {
      throw new Error('Duplicate service name')
    }
    let service = new Service(this, opt)
    this.services.set(opt.name, service)
    return service
  }

  /**
   * Subscribe to given subject
   *
   * @param {String} subject
   * @param {Array} funcList
   * @return {Promise<void>}
   */
  subscribe(subject, funcList) {
    this.transporter && this.transporter.subscribe(subject, funcList)
    this.localTransporter.subscribe(subject, funcList)
  }

  /**
   * Publish an message without need to receive response
   *
   * @param subject
   * @param body
   */
  publish(subject, body) {
    if (this.hasLocalService(subject)) {
      return this.localTransporter.publish(subject, body)
    }

    return this.transporter.publish(subject, body)
  }

  /**
   * Publish an message and then listen to their response
   *
   * @param subject
   * @param body
   */
  request(subject, body) {
    if (this.hasLocalService(subject)) {
      return this.localTransporter.request(subject, body)
    }

    return this.transporter.request(subject, body)
  }

  /**
   * Check if given subject can be call as local
   *
   * @param subject
   * @return {boolean}
   */
  hasLocalService(subject) {
    let service = subject.split('.').shift()

    return this.services.has(service)
  }
}

// Singleton pattern
// Init only one broker for entire app
function broker() {
  let inst = null

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
