const express = require('express')
const app = express()
const port = 3000
const broker = require('../broker') // Broker
const nats = require('../transporter/nats') // Transporter, manual import for lighter

broker.start(nats, {
  name: 'gateway',
  servers: ['nats://127.0.0.1:4222']
})

app.get('/foo/1', async (req, res) => {
  let resp = await broker.request('foo.foo1', {body: {}})
  res.json(resp)
})

app.get('/foo/2', async (req, res) => {
  let resp = await broker.request('foo.jihaa', {
    body: {
      name: 'no-one'
    }
  })
  res.json(resp)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
