/* eslint-disable */
const express = require('express')
const broker = require('../../broker') // Broker

const expressApp = express()
const port = 3000
const microApp = broker({
  transporter: 'nats',
  transporterOptions: {
    servers: ['nats://demo.nats.io:4222'],
    timeout: 3000,
  },
}).createService({ name: 'gateway' })

expressApp.get('/api/foo', async (req, res) => {
  const resp = await microApp.request('foo.foo', {})
  res.json(resp)
})

expressApp.get('/api/bar', async (req, res) => {
  const resp = await microApp.request('bar.bar', { name: 'no-one' })
  res.json(resp)
})

expressApp.listen(port, () => console.log(`Example app listening on port ${port}!`))
