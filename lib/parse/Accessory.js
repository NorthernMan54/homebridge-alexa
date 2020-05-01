var debug = require('debug')('Accessory');
var Service = require('./Service.js').Service;
var messages = require('./messages.js');

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
  this.services = {};
  this.playback = false;
  this.television = false;
  this.link = [];
  devices.services.forEach(function(element) {
    // debug("Service", element);
    switch (element.type.substring(0, 8)) {
      case "0000003E": // Accessory Information
        this.info = information(element.characteristics);
        this.name = this.info.Name;
        break;
      default:
        if (!this.info) {
          this.name = "Unknown";
          this.info = {};
          this.info.Manufacturer = "Unknown";
          this.info.Name = "Unknown";
        }
        var service = new Service(element, this);
        // debug("New", service);
        // if (service.service) {
        this.services[service.iid] = service;
        // }
        if (service.playback) {
          this.playback = true;
        }
        // debug("New", service.service);
        if (service.service === "Television") {
          // debug("Found TV", service.iid);
          this.television = true;
        }
        if (service.linked) {
          this.link[service.iid] = service.linked;
        }
    }
  }.bind(this));
  // debug("Services.setup", this.name, this.services.length);
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
  // debug("toAlexa", context.name, this.services.length);
  if (this.television) {
    var television, speaker, inputs;
    for (var index in this.services) {
      var service = this.services[index];
      if (service.service === "Television") {
        // this.tvService = service.toAlexa(context);
        television = service.toAlexa(context);
      } else if (service.service === "Speaker") {
        speaker = service.toAlexa(context);
      } else if (service.service === "Input Source") {

      }
    }
    if (speaker) {
      messages.mergeCookies(television.cookie, speaker.cookie);
      messages.mergeCapabilities(television.capabilities, speaker.capabilities);
    }
    if (television) {
      // debug("Adding", service.name, alexa);
      list = list.concat(television);
    }
    /*
    for (var index in this.services) {
      var service = this.services[index];
      if (service.linked) {
        // debug("Linked", this.services[index].linked.length);
        service.linked.forEach(function(link) {});
      }
      var alexa = service.toAlexa(context);
      debug("Adding-0", service.name, alexa);
      if (service.service === "Television") {
        debug("Found Television", index, service.iid);
        this.tvService = service.toAlexa(context);
      } else if (this.television && service.service === "Speaker" && service.toAlexa(context)) {
        // debug("Found Speaker", index, service.iid);
        debug("Speaker - cookie", this.tvService, service.toAlexa(context));
        // debug("Speaker - Bcapabilities", context.name, this.tvService.capabilities, service.toAlexa(context).capabilities);
        messages.mergeCookies(this.tvService.cookie, service.toAlexa(context).cookie);
        messages.mergeCapabilities(this.tvService.capabilities, service.toAlexa(context).capabilities);
        // debug("Speaker - Acapabilities", context.name, this.tvService.capabilities, service.toAlexa(context).capabilities);
      } else if (this.television && service.service === "Input Source") {
        // Skip Inputs for TV Accessories
      } else if (alexa) {
        // debug("Adding", service.name, alexa);
        list = list.concat(service.toAlexa(context));
      }
    }
    // debug("Insert", this.television, this.tvService);
    if (this.television && this.tvService) {
      list = list.concat(this.tvService);
    }
    */
  }

  for (var index in this.services) {
    var service = this.services[index];
    if ((this.television && service.service === "Speaker") || service.service === "Television" || service.service === "Input Source") {
      // Skip television accessories
    } else {
      var alexa = service.toAlexa(context);
      if (alexa) {
        list = list.concat(alexa);
      }
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

  // Issue #325 missing manufacturer breaks alexa
  if (!result.Manufacturer) {
    result.Manufacturer = "Missing Manufacturer";
  }
  // debug("information", result);
  return result;
}
