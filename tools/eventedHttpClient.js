// Monkey patch before you require http for the first time.
const parser = require('http-message-parser');

const net = require('net');
const client = net.createConnection({
  port: 51826
}, () => {
  // 'connect' listener
  console.log('connected to server!');
  client.write('PUT /accessories HTTP/1.1\r\nHost: 127.0.01:51826\r\nUser-Agent: curl/7.54.0\r\nAccept: */*\r\nContent-Type:Application/json\r\nauthorization: 031-45-154\r\n\r\n');
});
client.on('data', (data) => {
  var ret = parser(data);

  // console.log('Orig ->', data.toString());
  console.log("Body ->", JSON.parse(ret.body));
  // client.end();
});

setInterval(sendEvent, 10 * 1000); // 10 uncertaintyInMilliseconds

function sendEvent() {
  client.write('PUT /accessories HTTP/1.1\r\nHost: 127.0.01:51826\r\n\r\n');
}

client.on('end', () => {
  console.log('disconnected from server');
});
