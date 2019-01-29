//

'use strict';

var extend = require('extend');
var EventedHttpClient = require('./util/eventedHttpClient');
var URL = require('url');

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
  // console.log("Options", options);

  var instance = URL.parse(options.url).host;
  // console.log("Instance", instance);
  if (instances[instance]) {
    instances[instance].request(options);
  } else {
    instances[instance] = new EventedHttpClient(options);
  }
};
