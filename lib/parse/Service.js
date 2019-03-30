var debug = require('debug')('Service');
var Characteristic = require('./Characteristic.js').Characteristic;
var messages = require('./messages.js');

module.exports = {
  Service: Service
};

/*
 * Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
 */

function Service(devices, context) {
  // debug("Service", context.info.Manufacturer, context.info.Name);
  // context.speakers.some(function(element) {
  //  return (element.manufacturer === context.info.Manufacturer && element.name === context.info.Name);
  // });
  this.iid = devices.iid;
  // Pre parser for Service overrides for services HomeKit doesn't support natively
  if (context.speakers.some(function(element) {
      return (element.manufacturer === context.info.Manufacturer && element.name === context.info.Name);
    })) {
    this.type = "00000113"; // HomeKit Speaker service
  } else {
    this.type = devices.type.substring(0, 8);
  }
  // debug("this.type", this.type);
  this.serviceType = devices.type;
  this.service = messages.normalizeName(this.type);
  this.aid = context.aid;
  this.host = context.host;
  this.port = context.port;
  this.homebridge = context.homebridge;
  this.id = context.id;
  this.events = context.events;
  this.speakers = context.speakers;
  this.info = context.info;
  this.characteristics = [];
  devices.characteristics.forEach(function(element) {
    var service = new Characteristic(element, this);
    if (element.type.substring(0, 8) === '00000023' && element.description === "Name") {
      this.name = element.value;
    } else {
      this.characteristics[service.description] = service;
    }
  }.bind(this));
  if (this.info.Manufacturer === "Apple" && this.info.Model === "Apple TV" && messages.atvButton(this.name)) {
    this.appleTV = true;
  } else {
    this.appleTV = false;
  }
}

Service.prototype.toList = function(context) {
  var descriptions;
  var getCharacteristics;
  var putCharacteristics = [];
  var eventRegisters = [];
  var characteristics = {};

  if (this.name) {
    context.name = this.name;
  }
  for (var index in this.characteristics) {
    var characteristic = this.characteristics[index];
    // debug("characteristic", characteristic)
    // debug("perms", context.opt);
    // debug("perms", (context.opt ? "perms" + context.opt.perms + characteristic.perms.includes(context.opt.perms) : "noperms"));
    if (characteristic.type !== '00000023' && (context.opt ? characteristic.perms.includes(context.opt.perms) : true)) {
      // debug("Yes", context.name, characteristic.description, characteristic.perms);
      descriptions = (descriptions ? descriptions + ',' : '') + characteristic.description;
      getCharacteristics = (getCharacteristics ? getCharacteristics + ',' : '') + characteristic.getCharacteristic;
      // characteristics = (characteristics ? characteristics + ',' : '') + characteristic.characteristic;
      characteristics = Object.assign(characteristics, characteristic.characteristic);
      putCharacteristics = putCharacteristics.concat(characteristic.putCharacteristic);
      eventRegisters = eventRegisters.concat(characteristic.eventRegister);
    } else {
      // debug("No", context.name, characteristic.description, characteristic.perms);
    }
  }
  if (this.service && descriptions) {
    return ({
      homebridge: context.homebridge,
      host: context.host,
      port: context.port,
      id: context.id,
      manufacturer: context.manufacturer,
      aid: this.aid,
      type: this.type,
      name: context.name,
      service: this.service,
      fullName: context.name + ' - ' + this.service,
      sortName: context.name + ':' + this.service,
      uniqueId: context.homebridge + this.id + context.manufacturer + context.name + this.type,
      descriptions: descriptions,
      characteristics: characteristics,
      getCharacteristics: getCharacteristics,
      eventRegisters: eventRegisters
    });
  }
};

Service.prototype.toAlexa = function(context) {
  var cookie = {};
  var capabilities = [];
  var reportState = [];

  if (this.name) {
    context.name = this.name;
  }

  // debug("Context", context, this);
  if (this.appleTV) {
    // Is this needed?
  } else {
    for (var index in this.characteristics) {
      var characteristic = this.characteristics[index];
      if (characteristic.type !== '00000023' && characteristic.capabilities) {
        cookie = Object.assign(cookie, characteristic.cookie);
        capabilities = capabilities.concat(characteristic.capabilities);
        reportState = reportState.concat(characteristic.reportState);
      } else {
        // debug("No", context.name, characteristic.description, characteristic.perms);
      }
    }
  }

  // Special devices that span mulitple getCharacteristics

  switch (this.service) {
    case "Lightbulb":
      // If a lightbulb has a Hue characteristic, it is a color bulb
      if (this.characteristics["Hue"]) {
        reportState.push({
          "interface": "Alexa.ColorController",
          "host": this.host,
          "port": this.port,
          "hue": this.characteristics["Hue"].getCharacteristic,
          "saturation": this.characteristics["Saturation"].getCharacteristic,
          "brightness": this.characteristics["Brightness"].getCharacteristic,
          "on": this.characteristics["On"].getCharacteristic
        });
        cookie["SetColor"] = JSON.stringify({
          "host": this.host,
          "port": this.port,
          "hue": this.characteristics["Hue"].getCharacteristic,
          "saturation": this.characteristics["Saturation"].getCharacteristic,
          "brightness": this.characteristics["Brightness"].getCharacteristic,
          "on": this.characteristics["On"].getCharacteristic
        });
        capabilities = capabilities.concat(messages.lookupCapabilities("ColorController", context.events));
      }
      break;
  }

  cookie["ReportState"] = JSON.stringify(reportState);
  if (capabilities.length > 0) {
    capabilities.unshift({
      "type": "AlexaInterface",
      "interface": "Alexa",
      "version": "3"
    });
    // debug("this.type-final", this.type, context.name, messages.lookupDisplayCategory(this.type));
    return ({
      endpointId: new Buffer(this.id + "-" + context.homebridge + "-" + context.manufacturer + "-" + context.name + "-" + this.serviceType).toString('base64'),
      friendlyName: context.name,
      description: context.homebridge + " " + context.name + " " + this.service,
      manufacturerName: context.manufacturer,
      displayCategories: messages.lookupDisplayCategory(this.type),
      cookie: cookie,
      capabilities: capabilities
    });
  }
};
