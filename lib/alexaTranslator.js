"use strict";

var debug = require('debug')('alexaTranslator');

module.exports = {
  endPoints: endPoints,
  alexaResponse: alexaResponse,
  alexaStateResponse: alexaStateResponse
};

function endPoints(message, accessories, filter, speakers) {
  var devices = [];
  accessories.forEach(function(element) {
    devices.push(_parseHAPtoAlexa(element.host, element.port, element.HBname, element.accessories, filter, speakers));
  });
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa.Discovery",
        "name": "Discover.Response",
        "payloadVersion": "3",
        "messageId": message.directive.header.messageId
      },
      "payload": {
        "endpoints": _endPoints(devices)
      }
    }
  };
  return (response);
}

function _parseHAPtoAlexa(host, port, hapname, hap, filter, speakers) {
  var alexaDevices = {};
  let acookie = {};
  let ycookie = {};

  for (var accessory in hap.accessories) {

    let aid = parseInt(hap.accessories[accessory].aid);
    let device = hap.accessories[accessory];
    let iid, name, description, model, manufacturer, atvName;

    for (var service in device.services) {
      // name = "";
      var serviceType = device.services[service].type;
      let cookie = {};
      let capabilities = [];
      let alexaCommand = [];
      capabilities.push({
        "type": "AlexaInterface",
        "interface": "Alexa",
        "version": "3"
      });
      let displayCategories = [];
      let ReportState = [];
      let description = "Unknown";
      let hue, saturation, brightness;


      // Parse each HAP service, and map to an Alexa service

      // Lightbulb,                            Outlet
      // Switch,                               Fan
      // WindowCovering,                       TemperatureSensor
      // Fan 2 aka Dyson                       Garage Door
      // Valve aka sprinkler                   AccessoryInformation
      // Thermostat

      if (serviceType.startsWith("00000043") || serviceType.startsWith("00000047") ||
        serviceType.startsWith("00000049") || serviceType.startsWith("00000040") ||
        serviceType.startsWith("0000008C") || serviceType.startsWith("0000008A") ||
        serviceType.startsWith("000000B7") || serviceType.startsWith("00000041") ||
        serviceType.startsWith("000000D0") || serviceType.startsWith("0000003E") ||
        serviceType.startsWith("0000004A")) {

        for (var id in device.services[service].characteristics) {

          var characteristic = device.services[service].characteristics[id];
          var type = characteristic.type;
          iid = parseInt(characteristic.iid);
          displayCategories = _lookupDisplayCategory(serviceType);
          description = _fixHapName(hapname) + " " + name + " " + _lookupFriendlyDisplayCategory(serviceType);

          function _cookie() {
            return JSON.stringify({
              "host": host,
              "port": port,
              "aid": aid,
              "iid": iid
            });
          };

          function _reportState(_interface) {
            return {
              "interface": _interface,
              "host": host,
              "port": port,
              "aid": aid,
              "iid": iid
            };
          };

          function _cookieV(_value) {
            return JSON.stringify({
              "host": host,
              "port": port,
              "aid": aid,
              "iid": iid,
              "value": _value
            });
          };

          function isAppleTV() {
            if (manufacturer === "Apple" && model === "Apple TV") {
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
            for (var key in speakers) {
              //debug("SP", key, manufacturer, name);
              if (!speakers.hasOwnProperty(key)) continue;
              if (manufacturer === speakers[key].manufacturer && name === speakers[key].name) {
                return true;
              };
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
              if (characteristic.description == "Name") {
                if (isAppleTV())
                  atvName = characteristic.value.split("(")[1] ? characteristic.value.split("(")[1].split(")")[0] : undefined;
                name = characteristic.value;
              }
              // For Dyson FAN, add FAN to the name
              if (serviceType.startsWith("000000B7"))
                name = name + " Fan";
              break;


            case "00000011": // Current Temperature
              alexaCommand.push({
                "command": "Alexa, what is the temperature in the " + name
              });
              ReportState.push(_reportState("Alexa.TemperatureSensor"));
              capabilities.push(_lookupCapabilities("TemperatureSensor"));
              break;

              //case "00000033": // Heating state Thermostat
              //    alexaCommand.push({
              //        "command": "Alexa, set " + name + " to "
              //    });
              //    ReportState.push(_reportState("Alexa.ThermostatController"));
              //    cookie["SetThermostatMode"] = _cookieV();
              //    capabilities.push(_lookupCapabilities("ThermostatController"));
              //    break;

            case "00000035": // Target Temperature
              alexaCommand.push({
                "command": "Alexa, set " + name + " to "
              });
              ReportState.push(_reportState("Alexa.ThermostatController"));
              cookie["SetTargetTemperature"] = _cookieV();
              capabilities.push(_lookupCapabilities("ThermostatController"));
              break;

            case "00000032": // TargetDoorState
              alexaCommand.push({
                "command": "Alexa, turn on " + name
              });
              alexaCommand.push({
                "command": "Alexa, turn off " + name
              });
              ReportState.push(_reportState("Alexa.PowerController"));
              cookie["TurnOn"] = _cookieV(0); // Open
              cookie["TurnOff"] = _cookieV(1); // Closed
              capabilities.push(_lookupCapabilities("PowerController"));
              break;


            case "0000007C": // WindowCoverings
              alexaCommand.push({
                "command": "Alexa, turn on " + name
              });
              alexaCommand.push({
                "command": "Alexa, turn off " + name
              });
              alexaCommand.push({
                "command": "Alexa, turn " + name + " to 50"
              });
              alexaCommand.push({
                "command": "Alexa, dim/brighten " + name
              });
              alexaCommand.push({
                "command": "Alexa, dim/brighten " + name + " 20"
              });
              ReportState.push(_reportState("Alexa.PowerController"));
              ReportState.push(_reportState("Alexa.PowerLevelController"));
              cookie["TurnOn"] = _cookieV(100);
              cookie["TurnOff"] = _cookieV(0);
              cookie["AdjustPowerLevel"] = _cookie();
              cookie["SetPowerLevel"] = _cookie();
              capabilities.push(_lookupCapabilities("PowerController"));
              capabilities.push(_lookupCapabilities("PowerLevelController"));
              break;


            case "000000B0": // Active on a Fan 2 aka Dyson or Valve
              if (serviceType.startsWith("000000B7") || serviceType.startsWith("000000D0")) {
                alexaCommand.push({
                  "command": "Alexa, turn on " + name
                });
                alexaCommand.push({
                  "command": "Alexa, turn off " + name
                });
                ReportState.push(_reportState("Alexa.PowerController"));
                cookie["TurnOn"] = _cookieV(1);
                cookie["TurnOff"] = _cookieV(0);
                capabilities.push(_lookupCapabilities("PowerController"));
              }
              break;


            case "00000025": // Accessory On/Off
              // Wiring for homebridge-apple-tv
              if (isAppleTV()) {
                acookie[_atvNameTranslate(name)] = _cookieV(1);
                //debug("Adding ATV", _atvNameTranslate(name), _cookieV(1));

                if (_atvNameTranslate(name) === "Sleep") // This assumes that Sleep is the last characteristic for an Apple TV
                {
                  cookie = acookie;
                  acookie = {};
                  ReportState.push(_reportState("Alexa.PlaybackController"));
                  capabilities.push(_lookupCapabilities("ATVPlaybackController"));
                  // Overide defaults for Apple TV Device
                  name = name.split("(")[1] ? name.split("(")[1].split(")")[0] : undefined;
                  description = hapname + " " + name + " " + "Apple TV";
                  displayCategories = ["TV"];
                }

              } else if (isYamaha()) {
                // Yamaha receiver with Spotify Controls
                // Last is "skip rev" / Rewind
                ycookie[_yamahaTranslate(name)] = _cookieV(1);
                if (_yamahaTranslate(name) === "Pause") {
                  ycookie["Stop"] = _cookieV(1);
                }
                if (_yamahaTranslate(name) === "Rewind") {
                  cookie = ycookie;
                  //ycookie = {};
                  ReportState.push(_reportState("Alexa.PlaybackController"));
                  capabilities.push(_lookupCapabilities("YamahaPlaybackController"));
                  // Overide defaults for Apple TV Device
                  name = "Stereo";
                  description = hapname + " " + name + " " + "Yamaha Playback";
                  displayCategories = ["SPEAKER"];
                }

              } else {
                alexaCommand.push({
                  "command": "Alexa, turn on " + name
                });
                alexaCommand.push({
                  "command": "Alexa, turn off " + name
                });
                ReportState.push(_reportState("Alexa.PowerController"));
                cookie["TurnOn"] = _cookieV(1);
                cookie["TurnOff"] = _cookieV(0);
                capabilities.push(_lookupCapabilities("PowerController"));
              }
              break;


            case "00000029": // RotationSpeed
            case "00000008": // Brightness

              if (isSpeaker()) { // Alexa.Speaker and Alexa.StepSpeaker
                debug("Speaker", name, manufacturer);

                displayCategories = ["SPEAKER"];
                description = _fixHapName(hapname) + " " + name + " Speaker";
                ReportState.push(_reportState("Alexa.Speaker"));
                capabilities.push(_lookupCapabilities("Speaker"));
                cookie["AdjustVolume"] = _cookie();
                cookie["SetVolume"] = _cookie();
                cookie["SetMute"] = _cookie();

                if (manufacturer === "yamaha-home" || manufacturer === "Yamaha") {
                  debug(cookie);
                  debug(ycookie);
                  Object.assign(cookie, cookie, ycookie);
                  debug(cookie);
                  ReportState.push(_reportState("Alexa.PlaybackController"));
                  capabilities.push(_lookupCapabilities("YamahaPlaybackController"));
                }
                //ReportState.push(_reportState("Alexa.StepSpeaker"));
                //capabilities.push(_lookupCapabilities("StepSpeaker"));
              } else {
                brightness = {
                  "aid": aid,
                  "iid": iid
                };
                alexaCommand.push({
                  "command": "Alexa, turn " + name + " to 50"
                });
                alexaCommand.push({
                  "command": "Alexa, dim/brighten " + name
                });
                alexaCommand.push({
                  "command": "Alexa, dim/brighten " + name + " 20"
                });
                ReportState.push(_reportState("Alexa.PowerLevelController"));
                cookie["AdjustPowerLevel"] = _cookie();
                cookie["SetPowerLevel"] = _cookie();
                capabilities.push(_lookupCapabilities("PowerLevelController"));
              }
              break;


            case "000000CE": // Color Temperature
              alexaCommand.push({
                "command": "Alexa, set the " + name + " cooler"
              });
              alexaCommand.push({
                "command": "Alexa, set the " + name + " warmer"
              });
              ReportState.push(_reportState("Alexa.ColorTemperatureController"));
              cookie["IncreaseColorTemperature"] = _cookie();
              cookie["DecreaseColorTemperature"] = _cookie();
              cookie["SetColorTemperature"] = _cookie();
              capabilities.push(_lookupCapabilities("ColorTemperatureController"));
              break;
          }
        }

        if (capabilities.length > 1) {
          // If a color bulb was included
          // debug("Color",aid,hue,saturation,brightness);
          if (hue && saturation && brightness) {
            // If a color lightbulb populate Alexa.ColorController
            alexaCommand.push({
              "command": "Alexa, turn " + name + " red"
            });
            ReportState.push({
              "interface": "Alexa.ColorController",
              "host": host,
              "port": port,
              "hue": hue,
              "saturation": saturation,
              "brightness": brightness
            });
            cookie["SetColor"] = JSON.stringify({
              "host": host,
              "port": port,
              "hue": hue,
              "saturation": saturation,
              "brightness": brightness
            });
            capabilities.push(_lookupCapabilities("ColorController"));
          }
          cookie["ReportState"] = JSON.stringify(ReportState);

          if ((filter && filter === host + ":" + port) || !filter) {
            alexaDevices[host + ":" +
              port + ",aid: " + aid.toString() + ",iid: " + iid.toString()] = {
              'friendlyName': name,
              'description': description,
              'modelName': model,
              'manufacturerName': manufacturer,
              'endpointId': host + ":" +
                port + ",aid: " + aid.toString() + ",iid: " + iid.toString(),
              'cookie': cookie,
              'displayCategories': displayCategories,
              'capabilities': capabilities
            };

            // console.log("\"" + name + "\", \"" + description + "\", \"" + manufacturer + "\", \"" + model + "\"" + _alexaCommandToString(alexaCommand));
          }

        }
        //debug("ATV", JSON.stringify(acookie));
      }
    }

  }

  //  debug("Alexa Commands",JSON.stringify(alexaCommands, null, 4));
  debug("Alexa Controllable", hapname, Object.keys(alexaDevices).length);
  return alexaDevices;
}

function _atvNameTranslate(name) {
  switch (name.split("(")[0].split(" ")[0]) {
    case "Menu":
      return "Stop";
      break;
    default:
      return name.split("(")[0].split(" ")[0];
  }
}

function _yamahaTranslate(name) {
  // Yamaha - "Spotify Play", "Spotify Pause", "Spotify Skip Fwd", "Spotify Skip Rev"
  // Alexa  - "Play", "Pause", "Stop", "Skip", "Rewind"
  debug("Yamaha name translate %s == %s", name, name.split(" ")[1] + " " + name.split(" ")[2]);
  switch (name.split(" ")[1] + " " + name.split(" ")[2]) {
    case "Skip Fwd":
      return "Next";
      break;
    case "Skip Rev":
      return "Rewind";
      break;
    default:
      return name.split(" ")[1];
  }
}

function _fixHapName(hapName) {
  if (hapName.substring(hapName.length - 5, hapName.length - 4) == "-") {
    return (hapName.substring(0, hapName.length - 5));
  } else {
    return (hapName);
  }
}

function _lookupCapabilities(capability) {
  switch (capability) {
    case "ATVPlaybackController":
      var response = {
        "type": "AlexaInterface",
        "interface": "Alexa.PlaybackController",
        "version": "3",
        "supportedOperations": ["Play", "Pause", "Stop"]
      };
      break;
    case "YamahaPlaybackController":
      var response = {
        "type": "AlexaInterface",
        "interface": "Alexa.PlaybackController",
        "version": "3",
        "supportedOperations": ["Play", "Pause", "Stop", "Next", "Rewind"]
      };
      break;
    case "Speaker":
      var response = {
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
      var response = {
        "type": "AlexaInterface",
        "interface": "Alexa.StepSpeaker",
        "version": "3",
        "properties": {}
      };
      break;
    case "ColorTemperatureController":
      var response = {
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
      var response = {
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
      var response = {
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
      var response = {
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
      var response = {
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
      };
      break;
    case "ThermostatController":
      var response = {
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
      var response = {
        "type": "AlexaInterface",
        "interface": "Alexa.TemperatureSensor",
        "version": "3",

      };
      break;
  }
  return response;
}

function _alexaCommandToString(alexaCommand) {
  var response = "";
  var spacer = "";
  alexaCommand.forEach(function(element) {
    response = response + spacer + element.command;
    spacer = "; "
  });
  return ", \"" + response + "\"";
}

function _lookupDisplayCategory(service) {
  var category;
  switch (service.substr(0, 8)) {
    case "00000043": // lightbulb
    case "0000008C": // Window Covering
    case "00000040": // Fan
    case "000000B7": // Fan2
      category = ["LIGHT"];
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
      category = ["TEMPERATURE_SENSOR"]; // Not working
      // category = ["THERMOSTAT"];   // Working
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

function _lookupFriendlyDisplayCategory(service) {
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

function _endPoints(discovered) {

  var listOfDevices = [];
  for (var id in discovered) {

    var devices = discovered[id];
    for (var did in devices) {
      var item = {};
      var device = devices[did];
      item["endpointId"] = new Buffer(device.endpointId).toString('base64');
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

function alexaResponse(message, hbResponse, err, value) {
  var now = new Date();

  if (err) {
    // Couldn't access HomeBridge
    var response = {
      "event": {
        "header": {
          "namespace": "Alexa",
          "name": "ErrorResponse",
          "messageId": message.directive.header.messageId,
          "correlationToken": message.directive.header.correlationToken,
          "payloadVersion": "3"
        },
        "endpoint": {
          "endpointId": message.directive.endpoint.endpointId
        },
        "payload": {
          "type": "ENDPOINT_UNREACHABLE",
          "message": err.message
        }
      }
    };

  } else if (hbResponse.characteristics[0].status != 0) {
    // HomeBridge returned an error
    var response = {
      "event": {
        "header": {
          "namespace": "Alexa",
          "name": "ErrorResponse",
          "messageId": message.directive.header.messageId,
          "correlationToken": message.directive.header.correlationToken,
          "payloadVersion": "3"
        },
        "endpoint": {
          "endpointId": message.directive.endpoint.endpointId
        },
        "payload": {
          "type": "INTERNAL_ERROR",
          "message": "HAP Error " + hbResponse.characteristics[0].status
        }
      }
    };
  } else {

    switch (message.directive.header.namespace.toLowerCase()) {
      case "alexa":
        break;
      case "alexa.discovery":
        break;
      case "alexa.playbackcontroller":
        var response = {
          "context": {
            "properties": []
          },
          "event": {
            "header": {
              "messageId": message.directive.header.messageId,
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3"
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        }
        break;
      case "alexa.powercontroller":
        var response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.PowerController",
              "name": "powerState",
              "value": message.directive.header.name.substr(4).toUpperCase(),
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        }
        break;
      case "alexa.powerlevelcontroller":
        var response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.PowerLevelController",
              "name": "powerLevel",
              "value": value,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        }
        break;
      case "alexa.speaker":
        var response = {
          "context": {
            "properties": [{
                "namespace": "Alexa.Speaker",
                "name": "volume",
                "value": value,
                "timeOfSample": now.toISOString(),
                "uncertaintyInMilliseconds": 500
              },
              {
                "namespace": "Alexa.Speaker",
                "name": "muted",
                "value": false,
                "timeOfSample": now.toISOString(),
                "uncertaintyInMilliseconds": 500
              }
            ]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        }
        break;
      case "alexa.colorcontroller":
        var response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.ColorController",
              "name": "color",
              "value": message.directive.payload.color,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        }
        break;
      case "alexa.colortemperaturecontroller":
        var response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.ColorTemperatureController",
              "name": "colorTemperatureInKelvin",
              "value": value,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        }
        break;
      case "alexa.thermostatcontroller":
        var response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.ThermostatController",
              "name": "targetSetpoint",
              "value": {
                "value": message.directive.payload.targetSetpoint.value,
                "scale": message.directive.payload.targetSetpoint.scale
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        }
        break;

      default:
        console.log("alexaResponse - Unhandled Alexa Directive", message.directive.header.namespace);
        var response = {
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "ErrorResponse",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken,
              "payloadVersion": "3"
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {
              "type": "INTERNAL_ERROR",
              "message": "Unhandled Alexa Directive"
            }
          }
        };
    }
  }
  // debug("alexaResponse", JSON.stringify(response));
  return response;
}

function _getValue(element, hbResponse) {
  var value, status;
  if (element.interface.toLowerCase() == "alexa.colorcontroller") {
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
    if (hbResponse[i].aid == element.aid && hbResponse[i].iid == element.iid) {
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

function _StateToProperties(reportState, hbResponse) {
  var properties = [];
  var now = new Date();
  //debug("hbResponse", hbResponse);
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
        })
        break;
      default:
        console.log("ERROR: statusReport unknown/handled device", element, reportState);
    }

  });

  return properties;
}

function alexaStateResponse(message, reportState, hbResponse, err) {
  var endpointId = message.directive.endpoint.endpointId;
  var messageId = message.directive.header.messageId;
  var correlationToken = message.directive.header.correlationToken;

  if (err) {

    console.log("ERROR: alexaStateResponse", err.message);
    var response = {
      "event": {
        "header": {
          "namespace": "Alexa",
          "name": "ErrorResponse",
          "messageId": messageId,
          "correlationToken": correlationToken,
          "payloadVersion": "3"
        },
        "endpoint": {
          "endpointId": endpointId
        },
        "payload": {
          "type": "ENDPOINT_UNREACHABLE",
          "message": err.message
        }
      }
    };

  } else {

    switch (message.directive.header.name.toLowerCase()) {
      case "reportstate":
        var response = {
          "context": {
            "properties": _StateToProperties(reportState, hbResponse.characteristics),
          },
          "event": {
            "header": {
              "messageId": messageId,
              "correlationToken": correlationToken,
              "namespace": "Alexa",
              "name": "StateReport",
              "payloadVersion": "3"
            },
            "endpoint": {

              "endpointId": endpointId,
              "cookie": {}
            },
            "payload": {}
          }
        };


        break;

      default:
        console.log("Unhandled alexaStateResponse Directive", message.directive.header.name);
        var response = {
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "ErrorResponse",
              "messageId": messageId,
              "correlationToken": correlationToken,
              "payloadVersion": "3"
            },
            "endpoint": {
              "endpointId": endpointId
            },
            "payload": {
              "type": "INTERNAL_ERROR",
              "message": "Unhandled alexaStateResponse Directive"
            }
          }
        };
    }
  }
  //debug("alexaStatusResponse", JSON.stringify(response));
  return response;
}

function _round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
