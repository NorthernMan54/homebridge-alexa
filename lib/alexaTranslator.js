"use strict";

var messageUtil = require('./util/messageUtil');
var debug = require('debug')('alexaTranslator');

module.exports = {
  endPoints: endPoints,
  hapEndPoints: hapEndPoints
};

var events = false;
var hapEvents = [];

function hapEndPoints(endpoint) {
  debug("hapEndPoints - old");
  if (endpoint) {
    return hapEvents[endpoint];
  } else {
    return hapEvents;
  }
}

function endPoints(message, accessories, options) {
  debug("endPoints - old");
  var devices = [];
  hapEvents = [];
  events = options['events'] || false;
  // debug("OPTIONS", options);
  accessories.forEach(function(instance) {
    devices.push(_parseHAPtoAlexa(instance, options));
  });
  var messageID = (message ? message.directive.header.messageId : '');
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa.Discovery",
        "name": "Discover.Response",
        "payloadVersion": "3",
        "messageId": messageID
      },
      "payload": {
        "endpoints": messageUtil.endPoints(devices)
      }
    }
  };
  // debug("Combine", options.combine);
  if (options.combine) {
    response = messageUtil.combine(options, response);
  }
  // console.log('\n', JSON.stringify(response));
  return (response);
}

function _parseHAPtoAlexa(instance, options) {
  var alexaDevices = {};
  let acookie = {};
  let ycookie = {};
  // debug("Instance", instance);

  for (var accessory in instance.accessories.accessories) {
    let aid = parseInt(instance.accessories.accessories[accessory].aid);
    let device = instance.accessories.accessories[accessory];
    let iid, name, model, manufacturer;

    for (var service in device.services) {
      // name = "";
      var serviceType = device.services[service].type;
      let cookie = {};
      let capabilities = [];
      capabilities.push({
        "type": "AlexaInterface",
        "interface": "Alexa",
        "version": "3"
      });
      let displayCategories = [];
      let ReportState = [];
      let description = "Unknown";
      let hue, saturation, brightness, on;
      let deviceEndPointID = "";

      // Parse each HAP service, and map to an Alexa service

      // Lightbulb,                            Outlet
      // Switch,                               Fan
      // WindowCovering,                       TemperatureSensor
      // Fan 2 aka Dyson                       Garage Door
      // Valve aka sprinkler                   AccessoryInformation
      // Thermostat                            Contact Sensor
      // Motion Sensor                         Speaker
      // Heater/Cooler

      if (serviceType.startsWith("00000043") || serviceType.startsWith("00000047") ||
        serviceType.startsWith("00000049") || serviceType.startsWith("00000040") ||
        serviceType.startsWith("0000008C") || serviceType.startsWith("0000008A") ||
        serviceType.startsWith("000000B7") || serviceType.startsWith("00000041") ||
        serviceType.startsWith("000000D0") || serviceType.startsWith("0000003E") ||
        serviceType.startsWith("0000004A") || serviceType.startsWith("00000080") ||
        serviceType.startsWith("00000085") || serviceType.startsWith("00000113") ||
        serviceType.startsWith("000000BC")) {
        // Loop thru characteristics of the found and supported service
        for (var id in device.services[service].characteristics) {
          var characteristic = device.services[service].characteristics[id];
          var type = characteristic.type;
          // Skip over rouge characteristics ( breaks speakers with homebridge-bose-soundlink )
          if (type.substring(0, 8) === "91288999") {
            continue;
          }
          iid = parseInt(characteristic.iid);
          displayCategories = messageUtil.lookupDisplayCategory(serviceType);
          description = messageUtil.fixHapName(instance.instance.txt.md) + " " + name + " " + messageUtil.lookupFriendlyDisplayCategory(serviceType);

          // Local functions

          function _cookie() {
            return JSON.stringify({
              "host": instance.ipAddress,
              "port": instance.instance.port,
              "aid": aid,
              "iid": iid
            });
          }

          function _reportState(_interface) {
            return {
              "interface": _interface,
              "host": instance.ipAddress,
              "port": instance.instance.port,
              "aid": aid,
              "iid": iid
            };
          }

          function _cookieV(_value) {
            return JSON.stringify({
              "host": instance.ipAddress,
              "port": instance.instance.port,
              "aid": aid,
              "iid": iid,
              "value": _value
            });
          }

          function atvButton(name) {
            switch (name.substr(0, name.indexOf(" "))) {
              case "Pair":
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

          function isAppleTV() {
            // debug("NAME", name);
            if (manufacturer === "Apple" && model === "Apple TV" && atvButton(name)) {
              return true;
            } else {
              return false;
            }
          }

          function isYamaha() {
            if (manufacturer === "yamaha-home" && name.startsWith("Spotify ")) {
              return true;
            } else {
              return false;
            }
          }

          function isSpeaker() {
            for (var key in options.speakers) {
              // debug("SP", key, manufacturer, name);
              if (!options.speakers.hasOwnProperty(key)) continue;
              if (manufacturer === options.speakers[key].manufacturer && name === options.speakers[key].name) {
                return true;
              }
            }
            return false;
          }

          switch (type.substring(0, 8)) {
            case "00000020": // Accessory Manufacturer
              manufacturer = characteristic.value;
              break;

            case "00000021": // Accessory Model
              model = characteristic.value;
              break;

            case "00000013": // Hue - Color light bulb
              hue = {
                "aid": aid,
                "iid": iid
              };
              break;

            case "0000002F": // Saturation - Color light bulb
              saturation = {
                "aid": aid,
                "iid": iid
              };
              break;

            case "00000023": // Accessory Name
              // homebridge-hue has additional 0x23 characteristics for last updated that confuse things.
              if (characteristic.description === "Name" && characteristic.value !== "") {
                name = characteristic.value;

                if (isAppleTV()) {
                  // atvName = characteristic.value.split("(")[1] ? characteristic.value.split("(")[1].split(")")[0] : undefined;
                }
              }
              // For Dyson FAN, add FAN to the name
              if (serviceType.startsWith("000000B7")) {
                name = name + " Fan";
              }
              break;

            case "00000022": // Motion sensor state
              ReportState.push(_reportState("Alexa.MotionSensor"));
              capabilities.push(messageUtil.lookupCapabilities("MotionSensor", events));
              if (events && (options.filter ? options.filter === instance.ipAddress + ":" + instance.instance.port : true)) {
                var x = {
                  'host': instance.ipAddress,
                  'port': instance.instance.port,
                  'aid': aid,
                  'iid': iid
                };
                hapEvents[JSON.stringify(x)] = {
                  "endpointID": messageUtil.endpointID(instance, manufacturer, name, serviceType),
                  "true": "DETECTED",
                  "false": "NOT_DETECTED",
                  "template": "MotionSensor"
                };
              }
              break;

            case "0000006D": // Window Covering Current Position
              ReportState.push(_reportState("Alexa.ContactSensor"));
              capabilities.push(messageUtil.lookupCapabilities("ContactSensor", events));
              if (events && (options.filter ? options.filter === instance.ipAddress + ":" + instance.instance.port : true)) {
                var x = {
                  'host': instance.ipAddress,
                  'port': instance.instance.port,
                  'aid': aid,
                  'iid': iid
                };
                //    maxValue: 100,
                //    minValue: 0,

                hapEvents[JSON.stringify(x)] = {
                  "endpointID": messageUtil.endpointID(instance, manufacturer, name, serviceType),
                  "100": "DETECTED", // Aka open for Alexa
                  "0": "NOT_DETECTED", // Aka closed for alexa
                  "template": "ContactSensor"
                };
              }
              break;

            case "0000000E": // Current Door state
              ReportState.push(_reportState("Alexa.ContactSensor"));
              capabilities.push(messageUtil.lookupCapabilities("ContactSensor", events));
              if (events && (options.filter ? options.filter === instance.ipAddress + ":" + instance.instance.port : true)) {
                var x = {
                  'host': instance.ipAddress,
                  'port': instance.instance.port,
                  'aid': aid,
                  'iid': iid
                };
                // The value property of CurrentDoorState must be one of the following:
                // Characteristic.CurrentDoorState.OPEN = 0;
                // Characteristic.CurrentDoorState.CLOSED = 1;
                // Characteristic.CurrentDoorState.OPENING = 2;
                // Characteristic.CurrentDoorState.CLOSING = 3;
                // Characteristic.CurrentDoorState.STOPPED = 4;
                //
                // Validated againt door states

                hapEvents[JSON.stringify(x)] = {
                  "endpointID": messageUtil.endpointID(instance, manufacturer, name, serviceType),
                  "0": "DETECTED", // Aka open for Alexa
                  "1": "NOT_DETECTED",
                  //  "2": "DETECTED",
                  //  "3": "DETECTED",
                  //  "4": "DETECTED",
                  "template": "ContactSensor"
                };
              }
              break;

            case "0000006A": // Contact Sensor State
              ReportState.push(_reportState("Alexa.ContactSensor"));
              capabilities.push(messageUtil.lookupCapabilities("ContactSensor", events));
              if (events && (options.filter ? options.filter === instance.ipAddress + ":" + instance.instance.port : true)) {
                var x = {
                  'host': instance.ipAddress,
                  'port': instance.instance.port,
                  'aid': aid,
                  'iid': iid
                };
                // Characteristic.ContactSensorState.CONTACT_DETECTED = 0;
                // Characteristic.ContactSensorState.CONTACT_NOT_DETECTED = 1;

                // DETECTED means the sensor is open and the two pieces of the sensor are not in contact with each other. For example, a window has been opened.
                // NOT_DETECTED means the sensor is closed and the two pieces of the sensor are in contact with each other.

                // I think that Alexa and Apple are backwards

                hapEvents[JSON.stringify(x)] = {
                  "endpointID": messageUtil.endpointID(instance, manufacturer, name, serviceType),
                  "1": "DETECTED", // Aka open for Alexa
                  "0": "NOT_DETECTED",
                  "template": "ContactSensor"
                };
              }
              break;

            case "00000011": // Current Temperature
              ReportState.push(_reportState("Alexa.TemperatureSensor"));
              capabilities.push(messageUtil.lookupCapabilities("TemperatureSensor", false));

              // Usage of a temperature sensor in a routine is not available

              /* if (events && (options.filter ? options.filter === instance.ipAddress + ":" + instance.instance.port : true)) {
                var x = {
                  'host': instance.ipAddress,
                  'port': instance.instance.port,
                  'aid': aid,
                  'iid': iid
                };
                hapEvents[JSON.stringify(x)] = {
                  "endpointID": messageUtil.endpointID(instance, manufacturer, name),
                  "template": "TemperatureSensor"
                };
              }
              */
              break;

            case "00000035": // Target Temperature
              ReportState.push(_reportState("Alexa.ThermostatController"));
              cookie["SetTargetTemperature"] = _cookieV();
              capabilities.push(messageUtil.lookupCapabilities("ThermostatController", events));
              break;

            case "00000032": // TargetDoorState
              ReportState.push(_reportState("Alexa.PowerController"));
              cookie["TurnOn"] = _cookieV(0); // Open
              cookie["TurnOff"] = _cookieV(1); // Closed
              capabilities.push(messageUtil.lookupCapabilities("PowerController", events));
              break;

            case "0000007C": // WindowCoverings Target Position
              ReportState.push(_reportState("Alexa.PowerController"));
              ReportState.push(_reportState("Alexa.PowerLevelController"));
              cookie["TurnOn"] = _cookieV(100);
              cookie["TurnOff"] = _cookieV(0);
              cookie["AdjustPowerLevel"] = _cookie();
              cookie["SetPowerLevel"] = _cookie();
              capabilities.push(messageUtil.lookupCapabilities("PowerController", events));
              capabilities.push(messageUtil.lookupCapabilities("PowerLevelController", events));
              break;

            case "000000B0": // Active on a Fan 2 aka Dyson or Valve
              if (serviceType.startsWith("000000B7") || serviceType.startsWith("000000D0") || serviceType.startsWith("000000BC")) {
                ReportState.push(_reportState("Alexa.PowerController"));
                cookie["TurnOn"] = _cookieV(1);
                cookie["TurnOff"] = _cookieV(0);
                capabilities.push(messageUtil.lookupCapabilities("PowerController", events));
              }
              break;

            case "00000025": // Accessory On/Off
              // Wiring for homebridge-apple-tv
              if (isAppleTV()) {
                acookie[messageUtil.atvNameTranslate(name)] = _cookieV(1);
                // debug("Adding ATV", _atvNameTranslate(name), _cookieV(1));

                // This assumes that Sleep is the last characteristic for an Apple TV
                if (messageUtil.atvNameTranslate(name) === "Sleep") {
                  cookie = acookie;
                  acookie = {};
                  ReportState.push(_reportState("Alexa.PlaybackController"));
                  capabilities.push(messageUtil.lookupCapabilities("ATVPlaybackController", events));
                  // Overide defaults for Apple TV Device
                  name = name.split("(")[1] ? name.split("(")[1].split(")")[0] : undefined;
                  description = instance.instance.txt.md + " " + name + " " + "Apple TV";
                  displayCategories = ["TV"];
                }
              } else if (isYamaha()) {
                // Yamaha receiver with Spotify Controls
                // Last is "skip rev" / Rewind
                ycookie[messageUtil.yamahaTranslate(name)] = _cookieV(1);
                if (messageUtil.yamahaTranslate(name) === "Pause") {
                  ycookie["Stop"] = _cookieV(1);
                }
                if (messageUtil.yamahaTranslate(name) === "Rewind") {
                  cookie = ycookie;
                  // ycookie = {};
                  ReportState.push(_reportState("Alexa.PlaybackController"));
                  capabilities.push(messageUtil.lookupCapabilities("YamahaPlaybackController", events));
                  // Overide defaults for Apple TV Device
                  name = "Stereo";
                  description = instance.instance.txt.md + " " + name + " " + "Yamaha Playback";
                  displayCategories = ["SPEAKER"];
                }
              } else {
                on = {
                  "aid": aid,
                  "iid": iid
                };
                ReportState.push(_reportState("Alexa.PowerController"));
                cookie["TurnOn"] = _cookieV(1);
                cookie["TurnOff"] = _cookieV(0);
                capabilities.push(messageUtil.lookupCapabilities("PowerController", events));
              }
              break;

            case "00000119": // Speaker volume
            case "91288267": // This is in the homebridge-bose-soundtouch plugin
              ReportState.push(_reportState("Alexa.Speaker"));
              capabilities.push(messageUtil.lookupCapabilities("Speaker"));
              cookie["AdjustVolume"] = _cookie();
              cookie["SetVolume"] = _cookie();
              cookie["SetMute"] = _cookie();
              break;

            case "00000029": // RotationSpeed
            case "00000008": // Brightness

              if (isSpeaker()) { // Alexa.Speaker and Alexa.StepSpeaker
                // debug("Speaker", name, manufacturer);

                displayCategories = ["SPEAKER"];
                description = messageUtil.fixHapName(instance.instance.txt.md) + " " + name + " Speaker";
                ReportState.push(_reportState("Alexa.Speaker"));
                capabilities.push(messageUtil.lookupCapabilities("Speaker", events));
                cookie["AdjustVolume"] = _cookie();
                cookie["SetVolume"] = _cookie();
                cookie["SetMute"] = _cookie();

                if (manufacturer === "yamaha-home" || manufacturer === "Yamaha") {
                  debug(cookie);
                  debug(ycookie);
                  Object.assign(cookie, cookie, ycookie);
                  debug(cookie);
                  ReportState.push(_reportState("Alexa.PlaybackController"));
                  capabilities.push(messageUtil.lookupCapabilities("YamahaPlaybackController", events));
                }
                // ReportState.push(_reportState("Alexa.StepSpeaker"));
                // capabilities.push(_lookupCapabilities("StepSpeaker"));
              } else {
                brightness = {
                  "aid": aid,
                  "iid": iid
                };
                ReportState.push(_reportState("Alexa.PowerLevelController"));
                cookie["AdjustPowerLevel"] = _cookie();
                cookie["SetPowerLevel"] = _cookie();
                capabilities.push(messageUtil.lookupCapabilities("PowerLevelController", events));
              }
              break;

            case "000000CE": // Color Temperature
              ReportState.push(_reportState("Alexa.ColorTemperatureController"));
              cookie["IncreaseColorTemperature"] = _cookie();
              cookie["DecreaseColorTemperature"] = _cookie();
              cookie["SetColorTemperature"] = _cookie();
              capabilities.push(messageUtil.lookupCapabilities("ColorTemperatureController", events));
              break;
          }
        }

        // End of characteristic parse
        if (capabilities.length > 1) {
          // If a color bulb was included
          // debug("Color",aid,hue,saturation,brightness);
          if (hue && saturation && brightness) {
            // If a color lightbulb populate Alexa.ColorController
            // brightness from setColor was depricated
            ReportState.push({
              "interface": "Alexa.ColorController",
              "host": instance.ipAddress,
              "port": instance.instance.port,
              "hue": hue,
              "saturation": saturation,
              "brightness": brightness,
              "on": on
            });
            cookie["SetColor"] = JSON.stringify({
              "host": instance.ipAddress,
              "port": instance.instance.port,
              "hue": hue,
              "saturation": saturation,
              "brightness": brightness,
              "on": on
            });
            capabilities.push(messageUtil.lookupCapabilities("ColorController", events));
          }
          cookie["ReportState"] = JSON.stringify(ReportState);

          deviceEndPointID = messageUtil.endpointID(instance, manufacturer, name, serviceType);

          if ((options.filter && options.filter === instance.ipAddress + ":" + instance.instance.port) || !options.filter) {
            alexaDevices[instance.ipAddress + ":" +
              instance.instance.port + ",aid: " + aid.toString() + ",iid: " + iid.toString()] = {
              'friendlyName': name,
              'description': description,
              'modelName': model,
              'manufacturerName': manufacturer,
              'endpointId': deviceEndPointID,
              'cookie': cookie,
              'displayCategories': displayCategories,
              'capabilities': capabilities
            };
          }
        }
        // debug("ATV", JSON.stringify(acookie));
      }
    }
  }

  debug("Alexa Controllable", instance.instance.txt.md, Object.keys(alexaDevices).length);
  return alexaDevices;
}
