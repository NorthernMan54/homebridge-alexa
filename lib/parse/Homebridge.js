var debug = require('debug')('Homebridge');
var Accessory = require('./Accessory.js').Accessory;
var messages = require('./messages.js');

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
    if (this.accessories[accessory.name]) {
      debug("Duplicate", accessory.name);
    } else {
      // debug("Adding", accessory.name)
    }
    this.accessories[accessory.name] = accessory;
    if (accessory.playback) {
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

  // Alexa devices made up of multiple homekit accessories in a single homebridge instance ie AppleTV

  // debug("Playback devices", this.atv);

  if (this.atv) { // Homebridge instance contains appleTV's
    for (var atv in this.atv) {
      var cookie = {};
      for (var index in this.accessories) {
        // debug("Checking", index);
        var accessory = this.accessories[index];
        // debug("Checking", accessory);
        if (accessory.playback && messages.isYamaha(accessory)) {
          debug("Yamaha", accessory);
          accessory.services.forEach(function(service) {
            debug("name", service);
            cookie[messages.playbackNameTranslate(service.name)] = service.toCookie("On", {
              host: this.host,
              port: this.port,
              homebridge: this.homebridge,
              aid: service.aid,
              id: this.id,
              opt: opt
            });
            cookie["ReportState"] = JSON.stringify([service.toCookie("ReportState", {
              host: this.host,
              port: this.port,
              homebridge: this.homebridge,
              id: this.id,
              aid: service.aid,
              opt: opt
            })]);
          }.bind(this));
        }
        if (accessory.name === "Play (" + atv + ")" || accessory.name === "Pause (" + atv + ")" || accessory.name === "Menu (" + atv + ")") {
          cookie[messages.playbackNameTranslate(accessory.name)] = accessory.toCookie("On", {
            host: this.host,
            port: this.port,
            homebridge: this.homebridge,
            id: this.id,
            opt: opt
          });
          cookie["ReportState"] = JSON.stringify([accessory.toCookie("ReportState", {
            host: this.host,
            port: this.port,
            homebridge: this.homebridge,
            id: this.id,
            opt: opt
          })]);
        } else {
          // debug("not Atv", accessory.name);
        }
      }

      // Add an endpoint for each AppleTV Device

      var capabilities = [];
      capabilities = capabilities.concat({
        "type": "AlexaInterface",
        "interface": "Alexa",
        "version": "3"
      });
      capabilities = capabilities.concat(messages.lookupCapabilities("ATVPlaybackController", false, cookie));
      debug("Acc", accessory);
      list = list.concat({
        endpointId: new Buffer(this.id + "-" + this.homebridge + "-Apple-" + atv + "-00000049-0000-1000-8000-0026BB765291").toString('base64'),
        friendlyName: atv,
        description: this.homebridge + " " + atv + " Apple TV",
        manufacturerName: accessory.info.Manufacturer,
        displayCategories: ["TV"],
        cookie: cookie,
        capabilities: capabilities
      });
    }
  }

  for (var index in this.accessories) {
    var accessory = this.accessories[index];
    if (accessory.playback) {
      // debug("Media device", accessory.name);
    }
    list = list.concat(accessory.toAlexa({
      host: this.host,
      port: this.port,
      homebridge: this.homebridge,
      id: this.id,
      opt: opt
    }));
  }
  return (list);
};
