var debug = require('debug')('alexa:Accessory');
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
  this.deviceID = context.deviceID;
  this.homebridge = context.homebridge;
  this.id = context.id;
  this.options = context.options;
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
    var television, speaker;
    var inputs = [];
    for (var index in this.services) {
      var service = this.services[index];
      if (service.service === "Television") {
        // this.tvService = service.toAlexa(context);
        television = service.toAlexa(context);
      } else if (service.service === "Speaker") {
        speaker = service.toAlexa(context);
      } else if (service.service === "Input Source") {
        // debug("toAlexa", service.toAlexa(context));
        inputs = inputs.concat(service.toAlexa(context).cookie);
      }
    }
    if (speaker) {
      messages.mergeCookies(television.cookie, speaker.cookie);
      messages.mergeCapabilities(television.capabilities, speaker.capabilities);
    }
    if (inputs.length > 0 && television) {
      // debug("Television", messages.lookupCapabilities("ChannelController", this.options, inputs));
      // debug("inputs && television", context.name, inputs.length, television);
      inputs = flatten(inputs);
      // debug("inputs && television", context.name);
      messages.mergeInputCookies(television.cookie, inputs);
      messages.mergeCapabilities(television.capabilities, messages.lookupCapabilities("Input Source", this.options, inputs));
      messages.mergeCapabilities(television.capabilities, messages.lookupCapabilities("ChannelController", this.options, inputs));
    }
    if (television) {
      // debug("Adding", service.name, alexa);
      list = list.concat(television);
    }
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

function flatten(data) {
  var result = {};

  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop);
      if (l == 0)
        result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop)
        result[prop] = {};
    }
  }
  recurse(data, "");
  delete result["Channel"];
  delete result["ReportState"];
  return result;
}
