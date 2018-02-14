//{
//"platform": "Alexa",
//     "name": "Alexa",
//     "port": 8082
//}

"use strict";

var Accessory, Service, Characteristic, UUIDGen, CommunityTypes;
var http = require('http');
var HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher();
var fs = require('fs');
var path = require('path');
var debug = require('debug')('alexaPlugin');


var alexaConnection = require('./lib/alexaLocalClient.js').alexaLocalClient;

//var mdns = require('mdns');
var hap = require('./lib/HAPDiscovery.js');
var translator = require('./lib/AlexaHBTranslator.js');
var mqtt = require('mqtt');
var alexa;
var options = {};
var self;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  Accessory = homebridge.platformAccessory;
  UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform("homebridge-alexa", "Alexa", alexahome);
};

function alexahome(log, config, api) {
  this.log = log;
  this.config = config;
  this.pin = config['pin'] || "031-45-154";
  this.username = config['username'] || false;
  this.password = config['password'] || false;
  self = this;

  // MQTT Options

  options = {
    username: this.username,
    password: this.password,
    clientId: this.username,
    reconnectPeriod: 5000,
    servers: [{
        protocol: 'mqtts',
        host: 'homebridge.cloudwatch.net',
        port: 8883
      },
      {
        protocol: 'mqtt',
        host: 'homebridge.cloudwatch.net',
        port: 1883
      }
    ]
  };

  hap.HAPDiscovery({ "pin": this.pin });
//  init(this);

  alexa = new alexaConnection(options);

  alexa.on('alexa', handleAlexaMessage.bind(this));
  alexa.on('alexa.discovery', _alexaDiscovery.bind(this));
  alexa.on('alexa.powercontroller', handleAlexaMessage.bind(this));



}

alexahome.prototype = {
  accessories: function(callback) {

    this.log("accessories");
    callback();
  }
};

alexahome.prototype.configureAccessory = function(accessory) {

  this.log("configureAccessory");
  callback();
}

function _alexaDiscovery(message, callback) {
  //debug("handleAlexaMessage", message);
  var now = new Date();
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa.Discovery",
        "name": "Discover.Response",
        "payloadVersion": "3",
        "messageId": message.directive.header.messageId
      },
      "payload": {
        "endpoints": translator.endPoints(hap.HAPs())
      }
    }
  };
  debug("_alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
//  debug("_alexaDiscovery - response", JSON.stringify(response));
  callback(null, response);
}


function handleAlexaMessage(message, callback) {
  debug("handleAlexaMessage", message);
  var now = new Date();

  switch (message.directive.header.namespace.toLowerCase()) {
    case "alexa": // aka getStatus
      var response = {
        "context": {
          "properties": [{
              "namespace": "Alexa.EndpointHealth",
              "name": "connectivity",
              "value": {
                "value": "OK"
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 200
            },
            {
              "namespace": "Alexa.PowerController",
              "name": "powerState",
              "value": "ON",
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 0
            }
          ]
        },
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "StateReport",
            "payloadVersion": "3",
            "messageId": message.directive.header.messageId,
            "correlationToken": message.directive.header.correlationToken
          },
          "endpoint": {
            "endpointId": message.directive.endpoint.endpointId
          },
          "payload": {}
        }
      };
      break;
    case "alexa.powercontroller":
      var action = message.directive.header.name;
      var endpointId = message.directive.endpoint.endpointId;
      var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
      debug("alexa.powercontroller", action, endpointId, haAction);
      //      aid: 2, iid: 10, value: 1
      //      { \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"
      var body = {
        "characteristics": [{
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": haAction.value
        }]
      };
      hb.control(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
        debug("Status", err, status);
        var response = alexaResponseSuccess(message);
        callback(null, response);
      });
      var response = alexaResponseSuccess(message);
      break;
    case "alexa.powerlevelcontroller":
      var action = message.directive.header.name;
      var endpointId = message.directive.endpoint.endpointId;
      var powerLevel = message.directive.payload.powerLevel;
      var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
      debug("alexa.powerlevelcontroller", action, endpointId, haAction, powerLevel);
      //      aid: 2, iid: 10, value: 1
      //      { \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"
      var body = {
        "characteristics": [{
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": powerLevel
        }]
      };
      hb.control(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
        debug("Status", err, status);
        var response = alexaResponseSuccess(message);
        callback(null, response);
      });
      var response = alexaResponseSuccess(message);
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
  debug("handleAlexaMessage - response", JSON.stringify(response));
  callback(null, response);
}

function alexaResponseSuccess(message) {
  var now = new Date();
  switch (message.directive.header.namespace.toLowerCase()) {
    case "alexa.discovery":
      break;
    case "alexa.powercontroller":



      var response = {
        "context": {
          "properties": [{
            "namespace": "Alexa.PowerController",
            "name": "powerState",
            "value": message.directive.header.name.substr(4),
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
  debug("Response", response);
  return response;
}
