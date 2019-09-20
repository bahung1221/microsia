const Broker = require('../../lib/broker') // Broker
const broker = Broker()
const app = broker.createService({ name: 'foo' })

app.use(function(req, res) {
  if (!req.body.name) {
    res.send({
      msg: 'Who are you?'
    })
  }
})

app.subscribe('foo1', isRequestFromBar, function(req, res) {
  res.send({
    msg: `Hi ${req.body.name}, This is foo!`
  })
})

app.subscribe('jihaa', function(req, res) {
  res.send({
    msg: 'jihaa'
  })
})

// Middleware
function isRequestFromBar(req, res) {
  if (req.body.name != 'bar') {
    res.send({
      msg: 'You aren\'t bar'
    })
  }
}
