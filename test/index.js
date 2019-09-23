/* eslint-disable */
const assert = require('assert')
const broker = require('../broker')()

describe('Main methods', function() {
  it('Broker should have main methods :)', function() {
    assert.ok(broker.start)
    assert.ok(broker.createService)
    assert.ok(broker.subscribe)
    assert.ok(broker.publish)
    assert.ok(broker.request)
  })
})
