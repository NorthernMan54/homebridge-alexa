var debug = require('debug')('messages');

module.exports = {
  lookupCapabilities: lookupCapabilities,
  normalizeName: normalizeName,
  lookupDisplayCategory: lookupDisplayCategory,
  reportState: reportState,
  cookie: cookie,
  cookieV: cookieV,
  atvButton: atvButton,
  atvNameTranslate: atvNameTranslate
};

function lookupCapabilities(capability, events) {
  var response = [];
  switch (capability) {
    case "ATVPlaybackController":
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.PlaybackController",
        "version": "3",
        "supportedOperations": ["Play", "Pause", "Stop"]
      });
      break;
    case "YamahaPlaybackController":
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.PlaybackController",
        "version": "3",
        "supportedOperations": ["Play", "Pause", "Stop", "Next", "Rewind"]
      });
      break;
    case "Volume":
      response.push({
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
      });
      break;
    case "StepSpeaker":
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.StepSpeaker",
        "version": "3",
        "properties": {}
      });
      break;
    case "Color Temperature":
      response.push({
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
      });
      break;
    case "ColorController":
      response.push({
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
      });
      break;
    case "Rotation Speed": // RotationSpeed
    case "Brightness": // Brightness
      response.push({
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
      });
      break;
    case "Target Position":
      response.push({
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
      });
      response.push({
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
      });
      break;
    case "Active": // Active on a Fan 2 aka Dyson or Valve
    case "Target Door State":
    case "On":
      response.push({
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
      });
      break;
    case "Current Temperature":
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.TemperatureSensor",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "temperature"
          }],
          "proactivelyReported": false,
          "retrievable": true
        }
      });
      break;
    case "Motion Detected":
      response.push({
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
      });
      break;
    case "Contact Sensor State": // Contact Sensor State
    case "Current Position":
    case "Current Door State": // Current Door state
      response.push({
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
      });
      break;
    case "ThermostatController":
      response.push({
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
      });
      break;
    default:
      // Missing capabilities
      // debug("ERROR: Missing capability", capability);
      break;
  }
  return response;
}

function normalizeName(id) {
  switch (id) {
    case "0000003E":
      return ("Accessory Information");
    case "000000BB":
      return ("Air Purifier");
    case "0000008D":
      return ("Air Quality Sensor");
    case "00000096":
      return ("Battery Service");
    case "00000097":
      return ("Carbon Dioxide Sensor");
    case "0000007F":
      return ("Carbon Monoxide Sensor");
    case "00000080":
      return ("Contact Sensor");
    case "00000081":
      return ("Door");
    case "00000121":
      return ("Doorbell");
    case "00000040":
      return ("Fan");
    case "000000B7":
      return ("Fan v2");
    case "000000BA":
      return ("Filter Maintenance");
    case "000000D7":
      return ("Faucet");
    case "00000041":
      return ("Garage Door Opener");
    case "000000BC":
      return ("Heater Cooler");
    case "000000BD":
      return ("Humidifier Dehumidifier");
    case "00000082":
      return ("Humidity Sensor");
    case "000000CF":
      return ("Irrigation System");
    case "00000083":
      return ("Leak Sensor");
    case "00000084":
      return ("Light Sensor");
    case "00000043":
      return ("Lightbulb");
    case "00000044":
      return ("Lock Management");
    case "00000045":
      return ("Lock Mechanism");
    case "00000112":
      return ("Microphone");
    case "00000085":
      return ("Motion Sensor");
    case "00000086":
      return ("Occupancy Sensor");
    case "00000047":
      return ("Outlet");
    case "0000007E":
      return ("Security System");
    case "000000CC":
      return ("Service Label");
    case "000000B9":
      return ("Slat");
    case "00000087":
      return ("Smoke Sensor");
    case "00000113":          // Speaker Service
      return ("Speaker");
    case "00000089":
      return ("Stateless Programmable Switch");
    case "00000049":
      return ("Switch");
    case "0000008A":
      return ("Temperature Sensor");
    case "0000004A":
      return ("Thermostat");
    case "000000D0":
      return ("Valve");
    case "0000008B":
      return ("Window");
    case "0000008C":
      return ("Window Covering");
    case "00000111":
      return ("Camera");
    default:
      debug("Missing HB Type", id);
  }
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

function reportState(_interface, context) {
  return {
    "interface": _interface,
    "host": context.host,
    "port": context.port,
    "aid": context.aid,
    "iid": context.liid
  };
}

function cookie(context) {
  return JSON.stringify({
    "host": context.host,
    "port": context.port,
    "aid": context.aid,
    "iid": context.liid
  });
}

function cookieV(_value, context) {
  return JSON.stringify({
    "host": context.host,
    "port": context.port,
    "aid": context.aid,
    "iid": context.liid,
    "value": _value
  });
}

function atvButton(name) {
  switch (name.substr(0, name.indexOf(" "))) {
    // case "Pair":
    case "Menu":
    case "TV/Home":
    case "Mic/Siri":
    case "Play":
    case "Pause":
    case "Up":
    case "Down":
    case "Left":
    case "Right":
    case "Select":
    case "Sleep":
      return true;
      break;
    default:
      return false;
  }
}

function atvNameTranslate(name) {
  switch (name.split("(")[0].split(" ")[0]) {
    case "Menu":
      return "Stop";
    default:
      return name.split("(")[0].split(" ")[0];
  }
}
