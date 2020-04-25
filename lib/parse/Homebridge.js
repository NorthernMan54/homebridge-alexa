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
  this.playback = {};
  devices.accessories.accessories.forEach(function(element) {
    var accessory = new Accessory(element, this);
    if (this.accessories[accessory.name + accessory.aid]) {
      debug("Duplicate", accessory.name);
    } else {
      // debug("Adding", accessory.name)
    }
    this.accessories.push(accessory);
    // debug("Adding", accessory.name);
    if (accessory.playback) {
      var playback = (accessory.name.split("(")[1] ? accessory.name.split("(")[1].split(")")[0] : undefined);
      if (playback && accessory.name.substr(0, accessory.name.indexOf(" ")) !== "Pair") {
        this.playback[playback] = playback;
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

  // Alexa devices made up of multiple homekit accessories in a single homebridge instance
  // Devices include Apple TV and Yamaha Stereo Playback controls

  if (this.playback) { // Homebridge instance contains appleTV's
    for (var playback in this.playback) {
      var cookie = {};
      var service = "00000098";
      for (var index in this.accessories) {
        // debug("Checking", index);
        var accessory = this.accessories[index];
        // debug("Checking", accessory);
        if (accessory.playback && messages.isYamaha(accessory)) {
          // debug("Yamaha", accessory);
          service = "00000113";
          // accessory.services.forEach(function(service) {
          for (var index in accessory.services) {
            var device = accessory.services[index];

            // debug("name", service);
            cookie[messages.playbackNameTranslate(device.name)] = device.toCookie("On", {
              host: this.host,
              port: this.port,
              homebridge: this.homebridge,
              aid: device.aid,
              id: this.id,
              opt: opt
            });
            if (messages.playbackNameTranslate(device.name) === "Pause") {
              cookie["Stop"] = device.toCookie("On", {
                host: this.host,
                port: this.port,
                homebridge: this.homebridge,
                aid: device.aid,
                id: this.id,
                opt: opt
              });
            }
            cookie["ReportState"] = JSON.stringify([device.toCookie("ReportState", {
              host: this.host,
              port: this.port,
              homebridge: this.homebridge,
              id: this.id,
              aid: device.aid,
              opt: opt
            })]);
          }
        }
        if (accessory.name === "Play (" + playback + ")" || accessory.name === "Pause (" + playback + ")" || accessory.name === "Menu (" + playback + ")") {
          service = "00000098";
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

      // Add an endpoint for each playback Device

      var capabilities = [];
      capabilities = capabilities.concat({
        "type": "AlexaInterface",
        "interface": "Alexa",
        "version": "3"
      });
      capabilities = capabilities.concat(messages.lookupCapabilities("PlaybackController", false, cookie));
      // debug("Acc", accessory);
      //         endpointId: new Buffer(this.id + "-" + this.homebridge + "-" + accessory.info.Manufacturer + "-" + playback + "-00000049-0000-1000-8000-0026BB765291").toString('base64'),
      list = list.concat({
        endpointId: Buffer.from(this.id + "-" + this.homebridge + "-" + accessory.info.Manufacturer + "-" + playback + "-00000049-0000-1000-8000-0026BB765291").toString('base64').replace('/', ''),
        friendlyName: playback,
        description: this.homebridge + " " + playback + " " + messages.normalizeName(service),
        manufacturerName: accessory.info.Manufacturer,
        displayCategories: messages.lookupDisplayCategory(service),
        cookie: cookie,
        capabilities: capabilities
      });
    }
  }

  // Get all the remaining devices

  for (var index in this.accessories) {
    var accessory = this.accessories[index];
    if (accessory.playback) {
      // debug("Media device", accessory.name);
    }
    var alexa = accessory.toAlexa({
      host: this.host,
      port: this.port,
      homebridge: this.homebridge,
      id: this.id,
      opt: opt
    });
    // debug("Alexa", alexa);
    if (alexa) {
      list = list.concat(alexa);
    }
  }
  return (list);
};
