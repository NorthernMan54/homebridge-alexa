var debug = require('debug')('Characteristic');
var messages = require('./messages.js');

module.exports = {
  Characteristic: Characteristic
};

/*
 * Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
 */

function Characteristic(devices, context) {
  debug("Characteristic", devices);
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
  var cookies = _getCookie(this.type, context);
  this.cookie = cookies.cookie;
  this.reportState = cookies.reportState;
  this.capabilities = messages.lookupCapabilities(this.type, context.events);
}

function _getCookie(type, context) {
  var cookie = {};
  var reportState;
  switch (type) {
    case "00000025":
      reportState = _reportState("Alexa.PowerController", context);
      cookie["TurnOn"] = _cookieV(1, context);
      cookie["TurnOff"] = _cookieV(0, context);
      break;
    case "00000029": // RotationSpeed
    case "00000008": // Brightness
      reportState = _reportState("Alexa.PowerLevelController", context);
      cookie["AdjustPowerLevel"] = _cookie(context);
      cookie["SetPowerLevel"] = _cookie(context);
      break;
    default:
      debug("Missing Cookie", type, context.name);
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
