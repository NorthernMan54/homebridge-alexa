var debug = require('debug')('Homebridge');
var Accessory = require('./Accessory.js').Accessory;

module.exports = {
  Homebridge: Homebridge
};

/*
 * Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
 */

function Homebridge(devices, context) {
  // debug("Homebridge", devices);
  this.accessories = [];
  this.host = devices.ipAddress;
  this.port = devices.instance.port;
  this.homebridge = devices.instance.txt.md;
  this.id = devices.instance.txt.id;
  this.events = context.events;
  this.speakers = context.speakers;
  this.atv = {};
  devices.accessories.accessories.forEach(function(element) {
    var accessory = new Accessory(element, this);
    this.accessories[accessory.name] = accessory;
    if (accessory.appleTV) {
      var atv = (accessory.name.split("(")[1] ? accessory.name.split("(")[1].split(")")[0] : undefined);
      if (atv && accessory.name.substr(0, accessory.name.indexOf(" ")) !== "Pair") {
        this.atv[atv] = atv;
        // debug("ATVName", atv);
      }
      // debug("ATVName", (accessory.name.split("(")[1] ? accessory.name.split("(")[1].split(")")[0] : undefined));
    }
  }.bind(this));
}

Homebridge.prototype.toList = function(opt) {
  var list = [];
  for (var index in this.accessories) {
    var accessory = this.accessories[index];
    list = list.concat(accessory.toList({
      host: this.host,
      port: this.port,
      homebridge: this.homebridge,
      id: this.id,
      opt: opt
    }));
    // list.push(accessory.toList());
  }
  // debug("opt",opt,list.length);
  return (list);
};

Homebridge.prototype.toAlexa = function(opt) {
  var list = [];
  debug("AppleTV", this.atv);
  if (this.atv) {
    for (var atv in this.atv) {
      debug("ATV", atv);
      for (var index in this.accessories) {
        // debug("Accessories", index);
        var accessory = this.accessories[index];
        if (accessory.name === "Play (" + atv + ")" || accessory.name === "Pause (" + atv + ")" || accessory.name === "Menu (" + atv + ")") {
          debug("Atv", accessory);
        } else {
          debug("not Atv", accessory.name);
        }
      }
    }
  }

  for (var index in this.accessories) {
    // debug("Accessories", index);
    var accessory = this.accessories[index];
    if (accessory.appleTV) {
      // debug("AppleTV", accessory.name);
    }
    list = list.concat(accessory.toAlexa({
      host: this.host,
      port: this.port,
      homebridge: this.homebridge,
      id: this.id,
      opt: opt
    }));
    // list.push(accessory.toList());
  }
  // debug("opt",opt,list.length);
  return (list);
};
