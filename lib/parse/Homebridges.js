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

  // list.sort((a, b) => (a.sortName > b.sortName) ? 1 : ((b.sortName > a.sortName) ? -1 : 0));
  // debug("opt",opt,list.length);
  // debug("MESSAGE", message);
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa.Discovery",
        "name": "Discover.Response",
        "payloadVersion": "3",
        "messageId": message.directive.header.messageId
      },
      "payload": {
        "endpoints": list
      }
    }
  };
  if (opt.combine) {
    response = messageUtil.combine(opt, response);
  }
  return (response);
};

Homebridges.prototype.toEvents = function(opt, message) {
  var list = [];
  this.homebridges.forEach(function(homebridge) {
    // debug("homebridge", homebridge.accessories);
    for (var index in homebridge.accessories) {
      var accessory = homebridge.accessories[index];
      // debug("accessory", accessory);
      accessory.services.forEach(function(service) {
        // debug("service", service);
        for (var index in service.characteristics) {
          var hapEvents = service.characteristics[index].hapEvents;
          // debug("hapEvents", hapEvents, Object.keys(hapEvents).length);
          if (Object.keys(hapEvents).length > 0) {
            list = Object.assign(list, hapEvents);
            // debug("List", list);
          }
        }
      });
    }
  });
  return (list);
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
