const broker = require('../lib/broker') // Broker
const nats = require('../lib/transporter/nats') // Transporter, manual import for lighter

broker.start(nats, {
  name: 'foo',
  servers: ['nats://127.0.0.1:4222']
})

broker.use(function(req, res) {
  if (!req.body.name) {
    res.send({
      msg: 'Who are you?'
    })
  }
})

broker.subscribe('foo1', isRequestFromBar, function(req, res) {
  res.send({
    msg: `Hi ${req.body.name}, This is foo!`
  })
})

broker.subscribe('jihaa', function(req, res) {
  res.send({
    msg: 'jihaa'
  })
})

// Middleware
function isRequestFromBar(req, res) {
  if (req.body.name != 'bar') {
    res({
      msg: 'You aren\'t bar'
    })
  }
}
