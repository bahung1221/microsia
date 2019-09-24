/* eslint-disable */
const broker = require('../../broker') // Broker

const service = broker().createService({ name: 'foo' })

function getRequesterName(req) {
  return req.body.name || req.meta.serviceName
}

// Middleware
function isRequestFromBar(ctx, next) {
  if (getRequesterName(ctx.req) !== 'bar') {
    ctx.res.send({
      msg: 'SERVICE foo: You aren\'t bar',
    })
  }
  next()
}

service.use((ctx, next) => {
  if (!getRequesterName(ctx.req)) {
    ctx.res.send({
      msg: 'SERVICE foo: Who are you?',
    })
  }
  next()
})

service.subscribe('foo', isRequestFromBar, async (ctx, next) => {
  console.log(`SERVICE foo: received request from ${getRequesterName(ctx.req)}`)
  console.log('SERVICE foo: re-request to bar service (local request) with ctx')
  await ctx.call('bar.bar')
  ctx.res.setStatus(304)
  ctx.res.send({
    msg: `SERVICE foo: Hi ${getRequesterName(ctx.req)}, This is foo!`,
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
