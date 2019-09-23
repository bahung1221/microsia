/* eslint-disable */
const assert = require('assert')
const Transporter = require('../lib/transporter/base')
const broker = require('../broker')({
  transporter: 'nats',
  transporterOptions: {
    servers: ['nats://demo.nats.io:4222'],
    timeout: 3000,
    pingInterval: 120000,
    reconnect: true,
    reconnectTimeWait: 2000,
    maxReconnectAttempts: 10,
    maxRequestRetryAttempts: 3,
  },
})
const app = broker.createService({ name: 'foo' })

describe('Main methods', function() {
  it('Broker should have main methods :)', function() {
    assert.ok(broker.start)
    assert.ok(broker.createService)
    assert.ok(broker.subscribe)
    assert.ok(broker.publish)
    assert.ok(broker.request)
  })

  it('Service should have main methods :)', function() {
    assert.ok(app.use)
    assert.ok(app.subscribe)
    assert.ok(app.publish)
    assert.ok(app.request)
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
})
