const express = require('express')
const router = express.Router()
const NATS = require('nats')
const nats = NATS.connect({
  servers: ['nats://127.0.0.1:4222'],
})

console.log("Connected to " + nats.currentServer.url.host)

router.get('/foo', function(req, res, next) {
  let input = {
    body: {
      name: 'bar',
    },
    headers: req.headers,
    meta: {}
  }
  nats.requestOne('foo', JSON.stringify(input), {}, 1000, function(response) {
    // `NATS` is the library.
    if (response instanceof NATS.NatsError && response.code === NATS.REQ_TIMEOUT) {
      console.log('Request to foo timed out.')
      return
    }
    res.json(response)
  })
})

router.get('/foo1', function(req, res, next) {
  let input = {
    body: {
      name: 'fake-bar',
    },
    headers: req.headers,
    meta: {}
  }
  nats.requestOne('foo', JSON.stringify(input), {}, 1000, function(response) {
    // `NATS` is the library.
    if (response instanceof NATS.NatsError && response.code === NATS.REQ_TIMEOUT) {
      console.log('Request to foo timed out.')
      return
    }
    res.json(response)
  })
})

router.get('/foo2', function(req, res, next) {
  let input = {
    body: {},
    headers: req.headers,
    meta: {}
  }
  nats.requestOne('foo', JSON.stringify(input), {}, 1000, function(response) {
    // `NATS` is the library.
    if (response instanceof NATS.NatsError && response.code === NATS.REQ_TIMEOUT) {
      console.log('Request to foo timed out.')
      return
    }
    res.json(response)
  })
})

module.exports = router
