var debug = require('debug')('messages');

module.exports = {
  lookupCapabilities: lookupCapabilities,
  normalizeName: normalizeName,
  lookupDisplayCategory: lookupDisplayCategory,
  reportState: reportState,
  cookie: cookie,
  cookieV: cookieV,
  isAppleTV: isAppleTV,
  isYamaha: isYamaha,
  atvButton: atvButton,
  playbackNameTranslate: playbackNameTranslate,
  mergeCookies: mergeCookies,
  mergeCapabilities: mergeCapabilities
};

function mergeCookies(into, from) {
  // debug("into", into);
  for (var cookie in from) {
    switch (cookie) {
      case "SetMute":
      case "AdjustVolume":
      case "SetVolume":
        // debug("merge cookie %s = %s into %s", cookie, from[cookie], JSON.stringify(into));
        into[cookie] = from[cookie];
        // debug("after", JSON.stringify(into));
        // into = into.push({cookie: from[cookie]});
        break;
      case "ReportState":
        // debug("merge cookie %s = %s into %s", cookie, from[cookie], JSON.stringify(into[cookie]));
        var temp = [];
        temp.push(JSON.parse(into[cookie]));
        // debug("from", temp);
        temp.push(JSON.parse(from[cookie]));
        into[cookie] = JSON.stringify(temp);
        // debug("after", JSON.stringify(into[cookie]));
        // into[cookie].push(from[cookie]);
        break;
      default:
        // debug("Not merging cookie", cookie);
    }
  }
}

function mergeCapabilities(into, from) {
  for (var capability in from) {
    switch (from[capability].interface) {
      case "Alexa.Speaker":
      case "Alexa.StepSpeaker":
        // debug("merge capability %s = %s into %s", from[capability].interface, JSON.stringify(from[capability]), JSON.stringify(into));
        // into[capability] = from[capability];
        into.push(from[capability]);
        // debug("after", JSON.stringify(into));
        break;
      default:
        // debug("Not merging capability", from[capability].interface);
    }
  }
}

function lookupCapabilities(capability, events, operations) {
  var response = [];

  switch (capability) {
    case "PlaybackController":
      // debug("operations", Object.keys(operations));
      var supported = Object.keys(operations);
      supported = supported.filter(function(item) {
        return item !== 'ReportState';
      });
      // debug("supported", supported);
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.PlaybackController",
        "version": "3",
        "supportedOperations": supported
      });
      break;
    case "ThermostatController":
      // debug("operations", Object.keys(operations));
      var ops = Object.keys(operations);
      // debug("Supp", ops);
      var supported = [];
      ops.forEach(function(key) {
        if (key === "thermostatModeOFF" || key === "upperSetpoint" || key === "lowerSetpoint" || key === "targetSetpoint") {
          if (key.substring(0, 14) === "thermostatMode") {
            key = "thermostatMode";
          }
          supported.push({
            "name": key
          });
        }
      });
      // debug("supported", supported);
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.ThermostatController",
        "version": "3",
        "properties": {
          "supported": supported,
          "proactivelyReported": false,
          "retrievable": true
        },
        "configuration": {
          "supportsScheduling": false,
          "supportedModes": [
            "HEAT",
            "COOL",
            "AUTO",
            "OFF"
          ]
        }
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
    case "Volume Selector":
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
    case "Lock Target State":
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.LockController",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "lockState"
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
    case "Preset":
      response.push({
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
    case "Remote Key": // Current Door state
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.PlaybackController",
        "version": "3",
        "supportedOperations": ["Play", "Pause", "Stop", "Next", "Previous"]
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
    case "00000113": // Speaker Service
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
    case "00000098": // Apple TV
      return ("Apple TV");
    case "000000D8": // Service Television
      return ("Television");
    case "000000D9": // Service "Input Source"
      return ("Input Source");
    default:
      // debug("Missing HB Type", id);
  }
}

function lookupDisplayCategory(service) {
  var category;
  switch (service.substr(0, 8)) {
    case "00000113": // SPEAKER
      category = ["SPEAKER"];
      break;
    case "000000D8": // Service "Television"
    case "00000098": // TV
      category = ["TV"];
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
    case "00000045": // Garage Door
      category = ["SMARTLOCK"];
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
      // debug("No display category for %s using other", service.substr(0, 8));
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

function isAppleTV(device) {
  if (device.info.Manufacturer === "Apple" && device.info.Model === "Apple TV" && atvButton(device.name)) {
    return true;
  } else {
    return false;
  }
}

function isYamaha(device) {
  // debug("DEVICE", device);
  if (device.info.Manufacturer === "yamaha-home" && device.info.Name.substr(0, device.info.Name.indexOf(" ")) === "Spotify" && _yamahaButton(device.name)) {
    return true;
  } else {
    return false;
  }
}

function _yamahaButton(name) {
  switch (name.substr(0, name.lastIndexOf(" "))) {
    // case "Pair":
    case "Skip Fwd":
    case "Skip Rev":
    case "Play":
    case "Pause":
    case "Spotify":
      return true;
      break;
    default:
      return false;
  }
}

function atvButton(name) {
  switch (name.substr(0, name.lastIndexOf(" "))) {
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

function playbackNameTranslate(name) {
  // debug("split", name.substring(0, name.lastIndexOf(" ")));
  switch (name.substring(0, name.lastIndexOf(" "))) {
    case "Menu": // Apple TV
      return "Stop";
    case "Skip Fwd": // Yamaha
      return "Next";
    case "Skip Rev": // Yamaha
      return "Previous";
    default:
      return name.substring(0, name.lastIndexOf(" "));
  }
}
