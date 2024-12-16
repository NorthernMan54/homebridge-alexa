var debug = require('debug')('Alexa:Service');
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
  if (context.options.speakers && context.options.speakers.some(function (element) {
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
  this.deviceID = context.deviceID;
  this.homebridge = context.homebridge;
  this.id = context.id;
  this.options = context.options;
  this.info = context.info;
  this.characteristics = [];
  this.linked = devices.linked;
  this.name = context.name;
  var endpointReg = /[^\w|_|-|=|#|;|:|?|@|&]/g; // Invalid characters in endpointid
  this.endpointID = Buffer.from(this.id + "-" + context.homebridge + "-" + context.info.Manufacturer + "-" + context.info.Name + "-" + this.serviceType).toString('base64').replace(endpointReg, '#');
  // this.endpointID = new Buffer(this.id + "-" + context.homebridge + "-" + context.info.Manufacturer + "-" + context.info.Name + "-" + this.serviceType).toString('base64');
  // debug("First EP", this.id + "-" + context.homebridge + "-" + context.info.Manufacturer + "-" + context.info.Name + "-" + this.serviceType);

  switch (this.serviceType.substring(0, 8)) {
    case "00000111":      // Ignore camera services
    case "00000110":
      break;
    default:
      // First pass to grab service names
      devices.characteristics.forEach(function (element) {
        if (element.type.substring(0, 8) === '00000023' && element.description === "Name") {
          // debug("context.info.Manufacturer %s -> %s -> %s", context.info.Manufacturer, context.name, element.value);
          // Fix for issue #218 - Nest devices with duplicate's
          if (element.value) {
            this.name = element.value;
          } else {
            this.name = context.info.Name;
          }
          this.EPname = this.name;
          if (context.info.Manufacturer === "Nest") {
            this.name = context.name + " " + element.value;
            this.EPname = context.name + " " + element.value;
          } else if (context.info.Manufacturer === "LG Electronics Inc.") {
            // Fix for issue #284 - LG TV's with duplicate's
            // debug("Issue #284 Name %s - %s", element.value, context.info.Name);
            // debug("issue #284 Manufacturer %s -> %s -> %s", context.info.Manufacturer, context.name, element.value);
            this.EPname = context.name + " " + element.value;
          } else if (this.options.mergeServiceName && context.name !== element.value) {
            // Fix for #551
            this.name = context.name + " " + element.value;
            this.EPname = context.name + " " + element.value;
            debug("mergeServiceName", this.name);
          }

          this.endpointID = Buffer.from(this.id + "-" + context.homebridge + "-" + context.info.Manufacturer + "-" + this.EPname + "-" + this.serviceType).toString('base64').replace(endpointReg, '#');
        }
      }.bind(this));
      // second pass to grab service names
      devices.characteristics.forEach(function (element) {
        if (element.type.substring(0, 8) === '00000023' && element.description === "Name") {
          // second pass, no need to grab names
        } else {
          var service = new Characteristic(element, this);
          if (this.characteristics[service.description]) {
            // debug("Duplicate", this.name, this.serviceType, service.description);
          } else {
            // debug("Adding", this.name, this.serviceType, service.iid, service);
            this.characteristics[service.description] = service;
          }
        }
      }.bind(this));
  }
  if (messages.isAppleTV(this) || messages.isYamaha(this)) {
    this.playback = true;
  } else {
    this.playback = false;
  }
}

Service.prototype.toList = function (context) {
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
      deviceID: context.deviceID,
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

Service.prototype.toCookie = function (characteristic, context, value) {
  // debug("toCookie", this.characteristics[characteristic], characteristic, context);
  // var iid = this.characteristics[characteristic].iid;
  if (value === undefined) value = 1;
  switch (characteristic) {
    /*
    case "ReportState":
      return (messages.reportState("Alexa.PlaybackController", {
        "deviceID": context.deviceID,
        "aid": context.aid,
        "liid": this.characteristics["On"].iid
      }));
      */
    default:
      return (messages.cookieV(value, {
        "deviceID": context.deviceID,
        "aid": context.aid,
        "liid": this.characteristics[characteristic].iid
      }));
  }
};

Service.prototype.toAlexa = function (context) {
  var cookie = {};
  var capabilities = [];
  var reportState = [];

  if (this.name) {
    context.name = this.name;
  }

  if (this.playback) {
    // debug("Skipping Media Control Button", context.name);
  } else {
    for (var index in this.characteristics) {
      var characteristic = this.characteristics[index];
      if (characteristic.type !== '00000023' && characteristic.capabilities) {
        // debug("Yes", context.name, characteristic.aid, characteristic.iid);
        cookie = Object.assign(cookie, characteristic.cookie);
        capabilities = capabilities.concat(characteristic.capabilities);
        reportState = reportState.concat(characteristic.reportState);
      } else {
        // debug("No", context.name, characteristic.description, characteristic.perms);
      }
    }
  }

  // Special devices that span mulitple getCharacteristics
  // debug("Service", this.service);
  try {
    switch (this.service) {
      case "Lightbulb":
        // If a lightbulb has a Hue characteristic, it is a color bulb
        if (this.characteristics["Hue"]) {
          reportState.push({
            "interface": "Alexa.ColorController",
            "deviceID": this.deviceID,

            "hue": this.characteristics["Hue"].getCharacteristic,
            "saturation": this.characteristics["Saturation"].getCharacteristic,
            "brightness": this.characteristics["Brightness"].getCharacteristic,
            "on": this.characteristics["On"].getCharacteristic
          });
          cookie["SetColor"] = JSON.stringify({
            "deviceID": this.deviceID,

            "hue": this.characteristics["Hue"].getCharacteristic,
            "saturation": this.characteristics["Saturation"].getCharacteristic,
            "brightness": this.characteristics["Brightness"].getCharacteristic,
            "on": this.characteristics["On"].getCharacteristic
          });
          capabilities = capabilities.concat(messages.lookupCapabilities("ColorController", context.events));
        }
        break;
      case "Thermostat":
        capabilities = capabilities.concat(messages.lookupCapabilities("Active", context.events, cookie));
      case "Heater Cooler":
        /*
        reportState.push({
          "interface": "Alexa.ThermostatController",
          "host": this.host,

          "aid": this.aid
        });
        */
        capabilities = capabilities.concat(messages.lookupCapabilities("ThermostatController", context.events, cookie));
        break;
      case "Temperature Sensor":
        // Fix for issue #237
        // "friendlyName": "Dyson Pure Cool Link",
        // "description": "parseTest Dyson Pure Cool Link Temperature Sensor",
        // "manufacturerName": "Dyson",
        if (context.manufacturer === "Dyson") {
          context.name = context.name + " " + this.service;
        }
        break;
      case "Input Source":
        // debug("Input Source", this.characteristics);
        cookie[normalizeInput(this.characteristics["Configured Name"].value)] = messages.cookieV(this.characteristics["Identifier"].value, context);
        capabilities = capabilities.concat(messages.lookupCapabilities("Input Source", context.events, cookie));
        break;
    }
  } catch (err) {
    debug("Warning: Accessory parsing error: %s -> %s", context.name, context.manufacturer);
  }

  cookie["ReportState"] = JSON.stringify(reportState);
  if (capabilities.length > 0) {
    capabilities.unshift({
      "type": "AlexaInterface",
      "interface": "Alexa",
      "version": "3"
    });
    // debug("Final EP", this.id + "-" + context.homebridge + "-" + context.manufacturer + "-" + context.name + "-" + this.serviceType);
    // debug('context:', context);
    if (!context.name || context.name.trim() === "") {
      console.log("ERROR: Empty accessory name, parsing failed.", context);
    }
    return ({
      endpointId: this.endpointID,
      friendlyName: context.name,
      description: context.homebridge + " " + context.name + " " + this.service,
      manufacturerName: context.manufacturer,
      displayCategories: messages.lookupDisplayCategory(this.type),
      cookie: cookie,
      capabilities: capabilities
    });
  } else if (this.service === "Input Source") {
    return ("Input");
  }
};

function normalizeInput(input) {
  var response = input;
  switch (input) {
    case "HDMI1":
    case "HDMI2":
    case "HDMI3":
    case "HDMI4":
      response = "HDMI " + input.substring(4, 5);
      break;
    case "Netflix":
    case "TV NETFLIX":
      response = "HDMI 9";
      break;
  }
  return response;
}
