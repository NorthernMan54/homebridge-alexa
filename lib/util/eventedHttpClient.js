// Monkey patch before you require http for the first time.
const parser = require('./httpParser.js');
var URL = require('url');

module.exports = eventedHttpClient;

const net = require('net');
var client;
var options;

// setInterval(sendEvent, 10 * 1000); // 10 uncertaintyInMilliseconds

setTimeout(registerEvent, 3 * 1000); // 10 uncertaintyInMilliseconds

function sendEvent() {
  client.write('PUT /accessories HTTP/1.1\r\nHost: 127.0.01:51826\r\n\r\n');
}

var register = {
  "characteristics": [{
    "aid": 4,
    "iid": 10,
    "ev": true
  },
  {
    "aid": 5,
    "iid": 10,
    "ev": true
  }]
};

function registerEvent() {
  var message = 'PUT /characteristics HTTP/1.1\r\nHost: 127.0.0.1:51826\r\nContent-Type: Application/hap+json\r\nContent-Length: ' + JSON.stringify(register).length + '\r\nauthorization: 031-45-154\r\n\r\n' + JSON.stringify(register) + '\r\n\r\n';
  // console.log("Message", message);
  client.write(message);
}


function eventedHttpClient(request) {
  // console.log("INIT", request);
  var instance = URL.parse(request.url);
  client = net.createConnection({
    host: instance.hostname,
    port: instance.port
  }, () => {
    // 'connect' listener
    console.log('INIT: connected to server!', instance.host);
    // console.log("Request", request);
    // console.log("Request", JSON.stringify(request.headers));
    var message = request.method + ' ' + instance.pathname + ' HTTP/1.1\r\nHost: ' + instance.host + '\r\n' + headersToString(request.headers);
    // console.log("Message", message);
    client.write(message);
  });

  client.on('data', (data) => {
    var res = parser(data);

    // console.log('Orig ->', data.toString(), res);
    // console.log(ret.headers['Content-Type']);
    if (res.statusCode !== 200 && res.statusCode !== 207) {
      console.log("Error", res.statusCode, data.toString(), res);
    }

    console.log("Response", res.statusCode, res.body);
  });

  client.on('end', () => {
    console.log('disconnected from server', instance.host);
  });
}

function headersToString(headers) {
  var response = "";

  for (var header in headers) {
    response = response + header + ': ' + headers[header] + '\r\n';
  }
  return (response);
}
