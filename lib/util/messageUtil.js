"use strict";

var debug = require('debug')('alexaMessageUtil');

module.exports = {
  atvNameTranslate: atvNameTranslate,
  yamahaTranslate: yamahaTranslate,
  fixHapName: fixHapName,
  lookupCapabilities: lookupCapabilities,
  lookupDisplayCategory: lookupDisplayCategory,
  lookupFriendlyDisplayCategory: lookupFriendlyDisplayCategory,
  endPoints: endPoints,
  createMessageId: createMessageId,
  StateToProperties: StateToProperties,
  endpointID: endpointID,
  round: _round,
  combine: combine,
  inputs: inputs,
  channel: channel
};

function atvNameTranslate(name) {
  switch (name.split("(")[0].split(" ")[0]) {
    case "Menu":
      return "Stop";
    default:
      return name.split("(")[0].split(" ")[0];
  }
}

function yamahaTranslate(name) {
  // Yamaha - "Spotify Play", "Spotify Pause", "Spotify Skip Fwd", "Spotify Skip Rev"
  // Alexa  - "Play", "Pause", "Stop", "Skip", "Rewind"
  debug("Yamaha name translate %s == %s", name, name.split(" ")[1] + " " + name.split(" ")[2]);
  switch (name.split(" ")[1] + " " + name.split(" ")[2]) {
    case "Skip Fwd":
      return "Next";
    case "Skip Rev":
      return "Rewind";
    default:
      return name.split(" ")[1];
  }
}

function fixHapName(hapName) {
  if (hapName.substring(hapName.length - 5, hapName.length - 4) === "-") {
    return (hapName.substring(0, hapName.length - 5));
  } else {
    return (hapName);
  }
}

function lookupCapabilities(capability, events) {
  var response;
  switch (capability) {
    case "ATVPlaybackController":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.PlaybackController",
        "version": "3",
        "supportedOperations": ["Play", "Pause", "Stop"]
      };
      break;
    case "YamahaPlaybackController":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.PlaybackController",
        "version": "3",
        "supportedOperations": ["Play", "Pause", "Stop", "Next", "Rewind"]
      };
      break;
    case "Speaker":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.Speaker",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "volume"
          }],
          "proactivelyReported": false,
          "retrievable": true
        }
      };
      break;
    case "StepSpeaker":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.StepSpeaker",
        "version": "3"
      };
      break;
    case "ColorTemperatureController":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.ColorTemperatureController",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "colorTemperatureInKelvin"
          }],
          "proactivelyReported": false,
          "retrievable": true
        }
      };
      break;
    case "ColorController":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.ColorController",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "color"
          }],
          "proactivelyReported": false,
          "retrievable": true
        }
      };
      break;
    case "PowerLevelController":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.PowerLevelController",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "powerLevel"
          }],
          "proactivelyReported": false,
          "retrievable": true
        }
      };
      break;
    case "PowerController":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.PowerController",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "powerState"
          }],
          "proactivelyReported": false,
          "retrievable": true
        }
      };
      break;
    case "TemperatureSensor":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.TemperatureSensor",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "temperature"
          }],
          "proactivelyReported": events,
          "retrievable": true
        }
      };
      break;
    case "MotionSensor":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.MotionSensor",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "detectionState"
          }],
          "proactivelyReported": events,
          "retrievable": true
        }
      };
      break;
    case "ContactSensor":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.ContactSensor",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "detectionState"
          }],
          "proactivelyReported": events,
          "retrievable": true
        }
      };
      break;
    case "ThermostatController":
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.ThermostatController",
        "version": "3",
        "properties": {
          "supported": [{
              "name": "targetSetpoint"
            },
            {
              "name": "thermostatMode"
            }
          ],
          "proactivelyReported": false,
          "retrievable": true
        }
      };
      break;
    default:
      // Missing capabilities
      debug("ERROR: alexaTranslator - Missing capability", capability);
      response = {
        "type": "AlexaInterface",
        "interface": "Alexa.TemperatureSensor",
        "version": "3"
      };
      break;
  }
  return response;
}

function lookupDisplayCategory(service) {
  var category;
  switch (service.substr(0, 8)) {
    case "00000113": // SPEAKER
      category = ["SPEAKER"];
      break;
    case "00000043": // lightbulb
      category = ["LIGHT"];
      break;
    case "0000008C": // Window Covering
    case "00000040": // Fan
    case "000000B7": // Fan2
    case "000000D0": // Valve / Sprinkler
      category = ["OTHER"];
      break;
    case "00000041": // Garage Door
      category = ["DOOR"];
      break;
    case "00000047":
      // Outlet
      category = ["SMARTPLUG"];
      break;
    case "00000049":
      // Switch
      category = ["SWITCH"];
      break;
    case "0000008A":
      category = ["TEMPERATURE_SENSOR"];
      break;
    case "00000080":
      category = ["CONTACT_SENSOR"];
      break;
    case "00000085":
      category = ["MOTION_SENSOR"];
      break;
    case "0000004A":
    case "000000BC":
      category = ["THERMOSTAT"];
      break;
    default:
      // No mapping exists
      category = ["OTHER"];
      break;
  }
  return category;
}

function lookupFriendlyDisplayCategory(service) {
  var category;
  switch (service.substr(0, 8)) {
    case "00000113": // SPEAKER
      category = "Speaker";
      break;
    case "00000043": // lightbulb
      category = "Light";
      break;
    case "0000008C": // Window Covering
      category = "Blinds";
      break;
    case "00000041":
      category = "Garage Door";
      break;
    case "000000D0": // Valve
      category = "Valve";
      break;
    case "00000040": // Fan
    case "000000B7": // Fan2
      category = "Fan";
      break;
    case "00000047":
      // Outlet
      category = "Outlet";
      break;
    case "00000049":
      // Switch
      category = "Switch";
      break;
    case "0000008A":
      category = "Temperature Sensor";
      break;
    case "00000080":
      category = "Contact Sensor";
      break;
    case "00000085":
      category = "Motion Sensor";
      break;
    case "0000004A":
      category = "Thermostat";
      break;
    case "000000BC":
      category = "Heater/Cooler";
      break;
    default:
      // No mapping exists
      category = "Other " + service.substr(0, 8);
      break;
  }
  return category;
}

function endPoints(discovered) {
  var listOfDevices = [];
  for (var id in discovered) {
    var devices = discovered[id];
    for (var did in devices) {
      var item = {};
      var device = devices[did];
      item["endpointId"] = device.endpointId;
      item["friendlyName"] = device.friendlyName;
      item["description"] = device.description;
      item["manufacturerName"] = device.manufacturerName;
      item["displayCategories"] = device.displayCategories;
      item["cookie"] = device.cookie;
      item["capabilities"] = device.capabilities;
      listOfDevices.push(item);
    }
  }
  listOfDevices.sort((a, b) => (a.endpointId > b.endpointId) ? 1 : ((b.endpointId > a.endpointId) ? -1 : 0));
  return (listOfDevices);
}

function _getValue(element, hbResponse) {
  var value;
  if (element.interface.toLowerCase() === "alexa.colorcontroller") {
    value = {
      "hue": _round(_getHBValue(element.hue, hbResponse).value, 1),
      "saturation": _round(_getHBValue(element.saturation, hbResponse).value / 100, 4),
      "brightness": _round(_getHBValue(element.brightness, hbResponse).value / 100, 4)
    };
    debug("Color Value", value);
    return {
      "value": value,
      "status": 0
    };
  } else {
    return _getHBValue(element, hbResponse);
  }
}

function _getHBValue(element, hbResponse) {
  var value, status;
  for (var i in hbResponse) {
    if (hbResponse[i].aid === element.aid && hbResponse[i].iid === element.iid) {
      value = hbResponse[i].value;
      status = hbResponse[i].status;
      break;
    }
  }
  return {
    "value": value,
    "status": status
  };
}

function StateToProperties(reportState, hbResponse) {
  var properties = [];
  var now = new Date();
  debug("StateToProperties - hbResponse", hbResponse);
  // Convert each individual HAP hbResponse to Alexa Format
  reportState.forEach(function(element) {
    debug("StateToProperties - element", element);
    switch (element.interface.toLowerCase()) {
      case "alexa.speaker":
        properties.push({
          "namespace": "Alexa.Speaker",
          "name": "volume",
          "value": _round(_getValue(element, hbResponse).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        properties.push({
          "namespace": "Alexa.Speaker",
          "name": "muted",
          "value": false,
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.stepspeaker":
        // No response needed
        break;
      case "alexa.powercontroller":
        properties.push({
          "namespace": "Alexa.PowerController",
          "name": "powerState",
          "value": _getValue(element, hbResponse).value ? "ON" : "OFF",
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.powerlevelcontroller":
        properties.push({
          "namespace": "Alexa.PowerLevelController",
          "name": "powerLevel",
          "value": _round(_getValue(element, hbResponse).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.colortemperaturecontroller":
        properties.push({
          "namespace": "Alexa.ColorTemperatureController",
          "name": "colorTemperatureInKelvin",
          "value": _round(1000000 / _getValue(element, hbResponse).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.colorcontroller":
        properties.push({
          "namespace": "Alexa.ColorController",
          "name": "color",
          "value": _getValue(element, hbResponse).value,
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.temperaturesensor":
        properties.push({
          "namespace": "Alexa.TemperatureSensor",
          "name": "temperature",
          "value": {
            "value": _round(_getValue(element, hbResponse).value, 1),
            "scale": "CELSIUS"
          },
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.contactsensor":

        /*
          {
            "namespace": "Alexa.ContactSensor",
            "name": "detectionState",
            "value": "DETECTED",
            "timeOfSample": "2017-02-03T16:20:50.52Z",
            "uncertaintyInMilliseconds": 0
          }
        */

        properties.push({
          "namespace": "Alexa.ContactSensor",
          "name": "detectionState",
          "value": _getValue(element, hbResponse).value ? "DETECTED" : "NOT_DETECTED",
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.motionsensor":
        properties.push({
          "namespace": "Alexa.MotionSensor",
          "name": "detectionState",
          "value": _getValue(element, hbResponse).value ? "DETECTED" : "NOT_DETECTED",
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
        // Characteristic.LockCurrentState.UNSECURED = 0;
        // Characteristic.LockCurrentState.SECURED = 1;
        // Characteristic.LockCurrentState.JAMMED = 2;
        // Characteristic.LockCurrentState.UNKNOWN = 3;
      case "alexa.lockcontroller":
        properties.push({
          "namespace": "Alexa.LockController",
          "name": "lockState",
          "value": _lockState(_getValue(element, hbResponse).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.thermostatcontrollertargetsetpoint":
        properties.push({
          "namespace": "Alexa.ThermostatController",
          "name": "targetSetpoint",
          "value": {
            "value": _getValue(element, hbResponse).value,
            "scale": "CELSIUS"
          },
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.thermostatcontrollerlowersetpoint":
        properties.push({
          "namespace": "Alexa.ThermostatController",
          "name": "lowerSetpoint",
          "value": {
            "value": _getValue(element, hbResponse).value,
            "scale": "CELSIUS"
          },
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.thermostatcontrolleruppersetpoint":
        properties.push({
          "namespace": "Alexa.ThermostatController",
          "name": "upperSetpoint",
          "value": {
            "value": _getValue(element, hbResponse).value,
            "scale": "CELSIUS"
          },
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.thermostatcontrollerthermostatmode":
        properties.push({
          "namespace": "Alexa.ThermostatController",
          "name": "thermostatMode",
          "value": _getMode(_getValue(element, hbResponse).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      default:
        debug("ERROR: statusReport unknown/handled device", element, reportState);
    }
  });

  return properties;
}

function _lockState(state) {
  // Characteristic.LockCurrentState.UNSECURED = 0;
  // Characteristic.LockCurrentState.SECURED = 1;
  // Characteristic.LockCurrentState.JAMMED = 2;
  // Characteristic.LockCurrentState.UNKNOWN = 3;
  switch (state) {
    case 0:
      return "UNLOCKED";
    case 1:
      return "LOCKED";
    default:
      return "JAMMED";
  }
}

function createMessageId() {
  var d = new Date().getTime();

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

  return uuid;
}

function _round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function endpointID(instance, manufacturer, name, service) {
  var response = Buffer.from(instance.instance.txt.id + "-" + instance.instance.txt.md + "-" + manufacturer + "-" + name + "-" + service).toString('base64');
  // var response = new Buffer(instance.instance.txt.id + "-" + instance.instance.txt.md + "-" + manufacturer + "-" + name + "-" + service).toString('base64');
  // debug("endpointID", instance.instance.txt.id + "-" + instance.instance.txt.md + "-" + manufacturer + "-" + name);
  return (response);
}

function insertInputCapability(input, inputs, cookies, accessories) {
  //
  for (var endpoint in accessories.event.payload.endpoints) {
    if (input.into === accessories.event.payload.endpoints[endpoint].friendlyName) {
      accessories.event.payload.endpoints[endpoint].capabilities.push({
        type: "AlexaInterface",
        interface: "Alexa.InputController",
        version: "3",
        properties: {
          supported: [{
            name: "input"
          }],
          proactivelyReported: false,
          retrievable: true
        },
        inputs: inputs
      });
      // debug("Cookies", cookies);
      accessories.event.payload.endpoints[endpoint].cookie =
        Object.assign({}, accessories.event.payload.endpoints[endpoint].cookie, cookies);
    }
  }

  return (accessories);
}

function insertChannelCapability(input, cookies, accessories) {
  //
  // debug("Accessories", accessories);
  for (var endpoint in accessories.event.payload.endpoints) {
    if (input.into === accessories.event.payload.endpoints[endpoint].friendlyName) {
      accessories.event.payload.endpoints[endpoint].capabilities.push({
        "type": "AlexaInterface",
        "interface": "Alexa.ChannelController",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "channel"
          }],
          "proactivelyReported": false,
          "retrievable": true
        }
      });

      accessories.event.payload.endpoints[endpoint].cookie =
        Object.assign({}, accessories.event.payload.endpoints[endpoint].cookie, cookies);
      // debug("Cookies", accessories.event.payload.endpoints[endpoint].cookie);
    }
  }

  return (accessories);
}

function getCookie(device, accessories) {
  var cookie = {};
  for (var endpoint in accessories.event.payload.endpoints) {
    if (device.name === accessories.event.payload.endpoints[endpoint].friendlyName &&
      device.manufacturer === accessories.event.payload.endpoints[endpoint].manufacturerName) {
      // debug(accessories.event.payload.endpoints[endpoint].cookie);
      if (accessories.event.payload.endpoints[endpoint].cookie.TurnOn) {
        cookie[device.alexaName] = accessories.event.payload.endpoints[endpoint].cookie.TurnOn;
        return (cookie);
      }
    }
  }
}

/*
{
  "type": "AlexaInterface",
  "interface": "Alexa.InputController",
  "version": "3",
  "properties": {
    "supported": [
      {
        "name": "input"
      }
    ],
    "proactivelyReported": true,
    "retrievable": true
  },
  "inputs": [
    {
      "name": "HDMI 1"
    },
    {
      "name": "HDMI 2"
    }
  ]
}
*/

function inputs(options, accessories) {
  // Create input controller Object

  options.inputs.forEach(function(input) {
    // debug("Input", input);
    var inputs = [];
    var cookies = {};

    // Find endpoint that should be part of the input

    input.devices.forEach(function(device) {
      // debug("Device", device);

      cookies = Object.assign(cookies, getCookie(device, accessories));

      inputs.push({
        name: device.alexaName
      });
    });

    accessories = insertInputCapability(input, inputs, cookies, accessories);
  });

  return (accessories);
}

function channel(options, accessories) {
  // Create input controller Object

  options.channel.forEach(function(input) {
    // debug("Input", input);
    var inputs = [];
    var cookies = {};

    // Find endpoint that should be part of the input

    /*
    input.devices.forEach(function(device) {
      // debug("Device", device);

      cookies = Object.assign(cookies, getCookie(device, accessories));

      inputs.push({
        name: device.alexaName
      });
    });
    */
    input.alexaName = "ChangeChannel";
    // debug("Input", input);
    cookies = Object.assign(cookies, getCookie(input, accessories));
    // debug("cookies", cookies);
    accessories = insertChannelCapability(input, cookies, accessories);
  });

  return (accessories);
}

function combine(options, accessories) {
  var cleanup = [];
  var combine = [];
  // debug("Combine", Array.isArray(options.combine), options.combine);
  if (!Array.isArray(options.combine)) {
    combine.push(options.combine);
  } else {
    combine = options.combine;
  }
  // debug("Combine-2", Array.isArray(combine), combine);
  combine.forEach(function(combine) {
    // var combine = options.combine;

    var from = [];
    var target;

    // if (combine.into && combine.from) {
    // debug("endpoints", combine, accessories.event.payload.endpoints);
    for (var endpoint in accessories.event.payload.endpoints) {
      // debug(endpoint);
      // debug("endpoints", combine, accessories.event.payload.endpoints[endpoint].friendlyName);
      if (combine.into === accessories.event.payload.endpoints[endpoint].friendlyName) {
        target = endpoint;
      }
      if (combine.from[0] === accessories.event.payload.endpoints[endpoint].friendlyName) {
        from.push(accessories.event.payload.endpoints[endpoint]);
        cleanup.push(endpoint);
        // delete accessories.event.payload.endpoints[endpoint];
      }
    }

    if (from && accessories.event.payload.endpoints[target]) {
      // debug("Combine", accessories.event.payload.endpoints[target], from);
      _combineAlexaDevices(accessories.event.payload.endpoints[target], from);
      // console.log('\n', JSON.stringify(accessories));
    } else {
      // console.log("ERROR: Combine files from %s to %s", from, accessories.event.payload.endpoints[target]);
    }
    //  } else {
    //    console.log("ERROR: combine settings problem");
  });
  if (cleanup.length > 0) {
    cleanup.forEach(function(endpoint) {
      delete accessories.event.payload.endpoints[endpoint];
    });
    // debug(JSON.stringify(accessories.event.payload.endpoints));
    accessories.event.payload.endpoints = accessories.event.payload.endpoints.filter(function(e) {
      return e;
    });
  }
  // debug("Combine complete");
  return (accessories);
}

function _getMode(mode) {
  // Characteristic.CurrentHeatingCoolingState.OFF = 0;
  // Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  // Characteristic.CurrentHeatingCoolingState.COOL = 2;
  switch (mode) {
    case 0:
      return "OFF";
    case 1:
      return "HEAT";
    case 2:
      return "COOL";
    case 3:
      return "AUTO";
  }
}

function _combineAlexaDevices(into, from) {
  from.forEach(function(device) {
    // debug('\nFrom', device.friendlyName);
    // Combine Cookies
    for (var cookie in device.cookie) {
      if (!into.cookie[cookie] && cookie !== 'ReportState') {
        // debug('Combining', device.friendlyName, cookie);
        into.cookie[cookie] = device.cookie[cookie];
      } else if (cookie === 'ReportState') {
        // debug('Combining ReportState', device.friendlyName, device.cookie[cookie]);
        var cookieReportState = JSON.parse(device.cookie[cookie]);

        var before = JSON.parse(into.cookie[cookie]);
        // debug('Report state before', before);
        for (var reportState in cookieReportState) {
          // debug('Combining', device.friendlyName, cookie, cookieReportState[reportState].interface);
          before.push(cookieReportState[reportState]);
        }
        into.cookie[cookie] = JSON.stringify(before);
      } else {
        // debug('ERROR: duplicate cookie', device.friendlyName, cookie);
      }
    } // Finshed combining cookies, now need to combine capabilities
    // Combine capabilities
    device.capabilities.forEach(function(capability) {
      if (capability.interface !== 'Alexa') {
        // debug('Combining capability', device.friendlyName, capability.interface);
        into.capabilities.push(capability);
      }
    });
  });
  // debug('\nAfter', JSON.stringify(into, null, 4));
}
