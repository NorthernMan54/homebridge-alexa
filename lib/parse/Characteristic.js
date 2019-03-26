var debug = require('debug')('Characteristic');
// var Service = require('./Service.js').Service;

module.exports = {
  Characteristic: Characteristic
};

/*
 * Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
 */

function Characteristic(devices, context) {
  debug("Characteristic", devices);
  this.iid = devices.iid;
  this.type = devices.type.substring(0, 8);
  this.perms = devices.perms;
  this.value = devices.value;
  this.description = devices.description;
  this.characteristic = {};
  this.getCharacteristic = context.aid + '.' + this.iid;
  this.cookie = _getCookie(this.type, context);
  this.capabilities = _lookupCapabilities(this.type, context.events);
  this.characteristic[this.getCharacteristic] = {
    characteristic: devices.description.replace(/ /g, "").replace(/\./g, "_"),
    iid: this.iid
  };
  this.eventRegister = {
    aid: context.aid,
    iid: this.iid,
    "ev": true
  };
}

function _lookupCapabilities(capability, events) {
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
    case "00000029": // RotationSpeed
    case "00000008": // Brightness
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
    case "00000025":
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
    case "00000011":
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

function _getCookie(type, context) {
  var cookie = {};
  switch (type) {
    case "00000025":
      // ReportState.push(_reportState("Alexa.PowerController"));
      cookie["TurnOn"] = _cookieV(1, context);
      cookie["TurnOff"] = _cookieV(0, context);
      // capabilities.push(messageUtil.lookupCapabilities("PowerController", events));
      break;
      case "00000029": // RotationSpeed
      case "00000008": // Brightness
      // ReportState.push(_reportState("Alexa.PowerController"));
      cookie["TurnOn"] = _cookie(context);
      cookie["TurnOff"] = _cookie(context);
      // capabilities.push(messageUtil.lookupCapabilities("PowerController", events));
      break;
    default:
      debug("Missing Cookie", type, context.name);
  }
  return (cookie);
}

function _cookie(context) {
  return JSON.stringify({
    "host": context.host,
    "port": context.port,
    "aid": context.aid,
    "iid": context.iid
  });
}

function _cookieV(_value, context) {
  return JSON.stringify({
    "host": context.host,
    "port": context.port,
    "aid": context.aid,
    "iid": context.iid,
    "value": _value
  });
}
