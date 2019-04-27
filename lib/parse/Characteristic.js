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
  if (context.speakers && context.speakers.some(function(element) {
      // debug("SPEAKER", element.manufacturer === context.info.Manufacturer && element.name === context.info.Name, devices.description);
      return (element.manufacturer === context.info.Manufacturer && element.name === context.info.Name);
    }) && (devices.description === "Brightness" || devices.description === "Rotation Speed")) {
    this.type = "00000119"; // Volume Characteristic
    this.description = "Volume";
  } else {
    this.description = devices.description;
  }

  var actions = _getActions(this.description, context);
  this.cookie = actions.cookie;
  this.reportState = actions.reportState;
  this.capabilities = messages.lookupCapabilities(this.description, context.events);
  this.hapEvents = actions.hapEvents;
  // debug("%s %s Cookie %s Capability %s", context.name, this.iid, JSON.stringify(this.cookie), JSON.stringify(this.capabilities));
  this.getCharacteristic = {
    aid: context.aid,
    iid: this.iid
  };
}

function _getActions(description, context) {
  var cookie = {};
  var reportState = [];
  var hapEvents = [];
  switch (description) {
    case "Active": // Active on a Fan 2 aka Dyson or Valve
    case "On": // Accessory On/Off
      // debug("On/Active", context.name);
      reportState.push(messages.reportState("Alexa.PowerController", context));
      cookie["TurnOn"] = messages.cookieV(1, context);
      cookie["TurnOff"] = messages.cookieV(0, context);
      break;
    case "Rotation Speed": // RotationSpeed
      reportState.push(messages.reportState("Alexa.PowerLevelController", context));
      cookie["AdjustPowerLevel"] = messages.cookie(context);
      cookie["SetPowerLevel"] = messages.cookie(context);
      break;
    case "Brightness": // Brightness
      reportState.push(messages.reportState("Alexa.PowerLevelController", context));
      cookie["AdjustPowerLevel"] = messages.cookie(context);
      cookie["SetPowerLevel"] = messages.cookie(context);
      cookie["BrightnessTurnOn"] = "true";
      break;
    case "Current Temperature": // Current Temperature
      reportState.push(messages.reportState("Alexa.TemperatureSensor", context));
      break;
    case "Motion Detected": // Motion sensor state
      reportState.push(messages.reportState("Alexa.MotionSensor", context));
      hapEvents[JSON.stringify({
        "host": context.host,
        "port": context.port,
        "aid": context.aid,
        "iid": context.liid
      })] = {
        "endpointID": context.endpointID,
        "true": "DETECTED",
        "false": "NOT_DETECTED",
        "template": "MotionSensor"
      };
      break;
    case "Current Door State": // Current Door state
    case "Current Position": // Current Door state
      reportState.push(messages.reportState("Alexa.ContactSensor", context));
      // The value property of CurrentDoorState must be one of the following:
      // Characteristic.CurrentDoorState.OPEN = 0;
      // Characteristic.CurrentDoorState.CLOSED = 1;
      // Characteristic.CurrentDoorState.OPENING = 2;
      // Characteristic.CurrentDoorState.CLOSING = 3;
      // Characteristic.CurrentDoorState.STOPPED = 4;
      //
      // Validated againt door states

      hapEvents[JSON.stringify({
        "host": context.host,
        "port": context.port,
        "aid": context.aid,
        "iid": context.liid
      })] = {
        "endpointID": context.endpointID,
        "0": "DETECTED", // Aka open for Alexa
        "1": "NOT_DETECTED",
        //  "2": "DETECTED",
        //  "3": "DETECTED",
        //  "4": "DETECTED",
        "template": "ContactSensor"
      };
      break;
    case "Target Door State": // TargetDoorState
      reportState.push(messages.reportState("Alexa.PowerController", context));
      cookie["TurnOn"] = messages.cookieV(0, context); // Open
      cookie["TurnOff"] = messages.cookieV(1, context); // Closed
      break;
    case "Contact Sensor State": // Contact Sensor State
      reportState.push(messages.reportState("Alexa.ContactSensor", context));
      // Characteristic.ContactSensorState.CONTACT_DETECTED = 0;
      // Characteristic.ContactSensorState.CONTACT_NOT_DETECTED = 1;

      // DETECTED means the sensor is open and the two pieces of the sensor are not in contact with each other. For example, a window has been opened.
      // NOT_DETECTED means the sensor is closed and the two pieces of the sensor are in contact with each other.

      // I think that Alexa and Apple are backwards

      hapEvents[JSON.stringify({
        "host": context.host,
        "port": context.port,
        "aid": context.aid,
        "iid": context.liid
      })] = {
        "endpointID": context.endpointID,
        "1": "DETECTED", // Aka open for Alexa
        "0": "NOT_DETECTED",
        "template": "ContactSensor"
      };
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
      // cookie["SetMute"] = messages.cookie(context);
      break;
    case "Preset": // Bose Sound link presets
      // case "91288267": // This is in the homebridge-bose-soundtouch plugin
      reportState.push(messages.reportState("Alexa.ChannelController", context));
      cookie["ChangeChannel"] = messages.cookie(context);
      // cookie["SetVolume"] = messages.cookie(context);
      // cookie["SetMute"] = messages.cookie(context);
      break;
    case "Volume Selector": // Speaker volume
      // case "91288267": // This is in the homebridge-bose-soundtouch plugin
      reportState.push(messages.reportState("Alexa.StepSpeaker", context));
      cookie["AdjustVolume"] = messages.cookie(context);
      break;
      /*
    case "Mute": // Speaker volume
      // case "91288267": // This is in the homebridge-bose-soundtouch plugin
      reportState.push(messages.reportState("Alexa.StepSpeaker", context));
      cookie["SetMute"] = messages.cookie(context);
      break;
      */
    case "Target Temperature": // Target Temperature
      reportState.push(messages.reportState("Alexa.ThermostatControllertargetSetpoint", context));
      // cookie["SetTargetTemperature"] = messages.cookie(context);
      cookie["targetSetpoint"] = messages.cookie(context);
      break;
    case "Heating Threshold Temperature": // Target Temperature
      // reportState.push(messages.reportState("Alexa.ThermostatController", context));
      reportState.push(messages.reportState("Alexa.ThermostatControllerlowerSetpoint", context));
      cookie["lowerSetpoint"] = messages.cookie(context);
      break;
    case "Cooling Threshold Temperature": // Target Temperature
      // reportState.push(messages.reportState("Alexa.ThermostatController", context));
      reportState.push(messages.reportState("Alexa.ThermostatControllerupperSetpoint", context));
      cookie["upperSetpoint"] = messages.cookie(context);
      break;
    case "Target Heater Cooler State":
    case "Target Heating Cooling State":
      reportState.push(messages.reportState("Alexa.ThermostatControllerthermostatMode", context));
      // reportState.push(messages.reportState("Alexa.ThermostatController", context));
      // Characteristic.TargetHeatingCoolingState.OFF = 0;
      // Characteristic.TargetHeatingCoolingState.HEAT = 1;
      // Characteristic.TargetHeatingCoolingState.COOL = 2;
      // Characteristic.TargetHeatingCoolingState.AUTO = 3;
      cookie["thermostatModeOFF"] = messages.cookieV(0, context);
      cookie["thermostatModeHEAT"] = messages.cookieV(1, context);
      cookie["thermostatModeCOOL"] = messages.cookieV(2, context);
      cookie["thermostatModeAUTO"] = messages.cookieV(3, context);
      break;
    case "Current Heating Cooling State":
      // reportState.push(messages.reportState("Alexa.ThermostatControllerthermostatMode", context));
      // Characteristic.CurrentHeatingCoolingState.OFF = 0;
      // Characteristic.CurrentHeatingCoolingState.HEAT = 1;
      // Characteristic.CurrentHeatingCoolingState.COOL = 2;
      cookie["thermostatMode"] = messages.cookie(context);
      break;
    case "Lock Current State":
      reportState.push(messages.reportState("Alexa.LockController", context));
      break;
    case "Lock Target State":
      // reportState.push(messages.reportState("Alexa.LockController", context));
      cookie["Lock"] = messages.cookieV(1, context);
      cookie["Unlock"] = messages.cookieV(0, context);
      break;
    case "Remote Key":
      /*
      Characteristic.RemoteKey.REWIND = 0;
      Characteristic.RemoteKey.FAST_FORWARD = 1;
      Characteristic.RemoteKey.NEXT_TRACK = 2;
      Characteristic.RemoteKey.PREVIOUS_TRACK = 3;
      Characteristic.RemoteKey.ARROW_UP = 4;
      Characteristic.RemoteKey.ARROW_DOWN = 5;
      Characteristic.RemoteKey.ARROW_LEFT = 6;
      Characteristic.RemoteKey.ARROW_RIGHT = 7;
      Characteristic.RemoteKey.SELECT = 8;
      Characteristic.RemoteKey.BACK = 9;
      Characteristic.RemoteKey.EXIT = 10;
      Characteristic.RemoteKey.PLAY_PAUSE = 11;
      Characteristic.RemoteKey.INFORMATION = 15;
      */
      // "Play", "Pause", "Stop", "Next", "Previous"
      cookie["Pause"] = messages.cookieV(11, context);
      cookie["Play"] = messages.cookieV(8, context);
      cookie["Stop"] = messages.cookieV(9, context);
      cookie["Next"] = messages.cookieV(7, context);
      cookie["Previous"] = messages.cookieV(6, context);
      break;
    default:
      // debug("Missing Characteristic '%s' %s - %s", description, context.name, context.function);
  }
  // debug("HP", hapEvents, hapEvents.length);
  return ({
    cookie: cookie,
    reportState: reportState,
    hapEvents: hapEvents
  });
}
