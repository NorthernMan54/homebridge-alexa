//

"use strict";

var extend = require('extend');
var URL = require('url');
var EventEmitter = require('events').EventEmitter;
var EventedHttpClient = require('./eventedHttpClient');
var debug = require('debug')('hapRequest');
var instances = {};

module.exports = hapRequest;

var eventBus = new EventEmitter();

// organize params for patch, post, put, head, del
function initParams(uri, options, callback) {
  if (typeof options === 'function') {
    callback = options;
  }

  var params = {};
  if (options !== null && typeof options === 'object') {
    extend(params, options, {
      uri: uri
    });
  } else if (typeof uri === 'string') {
    extend(params, {
      uri: uri
    });
  } else {
    extend(params, uri);
  }

  params.callback = callback || params.callback;
  return params;
}

function hapRequest(uri, options, callback) {
  // debug("THIS", options.events);
  if (typeof uri === 'undefined') {
    throw new Error('undefined is not a valid uri or options object.');
  }

  var params = initParams(uri, options, callback);

  if (params.method === 'HEAD' && paramsHaveRequestBody(params)) {
    throw new Error('HTTP HEAD requests MUST NOT include a request body.');
  }

  return new hapRequest.Request(params);
}

// Helper functions

function paramsHaveRequestBody(params) {
  return (
    params.body ||
    params.requestBodyStream ||
    (params.json && typeof params.json !== 'boolean') ||
    params.multipart
  );
}

hapRequest.Request = function(options) {
  var instance = URL.parse(options.url).host;
  if (instances[instance]) {
    // reuse existing HAP connection
    instances[instance].request(options);
  } else {
    // Create new HAP connection
    instances[instance] = new EventedHttpClient(options);
    // Pass events up stream
    instances[instance].on('hapEvent', function(res, body) {
      var url = URL.parse(res.url);

      body.characteristics.forEach(function(key, element) {
        // debug("char", key, element);
        var event = {
          'host': url.hostname,
          'port': parseInt(url.port),
          'aid': key.aid,
          'iid': key.iid,
          'status': key.value
        };
        eventBus.emit('hapEvent', event);
      });
    });
  }
  return eventBus;
};
