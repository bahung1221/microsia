# UNDER CONSTRUCTION

### Concept:
![Concept](https://i.imgur.com/U2NWxd5.jpg)

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
- Middleware with route
- Handle duplicate service name
- Api Gateway
- Streaming file
- Next() function in subscribe function
- Circuit Breaker (inside broker)
- Nats authrorize
- Multi transporter in one broker (consider later)
- Serialize (protobuf, ...)
- Polish code
- Unit test & code coverage
- Travis CI
- Code analytics by codacy
