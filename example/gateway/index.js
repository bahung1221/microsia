/* eslint-disable */
const express = require('express')
const broker = require('../../broker') // Broker

const expressApp = express()
const port = 3000
const microApp = broker({
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
}).createService({ name: 'gateway' })

expressApp.get('/api/foo', async (req, res) => {
  const resp = await microApp.call('foo.foo', {})
  res.json(resp)
})

expressApp.get('/api/bar', async (req, res) => {
  const resp = await microApp.call('bar.bar', { name: 'no-one' })
  res.json(resp)
})

expressApp.listen(port, () => console.log(`Example app listening on port ${port}!`))
