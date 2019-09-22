const Broker = require('../../lib/broker') // Broker
const broker = Broker()
const app = broker.createService({ name: 'foo' })

app.use(function middleware(req, res, next) {
  if (!getRequesterName(req)) {
    res.send({
      msg: 'SERVICE foo: Who are you?',
    })
  }
  next()
})

app.subscribe('foo1', isRequestFromBar, function handler(req, res, next) {
  console.log('SERVICE foo: received request from ' + getRequesterName(req))
  res.send({
    msg: `SERVICE foo: Hi ${getRequesterName(req)}, This is foo!`,
  })
  next()
})

app.subscribe('jihaa', function(req, res) {
  console.log('SERVICE foo: received request from ' + getRequesterName(req))
  res.send({
    msg: 'SERVICE foo: jihaa',
  })
})

// Middleware
function isRequestFromBar(req, res, next) {
  if (getRequesterName(req) !== 'bar') {
    res.send({
      msg: 'SERVICE foo: You aren\'t bar',
    })
  }
  next()
}

function getRequesterName(req) {
  return req.body.name || req.meta.serviceName
}
