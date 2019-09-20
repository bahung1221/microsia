const Broker = require('../../lib/broker') // Broker
const broker = Broker()
const app = broker.createService({ name: 'foo2' })

app.use(function(req, res) {
  if (!req.body.name) {
    res.send({
      msg: 'Who are you?'
    })
  }
})

app.subscribe('foo2', isRequestFromBar, function(req, res) {
  res.send({
    msg: `Hi ${req.body.name}, This is foo2!`
  })
})

app.subscribe('jihaa', function(req, res) {
  res.send({
    msg: 'jihaa 2'
  })
})

setTimeout(() => {
  app.request('foo.foo1', {body: {}})
    .then(data => console.log(data))
}, 1000)

// Middleware
function isRequestFromBar(req, res) {
  if (req.body.name != 'bar') {
    res.send({
      msg: 'You aren\'t bar'
    })
  }
}
