const path = require('path')
const broker = require('./broker') // Broker

function loadServices(opt, arr) {
  // Load broker first
  broker(opt)

  // Load all given services
  arr.forEach(service => {
    require(path.join(process.cwd(), service))
  })
}

module.exports = loadServices
