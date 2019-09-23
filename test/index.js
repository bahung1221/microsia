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
    assert.ok(Transporter.makeOutgoingRequest)
    assert.ok(Transporter.makeOutgoingResponse)
    assert.ok(Transporter.makeIncomingRequest)
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

  it('foo should receive message that was called from bar', async function() {
    foo.subscribe('test', function (req, res) {
      res.send({ msg: 'this is foo!' })
    })
    const res = await bar.call('foo.test')
    if (res.msg) {
      return Promise.resolve('OK')
    }
    return Promise.reject('Incorrect')
  })

  it('foo should receive modified message that was called from bar and modified by middleware', async function() {
    return new Promise((resolve, reject) => {
      function middleware(req, res, next) {
        req.body.msg = null
        next()
      }
      foo.subscribe('test', middleware, function (req, res) {
        if (req.body.msg === null) {
          return resolve('OK')
        }
        return reject('Incorrect')
      })

      bar.call('foo.test', { msg: 'this is bar' })
    })
  })

  it('foo should receive modified message that was called from bar and modified by middleware (app.use)', async function() {
    return new Promise((resolve, reject) => {
      function middleware(req, res, next) {
        req.body.msg = null
        next()
      }
      foo.use(middleware)
      foo.subscribe('test', function (req, res) {
        if (req.body.msg === null) {
          return resolve('OK')
        }
        return reject('Incorrect')
      })

      bar.call('foo.test', { msg: 'this is bar' })
    })
  })

  it('foo should receive modified message that was called from bar and modified by middleware (app.use)', async function() {
    return new Promise((resolve, reject) => {
      function middleware(req, res, next) {
        req.body.msg = null
        next()
      }
      foo.use('test', middleware)
      foo.subscribe('test', function (req, res) {
        if (req.body.msg === null) {
          return resolve('OK')
        }
        return reject('Incorrect')
      })

      bar.call('foo.test', { msg: 'this is bar' })
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
      const handler = (req, res) => {
        if (req.body.msg) {
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
      const handler = (req, res) => {
        if (req.body.msg) {
          return res.send({ msg: 'OK' })
        }
        res.send({ msg: null })
      }
      trans.subscribe('base.test', [handler])
      trans.request('base.test', { msg: 'test'}, {})
        .then(res => {
          if (res.msg) {
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
      const handler = (req, res) => {
        if (req.body.msg) {
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
      const handler = (req, res) => {
        if (req.body.msg) {
          return res.send({ msg: 'OK' })
        }
        res.send({ msg: null })
      }
      nats.subscribe('nats.test', [handler])
      nats.request('nats.test', { msg: 'test'}, {})
        .then(res => {
          if (res.msg) {
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
