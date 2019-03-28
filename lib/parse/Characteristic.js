var debug = require('debug')('Characteristic');
var messages = require('./messages.js');

module.exports = {
  Characteristic: Characteristic
};

/*
 * Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
 */

function Characteristic(devices, context) {
  // debug("Characteristic", devices);
  this.iid = devices.iid;
  context.liid = devices.iid;
  this.type = devices.type.substring(0, 8);
  this.perms = devices.perms;
  this.value = devices.value;
  this.description = devices.description;
  this.characteristic = {};
  this.getCharacteristic = context.aid + '.' + this.iid;
  this.characteristic[this.getCharacteristic] = {
    characteristic: devices.description.replace(/ /g, "").replace(/\./g, "_"),
    iid: this.iid
  };
  this.eventRegister = {
    aid: context.aid,
    iid: this.iid,
    "ev": true
  };
  // Alexa
  var cookies = _getCookie(this.description, context);
  this.cookie = cookies.cookie;
  this.reportState = cookies.reportState;
  this.capabilities = messages.lookupCapabilities(this.description, context.events);
}

function _getCookie(description, context) {
  var cookie = {};
  var reportState;
  switch (description) {
    case "On": // Accessory On/Off
      reportState = _reportState("Alexa.PowerController", context);
      cookie["TurnOn"] = _cookieV(1, context);
      cookie["TurnOff"] = _cookieV(0, context);
      break;
    case "00000029": // RotationSpeed
    case "Brightness": // Brightness
      reportState = _reportState("Alexa.PowerLevelController", context);
      cookie["AdjustPowerLevel"] = _cookie(context);
      cookie["SetPowerLevel"] = _cookie(context);
      break;
    case "Current Temperature": // Current Temperature
      reportState = _reportState("Alexa.TemperatureSensor", context);
      break;
    case "Motion Detected": // Motion sensor state
      reportState = _reportState("Alexa.MotionSensor", context);
      break;
    case "Current Door State": // Current Door state
      reportState = _reportState("Alexa.ContactSensor", context);
      break;
    case "Target Door State": // TargetDoorState
      reportState = _reportState("Alexa.PowerController", context);
      cookie["TurnOn"] = _cookieV(0, context); // Open
      cookie["TurnOff"] = _cookieV(1, context); // Closed
      break;
    case "0000006A": // Contact Sensor State
      reportState = _reportState("Alexa.ContactSensor", context);
      break;
    case "000000B0": // Active on a Fan 2 aka Dyson or Valve
      cookie["TurnOn"] = _cookieV(1, context);
      cookie["TurnOff"] = _cookieV(0, context);
      reportState = _reportState("Alexa.PowerController", context);
      break;
    default:
      debug("Missing Characteristic '%s' %s - %s", description, context.name, context.function);
  }
  return ({
    cookie: cookie,
    reportState: reportState
  });
}

function _reportState(_interface, context) {
  return {
    "interface": _interface,
    "host": context.host,
    "port": context.port,
    "aid": context.aid,
    "iid": context.liid
  };
}

function _cookie(context) {
  return JSON.stringify({
    "host": context.host,
    "port": context.port,
    "aid": context.aid,
    "iid": context.liid
  });
}

function _cookieV(_value, context) {
  return JSON.stringify({
    "host": context.host,
    "port": context.port,
    "aid": context.aid,
    "iid": context.liid,
    "value": _value
  });
}
