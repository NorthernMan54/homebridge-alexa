var debug = require('debug')('Characteristic');
var messages = require('./messages.js');

module.exports = {
  Characteristic: Characteristic
};

/*
 * Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
 */

function Characteristic(devices, context) {
  // debug("Characteristic", devices, context);
  this.aid = context.aid;
  this.iid = devices.iid;
  context.liid = devices.iid;
  this.type = devices.type.substring(0, 8);
  this.perms = devices.perms;
  this.value = devices.value;

  // Overide Brightness/Rotation Speed with Volume for Fake speakers
  // debug("Speaker", devices);
  if (context.speakers.some(function(element) {
      // debug("SPEAKER", element.manufacturer === context.info.Manufacturer && element.name === context.info.Name, devices.description);
      return (element.manufacturer === context.info.Manufacturer && element.name === context.info.Name);
    }) && (devices.description === "Brightness" || devices.description === "Rotation Speed")) {
    this.description = "Volume";
  } else {
    this.description = devices.description;
  }

  var cookies = _getCookie(this.description, context);
  this.cookie = cookies.cookie;
  this.reportState = cookies.reportState;
  this.capabilities = messages.lookupCapabilities(this.description, context.events);
  // debug("Cookie %s Capability %s", JSON.stringify(this.cookie), JSON.stringify(this.capabilities));
  this.getCharacteristic = {
    aid: context.aid,
    iid: this.iid
  };
}

function _getCookie(description, context) {
  var cookie = {};
  var reportState = [];
  switch (description) {
    case "Active": // Active on a Fan 2 aka Dyson or Valve
    case "On": // Accessory On/Off
      reportState.push(messages.reportState("Alexa.PowerController", context));
      cookie["TurnOn"] = messages.cookieV(1, context);
      cookie["TurnOff"] = messages.cookieV(0, context);
      break;
    case "Rotation Speed": // RotationSpeed
    case "Brightness": // Brightness
      reportState.push(messages.reportState("Alexa.PowerLevelController", context));
      cookie["AdjustPowerLevel"] = messages.cookie(context);
      cookie["SetPowerLevel"] = messages.cookie(context);
      break;
    case "Current Temperature": // Current Temperature
      reportState.push(messages.reportState("Alexa.TemperatureSensor", context));
      break;
    case "Motion Detected": // Motion sensor state
      reportState.push(messages.reportState("Alexa.MotionSensor", context));
      break;
    case "Current Door State": // Current Door state
    case "Current Position": // Current Door state
      reportState.push(messages.reportState("Alexa.ContactSensor", context));
      break;
    case "Target Door State": // TargetDoorState
      reportState.push(messages.reportState("Alexa.PowerController", context));
      cookie["TurnOn"] = messages.cookieV(0, context); // Open
      cookie["TurnOff"] = messages.cookieV(1, context); // Closed
      break;
    case "Contact Sensor State": // Contact Sensor State
      reportState.push(messages.reportState("Alexa.ContactSensor", context));
      break;
    case "Color Temperature": // Color Temperature
      reportState.push(messages.reportState("Alexa.ColorTemperatureController", context));
      cookie["IncreaseColorTemperature"] = messages.cookie(context);
      cookie["DecreaseColorTemperature"] = messages.cookie(context);
      cookie["SetColorTemperature"] = messages.cookie(context);
      break;
    case "Target Position": // WindowCoverings Target Position
      reportState.push(messages.reportState("Alexa.PowerController", context));
      reportState.push(messages.reportState("Alexa.PowerLevelController", context));
      cookie["TurnOn"] = messages.cookieV(100, context);
      cookie["TurnOff"] = messages.cookieV(0, context);
      cookie["AdjustPowerLevel"] = messages.cookie(context);
      cookie["SetPowerLevel"] = messages.cookie(context);
      break;
    case "Volume": // Speaker volume
    // case "91288267": // This is in the homebridge-bose-soundtouch plugin
      reportState.push(messages.reportState("Alexa.Speaker", context));
      cookie["AdjustVolume"] = messages.cookie(context);
      cookie["SetVolume"] = messages.cookie(context);
      cookie["SetMute"] = messages.cookie(context);
      break;
    default:
      // debug("Missing Characteristic '%s' %s - %s", description, context.name, context.function);
  }
  return ({
    cookie: cookie,
    reportState: reportState
  });
}
