const loadServices = require('../runner')

const services = [
  'services/foo.js',
  'services/bar.js',
]
const options = {
  transporter: 'nats',
  transporterOptions: {
    servers: ['nats://128.199.190.68:4222'],
    timeout: 3000,
    pingInterval: 120000,
    reconnect: true,
    reconnectTimeWait: 2000,
    maxReconnectAttempts: 10,
    maxRequestRetryAttempts: 3,
  },
}

loadServices(options, services)
