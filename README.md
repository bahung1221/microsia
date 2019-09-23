# UNDER CONSTRUCTION
This library is under construction, so use at your own risk

### Why microsia?
Microsia is lightweight microservice server with simple, familiar syntax that was inspired by [koa](https://github.com/koajs/koa) and [express](https://github.com/expressjs/express),
allow you create transport layer for microservice as quick as possible.

Currently, microsia is building around [nats](https://github.com/nats-io/nats-server) as central messaging system.
Microsia also has local pubsub system, that allow services on same server communicate with each other fastest without remote messaging system (nats).


### Concept:
![Concept](https://i.imgur.com/U2NWxd5.jpg)

### Usages:
Install package
```
npm install --save microsia
# OR
yarn add microsia
```

Sample service `services/bar.js`:
```javascript
const broker = require('microsia/broker') // Broker
const app = broker().createService({ name: 'bar' })

app.use(function (req, res, next) {
  console.log('bar was called')
  next()
})

app.subscribe('bar', function(req, res) {
  res.send({
    msg: `SERVICE bar: Hi, This is bar!`,
  })
})

app.request('foo.foo', {})
    .then(data => console.log(data))
```

Run group services with service runner:
```javascript
const loadServices = require('microsia/runner')

// Service path
const services = [
  'services/foo.js',
  'services/bar.js',
]
const options = {
  transporter: 'nats',
  transporterOptions: {
    servers: ['nats://128.199.190.68:4222'],
    timeout: 3000,
    pingInterval: 120000,
    reconnect: true,
    reconnectTimeWait: 2000,
    maxReconnectAttempts: 10,
    maxRequestRetryAttempts: 3,
  },
}

loadServices(options, services)
```

You also can run only one service directly by `node`,
just pass config to `Broker()` and then run `node services/bar.js`:
```javascript
const broker = require('microsia/broker')
const app = broker({
  transporter: 'nats',
  transporterOptions: {
    servers: ['nats://128.199.190.68:4222'],
    timeout: 3000,
  },
}).createService({ name: 'bar' })

...
```

Please see example code in `example` folder for more information.

### Run example code:
Internal Services using runner:
```
cd example
node index.js
```

ApiGateway using broker directly and using express as http server:
```
cd example/gateway
yarn
node index.js
```

Make request to ApiGateway
```
curl -i -H "Accept: application/json" "http://localhost:3000/api/bar" 
```

### TODO:
- Api Gateway
- Group route
- Middleware with route
- Streaming file
- Circuit Breaker (inside broker)
- Nats authrorize
- Serialize (protobuf, ...)
- Polish code
- Unit test & code coverage
- Travis CI
- Code analytics by codacy
- Benchmark
- Optimize
- Kafka transporter
- Multi transporter in one broker (consider later)
