var debug = require('debug')('Homebridges');
var Homebridge = require('./Homebridge.js').Homebridge;
var messageUtil = require('../util/messageUtil');

module.exports = {
  Homebridges: Homebridges
};

/*
 * Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
 */

function Homebridges(devices, context) {
  // debug("Homebridges", devices);
  this.homebridges = [];
  devices.forEach(function(element) {
    var homebridge = new Homebridge(element, context);
    this.homebridges.push(homebridge);
  }.bind(this));
}

/**
 * Homebridges.toList - description
 *
 * @param  {type} opt description
 * @return {type}     description
 */

Homebridges.prototype.toList = function(opt) {
  var list = [];
  for (var index in this.homebridges) {
    var homebridge = this.homebridges[index];
    // list.push(homebridge.toList());
    list = list.concat(homebridge.toList(opt));
  }

  list.sort((a, b) => (a.sortName > b.sortName) ? 1 : ((b.sortName > a.sortName) ? -1 : 0));
  // debug("opt",opt,list.length);
  return (list);
};

Homebridges.prototype.toAlexa = function(opt, message) {
  var list = [];
  for (var index in this.homebridges) {
    var homebridge = this.homebridges[index];
    // list.push(homebridge.toList());
    list = list.concat(homebridge.toAlexa(opt));
  }

  list.sort((a, b) => (a.endpointId > b.endpointId) ? 1 : ((b.endpointId > a.endpointId) ? -1 : 0));
  // debug("opt",opt,list.length);
  // debug("MESSAGE", message);
  var messageId = (message ? message.directive.header.messageId : '');
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa.Discovery",
        "name": "Discover.Response",
        "payloadVersion": "3",
        "messageId": messageId
      },
      "payload": {
        "endpoints": list
      }
    }
  };
  // debug("PreCombine", JSON.stringify(list, null, 2));
  if (opt.inputs) {
    response = messageUtil.inputs(opt, response);
  }
  if (opt.channel) {
    response = messageUtil.channel(opt, response);
  }
  if (opt.combine) {
    response = messageUtil.combine(opt, response);
  }
  // debug("toAlexa - Done");
  return (response);
};

Homebridges.prototype.toEvents = function(endpoint) {
  // debug("toEvents");
  var list = [];
  this.homebridges.forEach(function(homebridge) {
    // debug("accessories", homebridge.accessories.length);
    for (var index in homebridge.accessories) {
      var accessory = homebridge.accessories[index];
      // debug("services", accessory.services.length);
      // accessory.services.forEach(function(service) {
      for (var index in accessory.services) {
        var service = accessory.services[index];
        // debug("characteristics", service.characteristics.length);
        for (var index in service.characteristics) {
          var hapEvents = service.characteristics[index].hapEvents;
          if (Object.keys(hapEvents).length > 0) {
            list = Object.assign(list, hapEvents);
            // debug("hapEvents", hapEvents, Object.keys(hapEvents).length);
            // debug("List", list);
          }
        }
      };
    }
  });
  if (endpoint) {
    // debug("toEvents", endpoint, list[endpoint]);
    return list[endpoint];
  } else {
    return (list);
  }
};

/* {
  "characteristics": [{
    "aid": endpoint.aid,
    "iid": endpoint.iid,
    "ev": true
  }]
};
*/

Homebridges.prototype.findDevice = function(node) {
  var list = [];
  for (var index in this.homebridges) {
    var homebridge = this.homebridges[index];
    // list.push(homebridge.toList());
    list = list.concat(homebridge.toList());
  }
  return (list.find(x => x.uniqueId === node));
};
