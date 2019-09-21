const Broker = require('../../lib/broker') // Broker
const broker = Broker()
const app = broker.createService({ name: 'foo' })

app.use(function(req, res) {
  if (!getRequesterName(req)) {
    res.send({
      msg: 'SERVICE foo: Who are you?',
    })
  }
})

app.subscribe('foo', isRequestFromBar, function(req, res) {
  console.log('SERVICE foo: received request from ' + getRequesterName(req))
  res.send({
    msg: `SERVICE foo: Hi ${getRequesterName(req)}, This is foo!`,
  })
})

app.subscribe('jihaa', function(req, res) {
  console.log('SERVICE foo: received request from ' + getRequesterName(req))
  res.send({
    msg: 'SERVICE foo: jihaa',
  })
})

// Middleware
function isRequestFromBar(req, res) {
  if (getRequesterName(req) !== 'bar') {
    res.send({
      msg: 'SERVICE foo: You aren\'t bar',
    })
  }
}

function getRequesterName(req) {
  return req.body.name || req.headers.serviceName
}
