// Monkey patch before you require http for the first time.
const parser = require('./httpParser.js');
var URL = require('url');
var debug = require('debug')('EventedHttpClient');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
const net = require('net');

module.exports = eventedHttpClient;

inherits(eventedHttpClient, EventEmitter);

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
      // debug("res", res);
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
          this.emit('hapEvent', res, res.body);
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
  var instance = URL.parse(request.url);
  var message;
  this.callback = request.callback;
  // debug("Callback", request.callback);
  if (request.body) {
    message = request.method + ' ' + instance.pathname + ' HTTP/1.1\r\nHost: ' + instance.host + '\r\n' + headersToString(request.headers) + 'Content-Length: ' + request.body.length + '\r\n\r\n' + request.body + '\r\n';
  } else {
    message = request.method + ' ' + instance.pathname + ' HTTP/1.1\r\nHost: ' + instance.host + '\r\n' + headersToString(request.headers) + '\r\n';
  }
  // debug("Message %s:%s ->", this.client.remoteAddress, this.client.remotePort, message);
  this.client.write(message + '\r\n');
};
