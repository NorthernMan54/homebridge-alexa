"use strict";

var debug = require('debug')('messageUtil');

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
  round: _round
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
        "version": "3",
        "properties": {}
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
      console.log("ERROR: alexaTranslator - Missing capability", capability);
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
  // debug("hbResponse", hbResponse);
  // Convert each individual HAP hbResponse to Alexa Format
  reportState.forEach(function(element) {
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
          "value": _getValue(element, hbResponse).value ? "NOT_DETECTED" : "DETECTED",
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
      case "alexa.thermostatcontroller":
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
      default:
        console.log("ERROR: statusReport unknown/handled device", element, reportState);
    }
  });

  return properties;
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

function endpointID(host, port, aid, iid) {
  var response = new Buffer(host + ":" +
    port + ",aid: " + aid.toString() + ",iid: " + iid.toString()).toString('base64');
  return (response);
}
