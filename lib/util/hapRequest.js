//

"use strict";

var extend = require('extend');
var URL = require('url');
var EventedHttpClient = require('./eventedHttpClient');
var debug = require('debug')('hapRequest');
var instances = {};

module.exports = hapRequest;

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
    if (instances[instance].connected) {
      instances[instance].request(options);
    } else {
      debug("Deleting unused connection");
      delete instances[instance];
      instances[instance] = new EventedHttpClient(options);
    }

  } else {
    // Create new HAP connection
    instances[instance] = new EventedHttpClient(options);
  }
  // return eventBus;
};
