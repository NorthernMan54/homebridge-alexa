var request = require('request');
var debug = require('debug')('Discovery');

var pin;

var host = process.argv[2];
var port = 51826;

console.log("Request",host,port);

request({
  method: 'GET',
  url: 'http://' + host + ':' + port + '/accessories',
  timeout: 10000,
  json: true,
  headers: {
    "Content-Type": "Application/json",
    "authorization": pin,
    "connection": "keep-alive",
  },
}, function(err, response, body) {
  // Response s/b 200 OK
  if (err || response.statusCode != 200) {
    if (err) {
      debug("HAP Discover failed http://%s:%s error %s", host, port, err.code);
    } else {
      // Status code = 401 = homebridge not running in insecure mode
      debug("HAP Discover failed http://%s:%s error code %s", host, port, response.statusCode);
      err = new Error("Http Err", response.statusCode);
    }
    callback(err);
  } else {
    console.log("RESPONSE",body,Object.keys(body.accessories).length);
    if (Object.keys(body.accessories).length > 0) {

    } else {
      debug("Short json data received http://%s:%s", host, port, JSON.stringify(body));
      callback(new Error("Short json data receivedh http://%s:%s", host, port));
    }
  }
});
