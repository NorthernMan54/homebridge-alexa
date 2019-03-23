// Monkey patch before you require http for the first time.
const parser = require('../lib/httpParser.js');

const net = require('net');
const client = net.createConnection({
  port: 51826
}, () => {
  // 'connect' listener
  console.log('connected to server!');
  client.write('PUT /accessories HTTP/1.1\r\nHost: 127.0.0.1:51826\r\nUser-Agent: curl/7.54.0\r\nAccept: */*\r\nContent-Type:Application/json\r\nauthorization: 031-45-154\r\n\r\n');
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

client.on('end', () => {
  console.log('disconnected from server');
});
