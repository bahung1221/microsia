/* eslint-disable */
const broker = require('../../broker') // Broker

const app = broker().createService({ name: 'foo' })

function getRequesterName(req) {
  return req.body.name || req.meta.serviceName
}

// Middleware
function isRequestFromBar(req, res, next) {
  if (getRequesterName(req) !== 'bar') {
    res.send({
      msg: 'SERVICE foo: You aren\'t bar',
    })
  }
  next()
}

app.use((req, res, next) => {
  if (!getRequesterName(req)) {
    res.send({
      msg: 'SERVICE foo: Who are you?',
    })
  }
  next()
})

app.subscribe('foo', isRequestFromBar, (req, res, next) => {
  console.log(`SERVICE foo: received request from ${getRequesterName(req)}`)
  res.send({
    msg: `SERVICE foo: Hi ${getRequesterName(req)}, This is foo!`,
  })
  next()
})

app.subscribe('jihaa', (req, res) => {
  console.log(`SERVICE foo: received request from ${getRequesterName(req)}`)
  res.send({
    msg: 'SERVICE foo: jihaa',
  })
})
