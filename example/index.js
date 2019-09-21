const loadServices = require('../lib/runner')
const services = [
  'services/foo.js',
  'services/bar.js',
]
const options = {
  transporter: 'nats',
  transporterOptions: {
    servers: ['nats://128.199.190.68:4222'],
  },
}

loadServices(options, services)
