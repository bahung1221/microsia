const broker = require('../../broker') // Broker

const service = broker().createService({ name: 'bar' })

service.subscribe('bar', (ctx, next) => {
  ctx.res.send({
    msg: `SERVICE bar: Hi ${ctx.req.body.name || ctx.req.meta.serviceName}, This is bar!`,
  })
})

service.subscribe('bar.jihaa', (ctx, next) => {
  ctx.res.send({
    msg: 'SERVICE bar: jihaa 2',
  })
})

setTimeout(() => {
  console.log('SERVICE bar: send request to foo service (local request)')
  service.call('foo.foo', { data: 'secret' })
    .then((data) => console.log(data))
}, 1000)

module.exports = service
