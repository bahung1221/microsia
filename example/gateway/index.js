const express = require('express')
const expressApp = express()
const port = 3000
const Broker = require('../../lib/broker') // Broker
const broker = Broker({
  transporter: 'nats',
  transporterOptions: {
    servers: ['nats://128.199.190.68:4222'],
  },
})
const microApp = broker.createService({ name: 'bar' })

expressApp.get('/foo/1', async (req, res) => {
  let resp = await microApp.request('foo.foo1', {body: {}})
  res.json(resp)
})

expressApp.get('/foo/2', async (req, res) => {
  let resp = await microApp.request('foo2.foo2', {
    body: {
      name: 'no-one'
    }
  })
  res.json(resp)
})

expressApp.listen(port, () => console.log(`Example app listening on port ${port}!`))
