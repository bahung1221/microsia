const Broker = require('../../lib/broker') // Broker
const broker = Broker()
const app = broker.createService({ name: 'bar' })

app.subscribe('bar', function(req, res) {
  res.send({
    msg: `SERVICE foo2: Hi ${req.body.name || req.meta.serviceName}, This is bar!`,
  })
})

app.subscribe('bar.jihaa', function(req, res) {
  res.send({
    msg: 'SERVICE bar: jihaa 2',
  })
})

setTimeout(() => {
  console.log('SERVICE bar: send request to foo service (local request)')
  app.request('foo.foo', {})
    .then(data => console.log(data))
}, 1000)
