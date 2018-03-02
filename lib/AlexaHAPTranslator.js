var debug = require('debug')('alexaTranslator');

module.exports = {
  endPoints: endPoints,
  alexaResponseSuccess: alexaResponseSuccess,
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
  var alexadevices = {};

  for (var accessory in hb.accessories) {

    var aid = hb.accessories[accessory].aid;
    var device = hb.accessories[accessory];
    var iid, name, description, model, manufacturer;

    for (var service in device.services) {
      name = "";
      var serviceType = device.services[service].type;
      var cookie = {};
      var capabilities = [];
      capabilities.push({
        "type": "AlexaInterface",
        "interface": "Alexa",
        "version": "3"
      });
      var displayCategories = [];
      // Lightbulb, Outlet
      // Switch, Fan
      // WindowCovering
      if (serviceType.startsWith("00000043") || serviceType.startsWith("00000047") ||
        serviceType.startsWith("00000049") || serviceType.startsWith("00000040") ||
        serviceType.startsWith("0000008C") ||
        serviceType.startsWith("0000003E")) {
        for (var id in device.services[service].characteristics) {
          //      log("ID=",id);
          var characteristic = device.services[service].characteristics[id];
          var type = characteristic.type;
          var iid = characteristic.iid;
          displayCategories = _lookupDisplayCategory(serviceType);

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
            name = characteristic.value;
            description = characteristic.description;
          }

          if (type.startsWith("00000025")) {
            // Accessory On/Off
            //                        log("Accessory ( Switch )= ", aid, iid, name, description);
            cookie["ReportState"] = "{ \"host\": \"" + host + "\", \"port\": " + port + ", \"aid\": " +
              parseInt(aid) + ", \"iid\": " + parseInt(iid) + " }";
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
            cookie["SetPowerLevel"] = "{ \"host\": \"" + host + "\", \"port\": " + port + ", \"aid\": " +
              parseInt(aid) + ", \"iid\": " + parseInt(iid) + " }";
            cookie["ReportState"] = "{ \"host\": \"" + host + "\", \"port\": " + port + ", \"aid\": " +
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
          alexadevices[host + ":" +
            port + ",aid: " + aid.toString() + ",iid: " + iid.toString()] = {
            'friendlyName': name,
            'description': hapname + " " + name + " Switch",
            'modelName': model,
            'manufacturerName': manufacturer,
            'endpointId': host + ":" +
              port + ",aid: " + aid.toString() + ",iid: " + iid.toString(),
            'cookie': cookie,
            'displayCategories': displayCategories,
            'capabilities': capabilities
          };
          //                    log("Object: %s", JSON.stringify(alexadevices[aid.toString()], null, 2));
        }
      }
    }

  }

  debug("Alexa Controllable", hapname, Object.keys(alexadevices).length);
  return alexadevices;
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
    default:
      // No mapping exists
      category = ["OTHER"];
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

function alexaResponseSuccess(message) {
  var now = new Date();
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
            "name": "ErrorResponse",
            "namespace": "Alexa",
            "payloadVersion": "3",
            "messageId": message.directive.header.messageId
          },
          "payload": {
            "endpoints": []
          }
        }
      };


  }
  //  debug("alexaResponseSuccess", JSON.stringify(response));
  return response;
}

function alexaStateResponse(message, status) {
  var endpointId = message.directive.endpoint.endpointId;
  var messageId = message.directive.header.messageId;
  var correlationToken = message.directive.header.correlationToken;
  var now = new Date();
  switch (message.directive.header.name.toLowerCase()) {
    case "reportstate":

      var response = {
        "context": {
          "properties": [{
              "namespace": "Alexa.ThermostatController",
              "name": "targetSetpoint",
              "value": {
                "value": 25.0,
                "scale": "CELSIUS"
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 200
            },
            {
              "namespace": "Alexa.ThermostatController",
              "name": "thermostatMode",
              "value": "HEAT",
              "timeOfSample": "2017-02-03T16:20:50.52Z",
              "uncertaintyInMilliseconds": 6000
            }
          ]
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
      console.log("Unhandled Alexa Directive", message.directive.header.name);
      var response = {
        "event": {
          "header": {
            "name": "ErrorResponse",
            "namespace": "Alexa",
            "payloadVersion": "3",
            "messageId": message.directive.header.messageId
          },
          "payload": {
            "endpoints": []
          }
        }
      };


  }
  debug("alexaStatusResponse", JSON.stringify(response));
  return response;
}
