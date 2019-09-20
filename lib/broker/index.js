const Service = require('../service')
const TRANSPORTERS = {
  'nats': '../transporter/nats',
  'kafka': '../transporter/kafka'
}

class Broker {
  constructor(opt = {}) {
    try {
      this.transporterClass = require(TRANSPORTERS[opt.transporter])
    } catch (e) {
      throw e
    }
    this.transporterOpt = opt.transporterOptions
    this.transporter = null
    this.services = new Map()
  }

  /**
   * Start broker,
   * Create singleton instances: transporter, event emitter,...
   *
   * @param transporterClass
   * @param opt
   */
  start() {
    // Init transporter
    if (!this.transporter) {
      this.transporter = new this.transporterClass(this.transporterOpt)
      this.transporter.connect()
      console.log('Transporter was started')
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

  hasLocalService(subject) {
    let service = subject.split('.').shift()

    return this.services.has(service)
  }
}

// Singleton pattern
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
