const broker = require('../../broker') // Broker

const app = broker().createService({ name: 'bar' })

app.subscribe('bar', (req, res) => {
  res.send({
    msg: `SERVICE bar: Hi ${req.body.name || req.meta.serviceName}, This is bar!`,
  })
})

app.subscribe('bar.jihaa', (req, res) => {
  res.send({
    msg: 'SERVICE bar: jihaa 2',
  })
})

setTimeout(() => {
  console.log('SERVICE bar: send request to foo service (local request)')
  app.call('foo.foo', { data: 'secret' })
    .then((data) => console.log(data))
}, 1000)

module.exports = app
