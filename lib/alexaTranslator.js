var debug = require('debug')('alexaTranslator');

module.exports = {
  endPoints: endPoints,
  alexaResponse: alexaResponse,
  alexaStateResponse: alexaStateResponse
};

function endPoints(message, accessories) {
  var devices = [];
  accessories.forEach(function(element) {
    devices.push(_parseHbtoAlexa(element.host, element.port, element.HBname, element.accessories));
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

function _parseHbtoAlexa(host, port, hapname, hb) {
  var alexaDevices = {};
  var alexaCommands = {};

  for (var accessory in hb.accessories) {

    var aid = hb.accessories[accessory].aid;
    var device = hb.accessories[accessory];
    var iid, name, description, model, manufacturer;

    for (var service in device.services) {
      name = "";
      var serviceType = device.services[service].type;
      var cookie = {};
      var capabilities = [];
      var alexaCommand = [];
      capabilities.push({
        "type": "AlexaInterface",
        "interface": "Alexa",
        "version": "3"
      });
      var displayCategories = [];
      var ReportState = [];
      var description = "Unknown";
      // Lightbulb, Outlet
      // Switch, Fan
      // WindowCovering, TemperatureSensor
      if (serviceType.startsWith("00000043") || serviceType.startsWith("00000047") ||
        serviceType.startsWith("00000049") || serviceType.startsWith("00000040") ||
        serviceType.startsWith("0000008C") || serviceType.startsWith("0000008A") ||
        serviceType.startsWith("0000003E")) {
        for (var id in device.services[service].characteristics) {
          //      log("ID=",id);
          var characteristic = device.services[service].characteristics[id];
          var type = characteristic.type;
          var iid = characteristic.iid;
          displayCategories = _lookupDisplayCategory(serviceType);
          description = hapname + " " + name + " " + _lookupFriendlyDisplayCategory(serviceType);

          if (type.startsWith("00000020")) {
            // Accessory Model
            manufacturer = characteristic.value;
          }
          if (type.startsWith("00000021")) {
            // Accessory Model
            model = characteristic.value;
          }
          if (type.startsWith("00000023")) {
            // Accessory Name
            // homebridge-hue has additional 0x23 characteristics for last updated that confuse things.

            if (characteristic.description == "Name")
              name = characteristic.value;
          }
          // Current Temperature 00000011
          if (type.startsWith("00000011")) {

            alexaCommand.push({
              "Alexa, what is the temperature in the " + name
            });

            ReportState.push({
              "interface": "Alexa.TemperatureSensor",
              "host": host,
              "port": port,
              "aid": parseInt(aid),
              "iid": parseInt(iid)
            });

            capabilities.push({
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
          }

          if (type.startsWith("0000007C")) {
            // Target Postion for windowcoverings

            alexaCommand.push({
              "Alexa, turn on " + name
            });
            alexaCommand.push({
              "Alexa, turn off " + name
            });
            ReportState.push({
              "interface": "Alexa.PowerController",
              "host": host,
              "port": port,
              "aid": parseInt(aid),
              "iid": parseInt(iid)
            });
            cookie["TurnOn"] = "{ \"host\": \"" + host + "\", \"port\": " + port + ", \"aid\": " +
              parseInt(aid) + ", \"iid\": " + parseInt(iid) + ", \"value\": 100 }";
            cookie["TurnOff"] = "{ \"host\": \"" + host + "\", \"port\": " + port + ", \"aid\": " +
              parseInt(aid) + ", \"iid\": " + parseInt(iid) + ", \"value\": 0 }";

            capabilities.push({
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

          if (type.startsWith("00000025")) {
            // Accessory On/Off
            //                        log("Accessory ( Switch )= ", aid, iid, name, description);
            alexaCommand.push({
              "Alexa, turn on " + name
            });
            alexaCommand.push({
              "Alexa, turn off " + name
            });
            ReportState.push({
              "interface": "Alexa.PowerController",
              "host": host,
              "port": port,
              "aid": parseInt(aid),
              "iid": parseInt(iid)
            });
            cookie["TurnOn"] = "{ \"host\": \"" + host + "\", \"port\": " + port + ", \"aid\": " +
              parseInt(aid) + ", \"iid\": " + parseInt(iid) + ", \"value\": 1 }";
            cookie["TurnOff"] = "{ \"host\": \"" + host + "\", \"port\": " + port + ", \"aid\": " +
              parseInt(aid) + ", \"iid\": " + parseInt(iid) + ", \"value\": 0 }";
            capabilities.push({
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
          // Brightness || RotationSpeed
          // Target Postion
          if (type.startsWith("00000008") || type.startsWith("00000029") ||
            type.startsWith("0000007C")) {
            // Accessory Bright/Dim
            alexaCommand.push({
              "Alexa, turn " + name + " to 50"
            });
            ReportState.push({
              "interface": "Alexa.PowerLevelController",
              "host": host,
              "port": port,
              "aid": parseInt(aid),
              "iid": parseInt(iid)
            });
            cookie["SetPowerLevel"] = "{ \"host\": \"" + host + "\", \"port\": " + port + ", \"aid\": " +
              parseInt(aid) + ", \"iid\": " + parseInt(iid) + " }";
            capabilities.push({
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
            //                        log("Accessory ( Dimmer )= ", aid, iid, name, description);
          }

        }

        if (capabilities.length > 1) {
          cookie["ReportState"] = JSON.stringify(ReportState);
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
          alexaCommands[host + ":" +
            port + ",aid: " + aid.toString() + ",iid: " + iid.toString()] = {
            'friendlyName': name,
            'description': description,
            'modelName': model,
            'manufacturerName': manufacturer,
            'alexaCommand': alexaCommand
          };

          //          console.log("\"" + name + "\",\"" + description + "\",\"" + manufacturer + "\",\"" + model + "\"");
          //                    log("Object: %s", JSON.stringify(alexadevices[aid.toString()], null, 2));
        }
      }
    }

  }

  debug("Alexa Controllable", hapname, Object.keys(alexaDevices).length);
  return alexaDevices;
}

function _lookupDisplayCategory(service) {
  var category;
  switch (service.substr(0, 8)) {
    case "00000043": // lightbulb
    case "0000008C": // Window Covering
    case "00000040": // Fan
      category = ["LIGHT"];
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
    case "00000040": // Fan
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

function alexaResponse(message, status, err) {
  var now = new Date();

  if (err) {
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

  } else {

    switch (message.directive.header.namespace.toLowerCase()) {
      case "alexa":
        break;
      case "alexa.discovery":
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
              "value": message.directive.payload.powerLevel,
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
        console.log("Unhandled Alexa Directive", message.directive.header.namespace);
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
              "message": "Unhandled Alexa Directive"
            }
          }
        };
    }
  }
  debug("alexaResponse", JSON.stringify(response));
  return response;
}

function _getInterfaceForAccessory(reportState, aid, iid) {
  var interface;
  reportState.forEach(function(element) {
    if (aid == element.aid && iid == element.iid) {
      interface = element.interface;
    }
  });

  return interface;
}

function _StateToProperties(reportState, status) {
  var properties = [];
  var now = new Date();
  debug("status", status);
  // Convert each individual HAP status to Alexa Format
  status.forEach(function(element) {
    debug(element);

    switch (_getInterfaceForAccessory(reportState, element.aid, element.iid).toLowerCase()) {
      case "alexa.powercontroller":
        properties.push({
          "namespace": "Alexa.PowerController",
          "name": "powerState",
          "value": element.value ? "ON" : "OFF",
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.powerlevelcontroller":
        properties.push({
          "namespace": "Alexa.PowerLevelController",
          "name": "powerLevel",
          "value": parseInt(element.value),
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      case "alexa.temperaturesensor":
        properties.push({
          "namespace": "Alexa.TemperatureSensor",
          "name": "temperature",
          "value": {
            "value": element.value,
            "scale": "CELSIUS"
          },
          "timeOfSample": now.toISOString(),
          "uncertaintyInMilliseconds": 500
        });
        break;
      default:
        console.log("ERROR: statusReport unknown/handled device", element, reportState);
    }

  });

  return properties;
}

function alexaStateResponse(message, reportState, status, err) {
  var endpointId = message.directive.endpoint.endpointId;
  var messageId = message.directive.header.messageId;
  var correlationToken = message.directive.header.correlationToken;

  if (err) {

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
            "properties": _StateToProperties(reportState, status.characteristics),
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
  debug("alexaStatusResponse", JSON.stringify(response));
  return response;
}
