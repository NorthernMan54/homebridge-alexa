// Monkey patch before you require http for the first time.
const parser = require('./httpParser.js');
var URL = require('url');
var querystring = require('querystring');
var debug = require('debug')('EventedHttpClient');
const net = require('net');

module.exports = eventedHttpClient;

function eventedHttpClient(request) {
  // console.log("INIT", request);
  var instance = URL.parse(request.url);
  var buffer = [];
  this.chunked = false;
  this.callback = request.callback;
  this.client = net.createConnection({
    host: instance.hostname,
    port: instance.port
  }, () => {
    // 'connect' listener
    debug('INIT: Connected to server!', instance.host);
    // console.log("Request", request);
    // console.log("Request", JSON.stringify(request.headers));
    var message = request.method + ' ' + instance.pathname + ' HTTP/1.1\r\nHost: ' + instance.host + '\r\n' + headersToString(request.headers);
    // console.log("Message", message);
    this.client.write(message + '\r\n');
  });

  this.client.on('data', (data) => {
    // debug("Data", data.toString());
    // If in the middle of a chunked response
    if (this.chunked) {
      if (data.slice(-7).toString() !== '\r\n0\r\n\r\n') {
        // console.log("Chunked");
        buffer.push(data);
      } else {
        // Last chunked message
        this.chunked = false;
        buffer.push(data);
        var res = parser(Buffer.concat(buffer));
        if (res.statusCode !== 200 && res.statusCode !== 207) {
          this.callback(new Error("Error"));
        }
        buffer = [];
        // debug("Callback-1", res.body);
        this.callback(null, res, res.body);
      }
    } else {
      // Handle regular messages
      var res = parser(data);
      // debug("res", data.toString());
      if (res.headers['Transfer-Encoding'] && res.headers['Transfer-Encoding'].toLowerCase() === 'chunked' && data.slice(-7).toString() !== '\r\n0\r\n\r\n') {
        this.chunked = true;
        buffer.push(data);
      } else {
        if (res.statusCode !== 200 && res.statusCode !== 207) {
          this.callback(new Error("Error"));
        }
        if (res.protocol === 'EVENT') {
          // Event messages are never the result of a callback
          res.url = 'http://' + instance.hostname + ':' + instance.port + '/';
          // debug("EVENT", data.toString());
          // debug("hapEvent", res, res.body);
          if (request.eventBus) {
            // debug("EVENT", data.toString());
            var url = URL.parse(res.url);

            res.body.characteristics.forEach(function(key, element) {
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
            // request.eventBus.emit('hapEvent', res, res.body);
          }
        } else {
          this.callback(null, res, res.body);
          // debug("Callback-2", res.body);
        }
      }
    }
  });

  this.client.on('end', () => {
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

eventedHttpClient.prototype.request = function(request) {
  // debug("Request", request);
  this.callback = request.callback;
  this.client.write(buildMessage(request));
};

function buildMessage(request) {
  var instance = URL.parse(request.url);
  var message;

  message = request.method + ' ' + instance.pathname;
  if (instance.search) {
    message = message + instance.search;
  }
  message = message + ' HTTP/1.1\r\nHost: ' + instance.host + '\r\n' + headersToString(request.headers);
  if (request.body) {
    message = message + 'Content-Length: ' + request.body.length + '\r\n\r\n' + request.body + '\r\n\r\n';
  } else {
    message = message + '\r\n\r\n';
  }
  // debug("Message ->", message);
  return (message);
}
