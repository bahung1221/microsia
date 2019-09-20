# UNDER CONSTRUCTION

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
curl -i -H "Accept: application/json" "http://localhost:3000/foo/1" 
```

### TODO:
- Streaming file
- Next() function in subscribe function
- Extendable service
- Multi transporter in one broker (consider later)
- Serialize (protobuf, ...)
- Polish code
- Unit test
- Travis CI
