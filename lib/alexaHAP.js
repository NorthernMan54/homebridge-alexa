"use strict";

var request = require('./util/hapRequest.js');
var debug = require('debug')('alexaHAP');
var bonjour = require('bonjour')();
var ip = require('ip');

var discovered = [];
var pin, refresh, browser, eventBus;

module.exports = {
  init: init,
  HAPs: HAPs,
  HAPcontrol: HAPcontrol,
  HAPstatus: HAPstatus,
  registerEvents: registerEvents
};

function init(options) {
  pin = options.pin;
  refresh = options.refresh;

  _discovery();
  setInterval(_discovery.bind(this), refresh * 1000);
  eventBus = options.eventBus;
}

function _discovery() {
  debug("Starting Homebridge instance discovery");
  discovered = [];
  try {
    browser = bonjour.find({
      type: 'hap'
    }, function(instance) {
      // debug('Found an HAP server:', instance);
      debug("HAP Device discovered", instance.txt.md, instance.addresses);
      var ipAddress;
      for (let address of instance.addresses) {
        if (ip.isV4Format(address)) {
          ipAddress = address;
          break;
        }
      }

      debug("HAP instance address: %s -> %s -> %s", instance.txt.md, instance.host, ipAddress);
      _getAccessories(ipAddress, instance, function(err, data) {
        if (!err) {
          debug("Homebridge instance discovered %s with %s accessories", instance.name, Object.keys(data.accessories.accessories).length);
          if (Object.keys(data.accessories.accessories).length > 0) {
            discovered.push(data);
          }
        } else {
          // Error, no data
        }
      });
    });

    setTimeout(_discoveryEnd.bind(this), 10 * 1000); // End discover after 55 seconds
  } catch (ex) {
    handleError(ex);
  }
}

function _discoveryEnd() {
  debug("Ending Homebridge instance discovery");
  eventBus.emit('Ready');
  browser.stop();
}

function HAPs(callback) {
  // This is a callback as in the future may need to call something
  callback(discovered);
}

// curl -X PUT http://127.0.0.1:51826/characteristics --header "Content-Type:Application/json"
// --header "authorization: 031-45-154" --data "{ \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"

function HAPcontrol(ipAddress, port, body, callback) {
  request({
    eventBus: eventBus,
    method: 'PUT',
    url: 'http://' + ipAddress + ':' + port + '/characteristics',
    timeout: 7000,
    maxAttempts: 1, // (default) try 5 times
    headers: {
      "Content-Type": "Application/json",
      "authorization": pin,
      "connection": "keep-alive"
    },
    body: body
  }, function(err, response) {
    // Response s/b 200 OK

    if (err) {
      debug("Homebridge Control failed %s:%s", ipAddress, port, body, err);
      callback(err);
    } else if (response.statusCode !== 207) {
      if (response.statusCode === 401) {
        debug("Homebridge auth failed, invalid PIN %s %s:%s", pin, ipAddress, port, body, err, response.body);
        callback(new Error("Homebridge auth failed, invalid PIN " + pin));
      } else {
        debug("Homebridge Control failed %s:%s Status: %s ", ipAddress, port, response.statusCode, body, err, response.body);
        callback(new Error("Homebridge control failed"));
      }
    } else {
      var rsp;

      try {
        rsp = response.body;
      } catch (ex) {
        debug("Homebridge Response Failed %s:%s", ipAddress, port, response.statusCode, response.statusMessage);
        debug("Homebridge Response Failed %s:%s", ipAddress, port, response.body, ex);

        callback(new Error(ex));
      }
      callback(null, rsp);
    }
  });
}

function HAPstatus(ipAddress, port, body, callback) {
  request({
    eventBus: eventBus,
    method: 'GET',
    url: 'http://' + ipAddress + ':' + port + '/characteristics' + body,
    timeout: 7000,
    maxAttempts: 1, // (default) try 5 times
    headers: {
      "Content-Type": "Application/json",
      "authorization": pin,
      "connection": "keep-alive"
    }
  }, function(err, response) {
    // Response s/b 200 OK

    if (err) {
      //      debug("Homebridge Status failed %s:%s", ipAddress, port, body, err);
      callback(err);
    } else if (response.statusCode !== 207) {
      if (response.statusCode === 401) {
        debug("Homebridge auth failed, invalid PIN %s %s:%s", pin, ipAddress, port, body, err, response.body);
        callback(new Error("Homebridge auth failed, invalid PIN " + pin));
      } else {
        debug("Homebridge Status failed %s:%s Status: %s ", ipAddress, port, response.statusCode, body, err, response.body);
        callback(new Error("Homebridge status failed"));
      }
    } else {
      var rsp;
      try {
        rsp = response.body;
      } catch (ex) {
        debug("Homebridge Response Failed %s:%s", ipAddress, port, response.statusCode, response.statusMessage);
        debug("Homebridge Response Failed %s:%s", ipAddress, port, response.body, ex);

        callback(new Error(ex));
      }
      callback(null, rsp);
    }
  });
}

function _getAccessories(ipAddress, instance, callback) {
  request({
    eventBus: eventBus,
    method: 'GET',
    url: 'http://' + ipAddress + ':' + instance.port + '/accessories',
    timeout: 7000,
    json: true,
    maxAttempts: 5, // (default) try 5 times
    retryDelay: 5000, // (default) wait for 5s before trying again
    headers: {
      "Content-Type": "Application/json",
      "authorization": pin,
      "connection": "keep-alive"
    }
  }, function(err, response, body) {
    // Response s/b 200 OK
    if (err || response.statusCode !== 200) {
      if (err) {
        debug("HAP Discover failed %s http://%s:%s error %s", instance.txt.md, ipAddress, instance.port, err.code);
      } else {
        // Status code = 401 = homebridge not running in insecure mode
        if (response.statusCode === 401) {
          debug("HAP Discover failed %s http://%s:%s homebridge is not running in insecure mode with -I", instance.txt.md, ipAddress, instance.port);
          err = new Error("homebridge is not running in insecure mode with -I", response.statusCode);
        } else {
          debug("HAP Discover failed %s http://%s:%s error code %s", instance.txt.md, ipAddress, instance.port, response.statusCode);
          // debug("Message", response);
          err = new Error("Http Err", response.statusCode);
        }
      }
      callback(err);
    } else {
      // debug("RESPONSE", response, body);
      if (body && Object.keys(body.accessories).length > 0) {
        callback(null, {
          "ipAddress": ipAddress,
          "instance": instance,
          "accessories": body
        });
      } else {
        debug("Short json data received http://%s:%s", ipAddress, instance.port, JSON.stringify(body));
        callback(new Error("Short json data receivedh http://%s:%s", ipAddress, instance.port));
      }
    }
  });
}

function _registerEvents(ipAddress, port, body, callback) {
  request({
    eventBus: eventBus,
    reconnect: true,
    method: 'PUT',
    url: 'http://' + ipAddress + ':' + port + '/characteristics',
    timeout: 7000,
    maxAttempts: 1, // (default) try 5 times
    headers: {
      "Content-Type": "Application/json",
      "authorization": pin,
      "connection": "keep-alive"
    },
    body: body
  }, function(err, response) {
    // Response s/b 200 OK

    if (err) {
      //      debug("Homebridge Status failed %s:%s", ipAddress, port, body, err);
      callback(err);
    } else if (response.statusCode !== 207) {
      if (response.statusCode === 401) {
        debug("Homebridge auth failed, invalid PIN %s %s:%s", pin, ipAddress, port, body, err, response.body);
        callback(new Error("Homebridge auth failed, invalid PIN " + pin));
      } else {
        debug("Homebridge Status failed %s:%s Status: %s ", ipAddress, port, response.statusCode, body, err, response.body);
        callback(new Error("Homebridge status failed"));
      }
    } else {
      callback(null, response.body);
    }
  });
}

function registerEvents(message) {
  // TODO: This needs to process each message individually
  for (var key in message) {
    debug("Key", key, JSON.parse(key));
    var endpoint = JSON.parse(key);
    var register = {
      "characteristics": [{
        "aid": endpoint.aid,
        "iid": endpoint.iid,
        "ev": true
      }]
    };
    debug("Events Register %s:%s -> ", endpoint.host, endpoint.port, register);
    _registerEvents(endpoint.host, endpoint.port, JSON.stringify(register), function(err, message) {
      if (!err) {
        debug("Register Callback", message);
      } else {
        debug("Error: Register Callback", err, message);
      }
    });
  }
}

function handleError(err) {
  console.warn(err);
}
