const loadServices = require('../runner')

const services = [
  'services/foo.js',
  'services/bar.js',
]
const options = {
  transporter: {
    name: 'nats',
    options: {
      servers: ['nats://demo.nats.io:4222'],
      timeout: 3000,
      pingInterval: 120000,
      reconnect: true,
      reconnectTimeWait: 2000,
      maxReconnectAttempts: 10,
      maxRequestRetryAttempts: 3,
    },
  },
}

loadServices(options, services)
