# UNDER CONSTRUCTION

### Concept:
![Concept](https://i.imgur.com/U2NWxd5.jpg)

### Run example code:
Services using runner:
```
cd example
node index.js
```

ApiGateway using broker directly (without runner) and express:
```
cd example/gateway
node index.js
```

Make request to ApiGateway
```
curl -i -H "Accept: application/json" "http://localhost:3000/api/bar" 
```

### TODO:
- IncomingRequest class
- Handle request timeout
- Handle duplicate service name
- Api Gateway
- Streaming file
- Routing strategies
- Next() function in subscribe function
- Multi transporter in one broker (consider later)
- Serialize (protobuf, ...)
- Polish code
- Unit test
- Travis CI
