/* eslint-disable */
const broker = require('../../broker') // Broker

const service = broker().createService({ name: 'foo' })

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

service.use((req, res, next) => {
  if (!getRequesterName(req)) {
    res.send({
      msg: 'SERVICE foo: Who are you?',
    })
  }
  next()
})

service.subscribe('foo', isRequestFromBar, (req, res, next) => {
  console.log(`SERVICE foo: received request from ${getRequesterName(req)}`)
  res.setStatus(304)
  res.send({
    msg: `SERVICE foo: Hi ${getRequesterName(req)}, This is foo!`,
  })
  next()
})

service.subscribe('jihaa', (req, res) => {
  console.log(`SERVICE foo: received request from ${getRequesterName(req)}`)
  res.send({
    msg: 'SERVICE foo: jihaa',
  })
})

module.exports = service
