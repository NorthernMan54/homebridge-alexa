var debug = require('debug')('alexaResponse');

module.exports = {
  lookupCapabilities: lookupCapabilities
};

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
      break;
  }
  return response;
}
