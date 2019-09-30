/* eslint-disable */
const assert = require('assert')
const Transporter = require('../lib/transporter/base')
const NatsTransporter = require('../lib/transporter/nats')

const configs = {
  transporter: {
    name: 'nats',
    options: {
      servers: ['nats://demo.nats.io:4222'],
      timeout: 3000,
      pingInterval: 120000,
      reconnect: true,
      reconnectTimeWait: 2000,
      maxReconnectAttempts: 10,
      maxRequestRetryAttempts: 3,
    },
  },
}
const broker = require('../broker')(configs)
const foo = broker.createService({ name: 'foo' })
const bar = broker.createService({ name: 'bar' })

describe('#Main methods and init', function() {
  it('Broker should have main methods :)', function() {
    assert.ok(broker.start)
    assert.ok(broker.createService)
    assert.ok(broker.subscribe)
    assert.ok(broker.publish)
    assert.ok(broker.call)
  })

  it('Service should have main methods :)', function() {
    assert.ok(foo.use)
    assert.ok(foo.subscribe)
    assert.ok(foo.publish)
    assert.ok(foo.call)
  })

  it('Local transporter should have main methods :)', function() {
    assert.ok(Transporter.createOutgoingRequest)
    assert.ok(broker.localTransporter.handleImcomingRequest)
    assert.ok(broker.localTransporter.funcCompose)
    assert.ok(broker.localTransporter.connect)
    assert.ok(broker.localTransporter.disconnect)
    assert.ok(broker.localTransporter.subscribe)
    assert.ok(broker.localTransporter.publish)
  })

  it('Nats transporter should have main methods :)', function() {
    assert.ok(broker.transporter.connect)
    assert.ok(broker.transporter.disconnect)
    assert.ok(broker.transporter.subscribe)
    assert.ok(broker.transporter.publish)
  })

  it('Broker should throw "duplicate name" error', async function() {
    try {
      broker.createService({ name: 'foo' })
      return Promise.reject('Incorrect')
    } catch (e) {
      return Promise.resolve('OK')
    }
  })
})

describe('#Local communicate', function() {
  it('foo should receive message that was published from bar', async function() {
    return new Promise((resolve, reject) => {
      foo.subscribe('test', function (req, res) {
        resolve('OK')
      })
      bar.publish('foo.test')

      setTimeout(() => {
        reject('Timed out')
      }, 3000)
    })
  })

  it('foo should response message back to bar', async function() {
    foo.subscribe('test1', function (ctx) {
      ctx.res.send({ msg: 'this is foo!' })
    })
    const res = await bar.call('foo.test1')
    if (res.body.msg) {
      return Promise.resolve('OK')
    }
    return Promise.reject('Incorrect')
  })

  it('foo should response status 200 back to bar', async function() {
    foo.subscribe('test2', function (ctx) {
      ctx.res.send({ msg: 'this is foo!' })
    })
    const res = await bar.call('foo.test2', {})
    if (res.status === 200) {
      return Promise.resolve('OK')
    }
    return Promise.reject('Incorrect')
  })

  it('foo should response status 304 back to bar', async function() {
    foo.subscribe('test3', function (ctx) {
      ctx.res.setStatus(304)
      ctx.res.send({ msg: 'this is foo!' })
    })
    const res = await bar.call('foo.test3', {})
    if (res.status === 304) {
      return Promise.resolve('OK')
    }
    return Promise.reject('Incorrect')
  })

  it('foo should response header back to bar', async function() {
    foo.subscribe('test4', function (ctx) {
      ctx.res.setHeader('status', 'ok')
      ctx.res.send({ msg: 'this is foo!' })
    })
    const res = await bar.call('foo.test4', {})
    if (res.headers.status === 'ok') {
      return Promise.resolve('OK')
    }
    return Promise.reject('Incorrect')
  })

  it('foo should response header back to bar', async function() {
    foo.subscribe('test5', function (ctx) {
      ctx.res.setHeader({
        status: 'ok'
      })
      ctx.res.send({ msg: 'this is foo!' })
    })
    const res = await bar.call('foo.test5', {})
    if (res.headers.status === 'ok') {
      return Promise.resolve('OK')
    }
    return Promise.reject('Incorrect')
  })

  it('foo should receive modified message that was called from bar and modified by middleware', async function() {
    return new Promise((resolve, reject) => {
      function middleware(ctx, next) {
        ctx.req.body.msg = null
        next()
      }
      foo.subscribe('test6', middleware, function (ctx) {
        if (ctx.req.body.msg === null) {
          ctx.res.send('OK')
          return resolve('OK')
        }
        return reject('Incorrect')
      })

      bar.call('foo.test6', { msg: 'this is bar' })
    })
  })

  it('foo should receive modified message that was called from bar and modified by middleware (app.use)', async function() {
    return new Promise((resolve, reject) => {
      function middleware(ctx, next) {
        ctx.req.body.msg = null
        next()
      }
      foo.use(middleware)
      foo.subscribe('test7', function (ctx) {
        if (ctx.req.body.msg === null) {
          ctx.res.send('OK')
          return resolve('OK')
        }
        return reject('Incorrect')
      })

      bar.call('foo.test7', { msg: 'this is bar' })
    })
  })

  it('foo should receive when call by ctx', async function() {
    return new Promise((resolve, reject) => {
      bar.subscribe('test8', function (ctx) {
        ctx.res.send('OK')
      })
      foo.subscribe('test8', async function (ctx) {
        const res = await ctx.call('bar.test8')
        if (res.body === 'OK') {
          ctx.res.send('OK')
          return resolve('OK')
        }
        return reject('Incorrect')
      })

      bar.call('foo.test8', { msg: 'this is bar' })
    })
  })

  it('foo should receive modified message that was called from bar and modified by middleware (app.use)', async function() {
    return new Promise((resolve, reject) => {
      foo.use(function (ctx, next) {
        ctx.req.body.msg = null
        next()
      })
      foo.subscribe('test9', function (ctx) {
        if (ctx.req.body.msg === null) {
          ctx.res.send('OK')
          return resolve('OK')
        }
        return reject('Incorrect')
      })

      bar.call('foo.test9', { msg: 'this is bar' })
    })
  })

  it('foo should throw error by incorrect middleware (app.use)', async function() {
    try {
      foo.use()
      return Promise.reject('Incorrect')
    } catch (e) {
      return Promise.resolve('OK')
    }
  })
})

describe('#base transporter', function() {
  const trans = new Transporter(configs.transporter.options)

  it('Should received local message', async function() {
    return new Promise((resolve, reject) => {
      const handler = (ctx) => {
        if (ctx.req.body.msg) {
          return resolve('OK')
        }
        return reject('Incorrect')
      }
      trans.subscribe('base.test', [handler])
      trans.publish('base.test', { msg: 'test'}, {})
    })
  })

  it('Should received local message and sent response back to caller', async function() {
    return new Promise((resolve, reject) => {
      const handler = (ctx) => {
        if (ctx.req.body.msg) {
          return ctx.res.send({ msg: 'OK' })
        }
        ctx.res.send({ msg: null })
      }
      trans.subscribe('base.test', [handler])
      trans.request('base.test', { msg: 'test'}, {})
        .then(res => {
          if (res.body.msg) {
            return resolve('OK')
          }
          return reject('Incorrect')
        })
    })
  })

  it('Should throw error when call to incorrect subject', async function() {
    this.timeout(13000) // Retry 3 time => 4 * 3000 = 12000

    try {
      await trans.request('base.noone', { msg: 'test'}, {})
      return Promise.reject('Incorrect')
    } catch (e) {
      return Promise.resolve('OK')
    }
  })

  it('Should throw error when pass incorrect middleware to funcCompose', async function() {
    try {
      await trans.funcCompose(function() {})
      return Promise.reject('Incorrect')
    } catch (e) {
      return Promise.resolve('OK')
    }
  })

  it('Should throw error when pass incorrect middleware array to funcCompose', async function() {
    try {
      await trans.funcCompose(['not-a-function'])
      return Promise.reject('Incorrect')
    } catch (e) {
      return Promise.resolve('OK')
    }
  })
})

describe('#Nats transporter', function() {
  const nats = new NatsTransporter(configs.transporter.options)
  nats.connect()

  it('Should received nats message', async function() {
    return new Promise((resolve, reject) => {
      const handler = (ctx) => {
        if (ctx.req.body.msg) {
          return resolve('OK')
        }
        return reject('Incorrect')
      }
      nats.subscribe('nats.test', [handler])
      nats.publish('nats.test', { msg: 'test'}, {})
    })
  })

  it('Should received nats message and sent response back to caller', async function() {
    return new Promise((resolve, reject) => {
      const handler = (ctx) => {
        if (ctx.req.body.msg) {
          return ctx.res.send({ msg: 'OK' })
        }
        ctx.res.send({ msg: null })
      }
      nats.subscribe('nats.test', [handler])
      nats.request('nats.test', { msg: 'test'}, {})
        .then(res => {
          if (res.body.msg) {
            return resolve('OK')
          }
          return reject('Incorrect')
        })
    })
  })

  it('Should throw error when call to incorrect subject', async function() {
    this.timeout(13000) // Retry 3 time => 4 * 3000 = 12000

    try {
      await nats.request('nats.noone', { msg: 'test'}, {})
      return Promise.reject('Incorrect')
    } catch (e) {
      return Promise.resolve('OK')
    }
  })

  it('Should disconnect without error', async function() {
    try {
      await nats.disconnect()
      if (!nats.client) {
        return Promise.resolve('OK')
      }
      return Promise.reject('Incorrect')
    } catch (e) {
      return Promise.reject('Incorrect')
    }
  })
})
