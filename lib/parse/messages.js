var debug = require('debug')('alexa:Messages');

module.exports = {
  lookupCapabilities: lookupCapabilities, // Dup
  normalizeName: normalizeName,
  lookupDisplayCategory: lookupDisplayCategory, // Dup
  reportState: reportState,
  cookie: cookie,
  cookieV: cookieV,
  isAppleTV: isAppleTV,
  isYamaha: isYamaha,
  atvButton: atvButton,
  playbackNameTranslate: playbackNameTranslate,
  mergeCookies: mergeCookies,
  mergeInputCookies: mergeInputCookies,
  mergeCapabilities: mergeCapabilities,
  stateToProperties: stateToProperties,
  createMessageId: createMessageId,
  round: round,
  combine: combine,
  channel: channel,
  inputs: inputs,
  checkEventDeviceList: checkEventDeviceList
};

function createMessageId() {
  var d = new Date().getTime();

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

  return uuid;
}

/* statusObject {
  body: '?id=101.10,101.11',
  interface: 'Alexa.PowerController,Alexa.PowerLevelController',
  deviceID: 'CC:22:3D:E3:CE:30',
  spacer: ',',
  elements: [{ interface: Alexa.PowerController, aid: 101, iid: 10}, {interface: Alexa.PowerLevelController, aid: 101, iid: 11}]
}
  hbResponse [
    { aid: 101, iid: 11, value: 100 },
    { aid: 101, iid: 10, value: false }
  ]
*/
function stateToProperties(statusObject, hbResponse) {
  var properties = [];
  var now = new Date();
  // debug("stateToProperties - hbResponse", hbResponse);
  // Convert each individual HAP hbResponse to Alexa Format
  statusObject.elements.forEach((element, i) => {
    // debug("stateToProperties - element", element, i, hbResponse[i]);
    switch (element.interface.toLowerCase()) {
      case "alexa.speaker":
        properties.push({
          "namespace": "Alexa.Speaker",
          "name": "volume",
          "value": round(_getValue(element, hbResponse, i).value),
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
          "value": _getValue(element, hbResponse, i).value ? "ON" : "OFF",
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.powerlevelcontroller":
        properties.push({
          "namespace": "Alexa.PowerLevelController",
          "name": "powerLevel",
          "value": round(_getValue(element, hbResponse, i).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.rangecontroller":
        properties.push({
          "namespace": "Alexa.RangeController",
          "name": "rangeValue",
          "value": round(_getValue(element, hbResponse, i).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.modecontroller":
        properties.push({
          "namespace": "Alexa.ModeController",
          "instance": "GarageDoor.Position",
          "name": "mode",
          "value": _getValue(element, hbResponse, i).value ? "Position.Down" : "Position.Up",
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.colortemperaturecontroller":
        properties.push({
          "namespace": "Alexa.ColorTemperatureController",
          "name": "colorTemperatureInKelvin",
          "value": round(1000000 / _getValue(element, hbResponse, i).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.colorcontroller":
        properties.push({
          "namespace": "Alexa.ColorController",
          "name": "color",
          "value": _getValue(element, hbResponse, i).value,
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        i = i + 2; // Skip over the 3 color values
        break;
      case "alexa.temperaturesensor":
        properties.push({
          "namespace": "Alexa.TemperatureSensor",
          "name": "temperature",
          "value": {
            "value": round(_getValue(element, hbResponse, i).value, 1),
            "scale": "CELSIUS"
          },
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.contactsensor":
        properties.push({
          "namespace": "Alexa.ContactSensor",
          "name": "detectionState",
          "value": _getValue(element, hbResponse, i).value ? "DETECTED" : "NOT_DETECTED",
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.motionsensor":
        properties.push({
          "namespace": "Alexa.MotionSensor",
          "name": "detectionState",
          "value": _getValue(element, hbResponse, i).value ? "DETECTED" : "NOT_DETECTED",
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.doorbelleventsource":
        properties.push({
          "namespace": "Alexa.DoorbellEventSource",
          "name": "detectionState",
          "value": _getValue(element, hbResponse, i).value ? "DETECTED" : "NOT_DETECTED",
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      // Characteristic.LockCurrentState.UNSECURED = 0;
      // Characteristic.LockCurrentState.SECURED = 1;
      // Characteristic.LockCurrentState.JAMMED = 2;
      // Characteristic.LockCurrentState.UNKNOWN = 3;
      case "alexa.lockcontroller":
        properties.push({
          "namespace": "Alexa.LockController",
          "name": "lockState",
          "value": _lockState(_getValue(element, hbResponse, i).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.thermostatcontrollertargetsetpoint":
        properties.push({
          namespace: "Alexa.ThermostatController",
          name: "targetSetpoint",
          value: {
            value: _getValue(element, hbResponse, i).value,
            scale: "CELSIUS"
          },
          timeOfSample: now.toISOString(),
          uncertaintyInMilliseconds: 500
        });
        break;
      case "alexa.thermostatcontrollerlowersetpoint":
        properties.push({
          "namespace": "Alexa.ThermostatController",
          "name": "lowerSetpoint",
          "value": {
            "value": _getValue(element, hbResponse, i).value,
            "scale": "CELSIUS"
          },
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.thermostatcontrolleruppersetpoint":
        properties.push({
          "namespace": "Alexa.ThermostatController",
          "name": "upperSetpoint",
          "value": {
            "value": _getValue(element, hbResponse, i).value,
            "scale": "CELSIUS"
          },
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.thermostatcontrollerthermostatmode":
        properties.push({
          "namespace": "Alexa.ThermostatController",
          "name": "thermostatMode",
          "value": _getThermoMode(_getValue(element, hbResponse, i).value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        if (!statusObject.elements.find(x => x.interface.toLowerCase() === "alexa.powercontroller")) {
          properties.push({
            "namespace": "Alexa.PowerController",
            "name": "powerState",
            "value": properties[0].value === "OFF" ? "OFF" : "ON",
            "timeOfSample": now.toISOString(),
            "uncertaintyInMilliseconds": 500
          });
	}
        break;
      default:
        debug("ERROR: statusReport unknown/handled device", element, reportState);
    }
  });

  return properties;
}

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
        // debug("merge cookie %s = %s into %s", cookie, from[cookie], into[cookie]);
        var temp = [];
        temp = JSON.parse(into[cookie]).concat(JSON.parse(from[cookie]));
        into[cookie] = JSON.stringify(temp);
        break;
      default:
      // debug("Not merging cookie", cookie);
    }
  }
}

function mergeInputCookies(into, from) {
  // debug("into", JSON.parse(into['Active Identifier']).iid);
  var inputs = {};
  var activeIdentifier = JSON.parse(into['Active Identifier']).iid;
  for (var cookie in from) {
    // debug("mergeInputCookies", cookie, from[cookie]);
    switch (cookie) {
      case "Channel":
      case "ReportState":
        break;
      default:
        var input = JSON.parse(from[cookie]);
        input["iid"] = activeIdentifier;
        if (cookie.substring(0, 10) === "Station - ") {
          into[cookie.substring(10)] = JSON.stringify(input);
        } else {
          into[cookie] = JSON.stringify(input);
        }
    }

  }
  return inputs;
}

function mergeCapabilities(into, from) {
  for (var capability in from) {
    switch (from[capability].interface) {
      case "Alexa.Speaker":
      case "Alexa.StepSpeaker":
      case "Alexa.InputController":
      case "Alexa.ChannelController":
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

function lookupCapabilities(capability, options, operations, devices) {
  var response = [];
  switch (capability) {
    case "PlaybackController":
      // debug("operations", Object.keys(operations));
      var supported = Object.keys(operations);
      supported = supported.filter(function (item) {
        return item !== 'ReportState';
      });
      // debug("supported", supported);
      response.push({
        type: "AlexaInterface",
        interface: "Alexa.PlaybackController",
        version: "3",
        supportedOperations: supported
      });
      break;
    case "ChannelController":
      response.push({
        type: "AlexaInterface",
        interface: "Alexa.ChannelController",
        version: "3",
        properties: {
          supported: [{
            name: "channel"
          }],
          proactivelyReported: false,
          retrievable: true
        }
      });
      break;
    case "Input Source":
      var supported = Object.keys(operations);
      supported = supported.filter(function (item) {
        return item.substring(0, 10) !== 'Station - ';
      });
      var inputs = [];
      supported.forEach((item, i) => {
        inputs.push({
          name: item
        });
      });

      response.push({
        type: "AlexaInterface",
        interface: "Alexa.InputController",
        version: "3",
        properties: {
          supported: [{
            name: "input"
          }],
          proactivelyReported: false,
          retrievable: true
        },
        inputs: inputs
      });
      break;
    case "ThermostatController":
      // debug("operations", Object.keys(operations));
      var ops = Object.keys(operations);
      // debug("Supp", ops);
      var supported = [];
      ops.forEach(function (key) {
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
        "version": "3"
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
      if (options.blind) {
        // Range Controller version
        debug("Target Position", devices);
        if (!devices) {
          devices = {};
        }
        if (!devices.maxValue) {
          devices.maxValue = 100;
        }
        if (!devices.minValue) {
          devices.minValue = 0;
        }
        response.push({
          "type": "AlexaInterface",
          "interface": "Alexa.RangeController",
          "instance": "Blind.Lift",
          "version": "3",
          "properties": {
            "supported": [{
              "name": "rangeValue"
            }],
            "proactivelyReported": false,
            "retrievable": true
          },
          "capabilityResources": {
            "friendlyNames": [{
              "@type": "asset",
              "value": {
                "assetId": "Alexa.Setting.Opening"
              }
            }]
          },
          "configuration": {
            "supportedRange": {
              "minimumValue": devices.minValue,
              "maximumValue": devices.maxValue,
              "precision": 1
            },
            "unitOfMeasure": "Alexa.Unit.Percent"
          },
          "semantics": {
            "actionMappings": [{
              "@type": "ActionsToDirective",
              "actions": ["Alexa.Actions.Close"],
              "directive": {
                "name": "SetRangeValue",
                "payload": {
                  "rangeValue": 0
                }
              }
            },
            {
              "@type": "ActionsToDirective",
              "actions": ["Alexa.Actions.Open"],
              "directive": {
                "name": "SetRangeValue",
                "payload": {
                  "rangeValue": devices.maxValue
                }
              }
            },
            {
              "@type": "ActionsToDirective",
              "actions": ["Alexa.Actions.Lower"],
              "directive": {
                "name": "AdjustRangeValue",
                "payload": {
                  "rangeValueDelta": -10,
                  "rangeValueDeltaDefault": false
                }
              }
            },
            {
              "@type": "ActionsToDirective",
              "actions": ["Alexa.Actions.Raise"],
              "directive": {
                "name": "AdjustRangeValue",
                "payload": {
                  "rangeValueDelta": 10,
                  "rangeValueDeltaDefault": false
                }
              }
            }
            ],
            "stateMappings": [{
              "@type": "StatesToValue",
              "states": ["Alexa.States.Closed"],
              "value": devices.minValue
            },
            {
              "@type": "StatesToRange",
              "states": ["Alexa.States.Open"],
              "range": {
                "minimumValue": 1,
                "maximumValue": devices.maxValue
              }
            }
            ]
          }
        });
      } else {
        // Original logic
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
      }

      break;
    case "Target Door State":
      if (options.door) {
        // Mode Controller version
        response.push({
          "type": "AlexaInterface",
          "interface": "Alexa.ModeController",
          "instance": "GarageDoor.Position",
          "version": "3",
          "properties": {
            "supported": [{
              "name": "mode"
            }],
            "retrievable": true,
            "proactivelyReported": false
          },
          "capabilityResources": {
            "friendlyNames": [{
              "@type": "asset",
              "value": {
                "assetId": "Alexa.Setting.Mode"
              }
            }]
          },
          "configuration": {
            "ordered": false,
            "supportedModes": [{
              "value": "Position.Up",
              "modeResources": {
                "friendlyNames": [{
                  "@type": "asset",
                  "value": {
                    "assetId": "Alexa.Value.Open"
                  }
                }]
              }
            },
            {
              "value": "Position.Down",
              "modeResources": {
                "friendlyNames": [{
                  "@type": "asset",
                  "value": {
                    "assetId": "Alexa.Value.Close"
                  }
                }]
              }
            }
            ]
          },
          "semantics": {
            "actionMappings": [{
              "@type": "ActionsToDirective",
              "actions": ["Alexa.Actions.Close", "Alexa.Actions.Lower"],
              "directive": {
                "name": "SetMode",
                "payload": {
                  "mode": "Position.Down"
                }
              }
            },
            {
              "@type": "ActionsToDirective",
              "actions": ["Alexa.Actions.Open", "Alexa.Actions.Raise"],
              "directive": {
                "name": "SetMode",
                "payload": {
                  "mode": "Position.Up"
                }
              }
            }
            ],
            "stateMappings": [{
              "@type": "StatesToValue",
              "states": ["Alexa.States.Closed"],
              "value": "Position.Down"
            },
            {
              "@type": "StatesToValue",
              "states": ["Alexa.States.Open"],
              "value": "Position.Up"
            }
            ]
          }
        });
      } else {
        // Original version
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
      }
      break;
    case "Active": // Active on a Fan 2 aka Dyson or Valve
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
          "proactivelyReported": options.events,
          "retrievable": true
        }
      });
      break;
    case "Contact Sensor State": // Contact Sensor State
    case "Current Position":
    case "Current Door State": // Current Door state
    case "Occupancy Detected": // Occupancy Sensor
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.ContactSensor",
        "version": "3",
        "properties": {
          "supported": [{
            "name": "detectionState"
          }],
          "proactivelyReported": options.events,
          "retrievable": true
        }
      });
      break;
    case "Programmable Switch Event": // Doorbell
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.DoorbellEventSource",
        "version": "3",
        "proactivelyReported": true
      });
      break;
    case "Remote Key": // Current Door state
      response.push({
        "type": "AlexaInterface",
        "interface": "Alexa.PlaybackController",
        "version": "3",
        "supportedOperations": ["Play", "Pause", "Stop", "Next", "Rewind"]
      });
      break;
    default:
      // Missing capabilities
      // debug("ERROR: Missing capability", capability);
      break;
  }
  // debug("lookupCapabilities", response);
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
      category = ["INTERIOR_BLIND"];
      break;
    case "000000D0": // Valve / Sprinkler
      category = ["OTHER"];
      break;
    case "00000041": // Garage Door
      category = ["GARAGE_DOOR"];
      break;
    case "00000045": // Garage Door
      category = ["SMARTLOCK"];
      break;
    case "00000047":
      // Outlet
      category = ["SMARTPLUG"];
      break;
    case "00000049":
    case "000000BB": // Air purifier
    case "000000BD": // Humidifier Dehumidifier
      // Switch
      category = ["SWITCH"];
      break;
    case "00000040": // Fan
    case "000000B7": // Fan2
      category = ["FAN"];
      break;
    case "0000008A":
      category = ["TEMPERATURE_SENSOR"];
      break;
    case "00000080":
    case "00000086": // Occupancy Sensor
      category = ["CONTACT_SENSOR"];
      break;
    case "00000121": // Doorbell
      category = ["DOORBELL"];
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
    "deviceID": context.deviceID,

    "aid": context.aid,
    "iid": context.liid
  };
}

function cookie(context) {
  return JSON.stringify({
    "deviceID": context.deviceID,

    "aid": context.aid,
    "iid": context.liid
  });
}

function cookieV(_value, context) {
  return JSON.stringify({
    "deviceID": context.deviceID,

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
    default:
      return false;
  }
}

function atvButton(name) {
  // debug('atvButton', name);
  try {
    switch (name.substr(0, name.indexOf('(')).trim()) {
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
      default:
        return false;
    }
  } catch (err) {
    debug('ERROR: atvButton()', name);
    return false;
  }
}

function playbackNameTranslate(name) {
  // debug("split", name.substring(0, name.lastIndexOf(" ")));
  switch (name.substr(0, name.indexOf('(')).trim()) {
    case "Menu": // Apple TV
      return "Stop";
    case "Skip Fwd": // Yamaha
    case "Right": // Apple-TV-Remote
      return "Next";
    case "Skip Rev": // Yamaha
    case "Left": // Apple-TV-Remote
      return "Rewind";
    default:
      return name.substr(0, name.indexOf('(')).trim();
  }
}

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function inputs(options, accessories) {
  // Create input controller Object

  options.inputs.forEach(function (input) {
    // debug("Input", input);
    var inputs = [];
    var cookies = {};

    // Find endpoint that should be part of the input

    input.devices.forEach(function (device) {
      // debug("Device", device);

      cookies = Object.assign(cookies, _getCookie(device, accessories));

      inputs.push({
        name: device.alexaName
      });
    });

    accessories = _insertInputCapability(input, inputs, cookies, accessories);
  });

  return (accessories);
}

function channel(options, accessories) {
  // Create input controller Object

  options.channel.forEach(function (input) {
    // debug("Input", input);
    // var inputs = [];
    var cookies = {};

    input.alexaName = "ChangeChannel";
    // debug("Input", input);
    cookies = Object.assign(cookies, _getChannelCookie(input, accessories));
    // debug("cookies", cookies);
    accessories = _insertChannelCapability(input, cookies, accessories);
  });

  return (accessories);
}

function combine(options, accessories) {
  var cleanup = [];
  var combine = [];
  // debug("Combine", Array.isArray(options.combine), options.combine);
  if (!Array.isArray(options.combine)) {
    combine.push(options.combine);
  } else {
    combine = options.combine;
  }
  debug("Combine-2", Array.isArray(combine), combine);
  combine.forEach(function (combine) {
    var from = [];
    var target;

    debug("combine", combine);
    for (var endpoint in accessories.event.payload.endpoints) {
      // debug(endpoint);
      // debug("endpoints", combine, accessories.event.payload.endpoints[endpoint].friendlyName);
      if (combine.into === accessories.event.payload.endpoints[endpoint].friendlyName) {
        target = endpoint;
      }
      combine.from.forEach(function (unit) {
        // debug("unit", unit);
        if (unit === accessories.event.payload.endpoints[endpoint].friendlyName) {
          from.push(accessories.event.payload.endpoints[endpoint]);
          cleanup.push(endpoint);
        }
      });
    }

    if (from && accessories.event.payload.endpoints[target]) {
      // debug("Combine", accessories.event.payload.endpoints[target], from);
      _combineAlexaDevices(accessories.event.payload.endpoints[target], from);
      // console.log('\n', JSON.stringify(accessories));
    } else {
      // issue #388 - Better debugging
      if (!target) debug('ERROR: Missing combine into device \'%s\'', combine.into);
      if (from.length < 1) debug('ERROR: Missing combine from devices \'%s\'', combine.from);
    }
    //  } else {
    //    console.log("ERROR: combine settings problem");
  });
  if (cleanup.length > 0) {
    cleanup.forEach(function (endpoint) {
      delete accessories.event.payload.endpoints[endpoint];
    });
    // debug(JSON.stringify(accessories.event.payload.endpoints));
    accessories.event.payload.endpoints = accessories.event.payload.endpoints.filter(function (e) {
      return e;
    });
  }
  // debug("Combine complete");
  return (accessories);
}

function _insertChannelCapability(input, cookies, accessories) {
  //
  // debug("Accessories", accessories);
  for (var endpoint in accessories.event.payload.endpoints) {
    if (input.into === accessories.event.payload.endpoints[endpoint].friendlyName) {
      accessories.event.payload.endpoints[endpoint].capabilities.push({
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

      accessories.event.payload.endpoints[endpoint].cookie =
        Object.assign({}, accessories.event.payload.endpoints[endpoint].cookie, cookies);
      // debug("Cookies", accessories.event.payload.endpoints[endpoint].cookie);
    }
  }

  return (accessories);
}

function _insertInputCapability(input, inputs, cookies, accessories) {
  //
  for (var endpoint in accessories.event.payload.endpoints) {
    if (input.into === accessories.event.payload.endpoints[endpoint].friendlyName) {
      accessories.event.payload.endpoints[endpoint].capabilities.push({
        type: "AlexaInterface",
        interface: "Alexa.InputController",
        version: "3",
        properties: {
          supported: [{
            name: "input"
          }],
          proactivelyReported: false,
          retrievable: true
        },
        inputs: inputs
      });
      // debug("Cookies", cookies);
      accessories.event.payload.endpoints[endpoint].cookie =
        Object.assign({}, accessories.event.payload.endpoints[endpoint].cookie, cookies);
    }
  }

  return (accessories);
}

function _getCookie(device, accessories) {
  var cookie = {};
  for (var endpoint in accessories.event.payload.endpoints) {
    if (device.name === accessories.event.payload.endpoints[endpoint].friendlyName &&
      device.manufacturer === accessories.event.payload.endpoints[endpoint].manufacturerName) {
      // debug(accessories.event.payload.endpoints[endpoint].cookie);
      if (accessories.event.payload.endpoints[endpoint].cookie.TurnOn) {
        cookie[device.alexaName] = accessories.event.payload.endpoints[endpoint].cookie.TurnOn;
        return (cookie);
      }
    }
  }
}

function _getChannelCookie(device, accessories) {
  var cookie = {};
  for (var endpoint in accessories.event.payload.endpoints) {
    if (device.name === accessories.event.payload.endpoints[endpoint].friendlyName &&
      device.manufacturer === accessories.event.payload.endpoints[endpoint].manufacturerName) {
      // debug(accessories.event.payload.endpoints[endpoint].cookie);
      if (accessories.event.payload.endpoints[endpoint].cookie.Channel) {
        cookie[device.alexaName] = accessories.event.payload.endpoints[endpoint].cookie.Channel;
        return (cookie);
      }
    }
  }
}

// Original Version
//
// { interface: "alexa.colorcontroller",
//   aid: 101,
//   iid: 10 }

function _getValue(element, hbResponse) {
  var value;
  if (element.interface.toLowerCase() === "alexa.colorcontroller") {
    value = {
      hue: _round(_getHBValue(element.hue, hbResponse).value, 1),
      saturation: _round(_getHBValue(element.saturation, hbResponse).value / 100, 4),
      brightness: _round(_getHBValue(element.brightness, hbResponse).value / 100, 4)
    };
    debug("Color Value", value);
    return {
      value: value,
      status: 0
    };
  } else {
    return _getHBValue(element, hbResponse);
  }
}

function _getHBValue(element, hbResponse) {
  debug("_getHBValue", element, hbResponse);
  var value, status;
  for (var i in hbResponse) {
    if (hbResponse[i].aid === element.aid && hbResponse[i].iid === element.iid) {
      value = hbResponse[i].value;
      status = hbResponse[i].status;
      break;
    }
  }
  return {
    value: value,
    status: status
  };
}

function _round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

// New version

/* statusObject {
  body: '?id=101.10,101.11',
  interface: 'Alexa.PowerController,Alexa.PowerLevelController',
  deviceID: 'CC:22:3D:E3:CE:30',
  spacer: ','
}

  element    Alexa.PowerController
  hbResponse [
    { aid: 101, iid: 11, value: 100 },
    { aid: 101, iid: 10, value: false }
  ]
*/

/*
function _getValue(element, hbResponse, i) {
  var value;
  if (element.toLowerCase() === "alexa.colorcontroller") {
    value = {
      "hue": round(hbResponse[i].value, 1),
      "saturation": round(hbResponse[i + 1].value / 100, 4),
      "brightness": round(hbResponse[i + 2].value / 100, 4)
    };
    debug("Color Value", value);
    return {
      "value": value,
      "status": 0
    };
  } else {
    return {
      "value": hbResponse[i].value,
      "status": hbResponse[i].status
    };
  }
}
*/

function _combineAlexaDevices(into, from) {
  from.forEach(function (device) {
    // debug('\nFrom', device.friendlyName);
    // Combine Cookies
    for (var cookie in device.cookie) {
      if (!into.cookie[cookie] && cookie !== 'ReportState') {
        // debug('Combining', device.friendlyName, cookie);
        into.cookie[cookie] = device.cookie[cookie];
      } else if (cookie === 'ReportState') {
        debug('Combining ReportState', device.friendlyName, into.cookie, device.cookie[cookie]);
        var cookieReportState = JSON.parse(device.cookie[cookie]);

        debug("into.cookie[cookie]", into.cookie[cookie]);
        if (into.cookie[cookie]) {
          var before = JSON.parse(into.cookie[cookie]);
        } else {
          var before = [];
        }
        // debug('Report state before', before);
        for (var reportState in cookieReportState) {
          debug('Combining Cookie', device.friendlyName, cookie, cookieReportState[reportState].interface);
          if (!_existingCapability(before, cookieReportState[reportState])) {
            before.push(cookieReportState[reportState]);
          }
        }
        into.cookie[cookie] = JSON.stringify(before);
      } else {
        // debug('ERROR: duplicate cookie', device.friendlyName, cookie);
      }
    } // Finshed combining cookies, now need to combine capabilities
    // Combine capabilities
    device.capabilities.forEach(function (capability) {
      if (capability.interface !== 'Alexa') {
        debug('Combining capability', device.friendlyName, capability.interface);
        if (!_existingCapability(into.capabilities, capability)) {
          into.capabilities.push(capability);
        }
      }
    });
  });
  // debug('\nAfter', JSON.stringify(into, null, 4));
}

function _existingCapability(into, from) {
  var found = false;
  into.forEach((item, i) => {
    if (item.interface === from.interface) {
      debug("%s === %s", item.interface, from.interface);
      found = true;
    }
  });
  return found;
}

function _lockState(state) {
  // Characteristic.LockCurrentState.UNSECURED = 0;
  // Characteristic.LockCurrentState.SECURED = 1;
  // Characteristic.LockCurrentState.JAMMED = 2;
  // Characteristic.LockCurrentState.UNKNOWN = 3;
  switch (state) {
    case 0:
      return "UNLOCKED";
    case 1:
      return "LOCKED";
    default:
      return "JAMMED";
  }
}

function _getThermoMode(mode) {
  // Characteristic.CurrentHeatingCoolingState.OFF = 0;
  // Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  // Characteristic.CurrentHeatingCoolingState.COOL = 2;
  switch (mode) {
    case 0:
      return "OFF";
    case 1:
      return "HEAT";
    case 2:
      return "COOL";
    case 3:
      return "AUTO";
  }
}


function checkEventDeviceList(endpoints) {
  if (this.deviceList && this.deviceList.length > 0 && ['allow', 'deny'].includes(this.deviceListHandling)) {
    debug(`INFO: DeviceList - The following devices are ${this.deviceListHandling} =>`, this.deviceList);
    var response = [];
    for (var key in endpoints) {
      var endpoint = endpoints[key];
      if (this.deviceListHandling === "allow") {
        if (verifyDeviceInList(this.deviceList, endpoint.friendlyName)) {
          response[key] = endpoint;
          debug("INFO: DeviceList - allow =>", endpoint.friendlyName);
        }
      } else if (this.deviceListHandling === "deny") {
        if (verifyDeviceInList(this.deviceList, endpoint.friendlyName)) {
          debug("INFO: DeviceList - deny =>", endpoint.friendlyName);
        } else {
          response[key] = endpoint;
        }
      }
    }
    return (response);
  } else if (['none'].includes(this.deviceListHandling)) {
    debug("INFO: DeviceList - none");
    return endpoints;
  } else {
    debug("INFO: DeviceList empty feature not enabled or config error in deviceListHandling");
    return endpoints;
  }
}

function verifyDeviceInList(deviceList, deviceName) {
  for (var i = 0, len = deviceList.length; i < len; i++) {
    if (deviceName === deviceList[i] || deviceName.match(new RegExp(deviceList[i]))) return true;
  }
  return false;
}
