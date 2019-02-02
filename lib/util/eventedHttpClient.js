// Monkey patch before you require http for the first time.
const parser = require('./httpParser.js');
var URL = require('url');
// var debug = require('debug')('EventedHttpClient');
const net = require('net');

module.exports = eventedHttpClient;

function eventedHttpClient(request) {
  // console.log("INIT", request);
  var context = URL.parse(request.url);
  var buffer = [];
  this.connected = false;
  this.chunked = false;
  this.callback = request.callback;
  this.client = net.createConnection({
    host: context.hostname,
    port: context.port
  }, () => {
    this.connected = true;
    this.client.write(buildMessage(request));
  });

  this.client.on('data', (data) => {
    // If in the middle of a chunked response
    var response;
    if (this.chunked) {
      if (data.slice(-7).toString() !== '\r\n0\r\n\r\n') {
        // console.log("Chunked");
        buffer.push(data);
      } else {
        // Last chunked message
        this.chunked = false;
        buffer.push(data);
        response = parser(Buffer.concat(buffer));
        if (response.statusCode !== 200 && response.statusCode !== 207) {
          this.callback(new Error("Error"));
        }
        buffer = [];
        // debug("Callback-1", response.body);
        this.callback(null, response, response.body);
      }
    } else {
      // Handle regular messages
      response = parser(data);
      // debug("res", data.toString());
      if (response.headers['Transfer-Encoding'] && response.headers['Transfer-Encoding'].toLowerCase() === 'chunked' && data.slice(-7).toString() !== '\r\n0\r\n\r\n') {
        this.chunked = true;
        buffer.push(data);
      } else {
        if (response.statusCode !== 200 && response.statusCode !== 207) {
          this.callback(new Error("Error"));
        }
        if (response.protocol === 'EVENT') {
          sendHapEvent(request, response, context);
        } else {
          this.callback(null, response, response.body);
          // debug("Callback-2", response.body);
        }
      }
    }
  });

  this.client.on('end', () => {
    this.connected = false;
    console.log('disconnected from server', context.host);
  });
}

function sendHapEvent(request, response) {
  // Event messages are never the result of a callback
  var context = URL.parse(request.url);
  response.url = 'http://' + context.hostname + ':' + context.port + '/';
  if (request.eventBus) {
    // debug("EVENT", data.toString());
    var url = URL.parse(response.url);

    response.body.characteristics.forEach(function(key, element) {
      // debug("char", key, element);
      var event = {
        'host': url.hostname,
        'port': parseInt(url.port),
        'aid': key.aid,
        'iid': key.iid,
        'status': key.value
      };
      request.eventBus.emit('hapEvent', event);
    });
    // request.eventBus.emit('hapEvent', res, response.body);
  }
}

function headersToString(headers) {
  var response = "";

  for (var header in headers) {
    response = response + header + ': ' + headers[header] + '\r\n';
  }
  return (response);
}

eventedHttpClient.prototype.request = function(request) {
  // debug("Request", request);
  this.callback = request.callback;
  this.client.write(buildMessage(request));
};

function buildMessage(request) {
  var context = URL.parse(request.url);
  var message;

  message = request.method + ' ' + context.pathname;
  if (context.search) {
    message = message + context.search;
  }
  message = message + ' HTTP/1.1\r\nHost: ' + context.host + '\r\n' + headersToString(request.headers);
  if (request.body) {
    message = message + 'Content-Length: ' + request.body.length + '\r\n\r\n' + request.body + '\r\n\r\n';
  } else {
    message = message + '\r\n\r\n';
  }
  // debug("Message ->", message);
  return (message);
}
