var debug = require('debug')('Accessory');
var Service = require('./Service.js').Service;

module.exports = {
  Accessory: Accessory
};

/*
 * Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
 */

function Accessory(devices, context) {
  // debug("Accessory", devices);
  this.aid = devices.aid;
  this.host = context.host;
  this.port = context.port;
  this.homebridge = context.homebridge;
  this.id = context.id;
  this.events = context.events;
  this.speakers = context.speakers;
  this.services = [];
  this.playback = false;
  this.link = [];
  devices.services.forEach(function(element) {
    // debug("Service", element);
    switch (element.type.substring(0, 8)) {
      case "0000003E": // Accessory Information
        this.info = information(element.characteristics);
        this.name = this.info.Name;
        break;
      default:
        var service = new Service(element, this);
        this.services[service.iid] = service;
        if (service.playback) {
          this.playback = true;
        }
        if (service.linked) {
          this.link[service.iid] = service.linked;
        }
    }
  }.bind(this));
  // debug("Info", this.info);
}

Accessory.prototype.toList = function(context) {
  var list = [];
  context.aid = this.aid;
  context.name = this.info.Name;
  context.manufacturer = this.info.Manufacturer;
  for (var index in this.services) {
    var service = this.services[index].toList(context);
    if (service) {
      list = list.concat(service);
    }
  }

  // debug("opt",context.opt,list.length);
  return (list);
};

Accessory.prototype.toAlexa = function(context) {
  var list = [];
  context.aid = this.aid;
  context.name = this.info.Name;
  context.manufacturer = this.info.Manufacturer;
  for (var index in this.services) {
    var service = this.services[index].toAlexa(context);
    if (this.services[index].linked) {
      debug("Linked", this.services[index].linked.length);
      this.services[index].linked.forEach(function(link) {
        debug("Link", link);
        debug("Link", link, this.services[link].toAlexa(context));
      }.bind(this));
    }
    debug("Service", this.services[index].service);
    if (service && this.services[index].service !== "Input Source") {
      list = list.concat(service);
    }
  }

  // debug("opt",context.opt,list.length);
  return (list);
};

Accessory.prototype.toCookie = function(characteristic, context) {
  var list;
  context.aid = this.aid;
  context.name = this.info.Name;
  context.manufacturer = this.info.Manufacturer;
  for (var index in this.services) {
    var service = this.services[index].toCookie(characteristic, context);
    if (service) {
      list = service;
    }
  }

  // debug("opt",context.opt,list.length);
  return (list);
};

function information(characteristics) {
  var result = {};
  characteristics.forEach(function(characteristic) {
    if (characteristic.description) {
      var key = characteristic.description.replace(/ /g, '').replace(/\./g, '_');
      result[key] = characteristic.value;
    }
  });
  return result;
}
