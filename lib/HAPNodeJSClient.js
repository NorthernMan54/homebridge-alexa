"use strict";

var request = require('./util/hapRequest.js');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var debug = require('debug')('HAPClient');
var bonjour = require('bonjour')();
var ip = require('ip');

var discovered = [];

module.exports = {
  HAPNodeJSClient: HAPNodeJSClient
};

/*

HAPaccessories

HAPcontrol

HAPstatus

External events

Ready - Emitted after every discovery cycle

hapEvent - Emitted when an HAP EVENT message is revieved

*/

function HAPNodeJSClient(options) {
  this.pin = options.pin;
  this._eventBus = new EventEmitter();
  _discovery.call(this);
  setInterval(_discovery.bind(this), options.refresh * 1000);

  this._eventBus.on('hapEvent', function(event) {
    this.emit('hapEvent', event);
  });
}

inherits(HAPNodeJSClient, EventEmitter);

function _discovery() {
  debug("Starting Homebridge instance discovery");
  discovered = [];
  try {
    this.browser = bonjour.find({
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
      _getAccessories.call(this, ipAddress, instance, function(err, data) {
        if (!err) {
          debug("Homebridge instance discovered %s with %s accessories", instance.name, Object.keys(data.accessories.accessories).length, this);
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
  this.emit('Ready', discovered);
  this.browser.stop();
}

HAPNodeJSClient.prototype.HAPaccessories = function(callback) {
  // This is a callback as in the future may need to call something
  callback(discovered);
};

// curl -X PUT http://127.0.0.1:51826/characteristics --header "Content-Type:Application/json"
// --header "authorization: 031-45-154" --data "{ \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"

HAPNodeJSClient.prototype.HAPcontrol = function(ipAddress, port, body, callback) {
  request({
    eventBus: this.eventBus,
    method: 'PUT',
    url: 'http://' + ipAddress + ':' + port + '/characteristics',
    timeout: 7000,
    maxAttempts: 1, // (default) try 5 times
    headers: {
      "Content-Type": "Application/json",
      "authorization": this.pin,
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
        debug("Homebridge auth failed, invalid PIN %s %s:%s", this.pin, ipAddress, port, body, err, response.body);
        callback(new Error("Homebridge auth failed, invalid PIN " + this.pin));
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
};

HAPNodeJSClient.prototype.HAPstatus = function(ipAddress, port, body, callback) {
  request({
    eventBus: this.eventBus,
    method: 'GET',
    url: 'http://' + ipAddress + ':' + port + '/characteristics' + body,
    timeout: 7000,
    maxAttempts: 1, // (default) try 5 times
    headers: {
      "Content-Type": "Application/json",
      "authorization": this.pin,
      "connection": "keep-alive"
    }
  }, function(err, response) {
    // Response s/b 200 OK

    if (err) {
      //      debug("Homebridge Status failed %s:%s", ipAddress, port, body, err);
      callback(err);
    } else if (response.statusCode !== 207) {
      if (response.statusCode === 401) {
        debug("Homebridge auth failed, invalid PIN %s %s:%s", this.pin, ipAddress, port, body, err, response.body);
        callback(new Error("Homebridge auth failed, invalid PIN " + this.pin));
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
};

function _getAccessories(ipAddress, instance, callback) {
  request({
    eventBus: this.eventBus,
    method: 'GET',
    url: 'http://' + ipAddress + ':' + instance.port + '/accessories',
    timeout: 7000,
    json: true,
    maxAttempts: 5, // (default) try 5 times
    retryDelay: 5000, // (default) wait for 5s before trying again
    headers: {
      "Content-Type": "Application/json",
      "authorization": this.pin,
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

function handleError(err) {
  console.warn(err);
}
