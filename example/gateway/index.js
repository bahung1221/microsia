const express = require('express')
const expressApp = express()
const port = 3000
const Broker = require('../../lib/broker') // Broker
const broker = Broker({
  transporter: 'nats',
  transporterOptions: {
    servers: ['nats://128.199.190.68:4222'],
    timeout: 3000,
  },
})
const microApp = broker.createService({ name: 'gateway' })

expressApp.get('/api/foo', async (req, res) => {
  const resp = await microApp.request('foo.foo', {})
  res.json(resp)
})

expressApp.get('/api/bar', async (req, res) => {
  const resp = await microApp.request('bar.bar', { name: 'no-one' })
  res.json(resp)
})

expressApp.listen(port, () => console.log(`Example app listening on port ${port}!`))
