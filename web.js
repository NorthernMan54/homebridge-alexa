//  {
//    "platform": "Alexa",
//    "name": "Alexa",
//    "username": "....",
//    "password": "...."
//  }

"use strict";

var Accessory, Service, Characteristic, UUIDGen, CommunityTypes;
var http = require('http');
var debug = require('debug')('AlexaPlugin');

var AlexaConnection = require('./lib/AlexaLocalClient.js').AlexaLocalClient;
var hap = require('./lib/HAPInterface.js');
var translator = require('./lib/AlexaHAPTranslator.js');

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

  hap.HAPDiscovery({
    "pin": this.pin
  });
  //  init(this);

  alexa = new AlexaConnection(options);

  alexa.on('alexa', handleAlexaMessage.bind(this));
  alexa.on('alexa.discovery', _alexaDiscovery.bind(this));
  alexa.on('alexa.powercontroller', _alexaPowerController.bind(this));
  alexa.on('alexa.powerlevelcontroller', _alexaPowerLevelController.bind(this));

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

  hap.HAPs(function(endPoints) {
    var response = translator.endPoints(message, endPoints);
    this.log("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
    debug("Discovery Response",JSON.stringify(response, null, 4));
    callback(null, response);
  }.bind(this))

}

function _alexaPowerController(message, callback) {
  var action = message.directive.header.name;
  var endpointId = message.directive.endpoint.endpointId;
  var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  //      aid: 2, iid: 10, value: 1
  //      { \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": haAction.value
    }]
  };
  hap.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("Status", action, haAction.host, haAction.port, err, status);
    var response = translator.alexaResponseSuccess(message);
    callback(err, response);
  }.bind(this));
}

function _alexaPowerLevelController(message, callback) {
  var action = message.directive.header.name;
  var endpointId = message.directive.endpoint.endpointId;
  var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  var powerLevel = message.directive.payload.powerLevel;

  //      aid: 2, iid: 10, value: 1
  //      { \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": powerLevel
    }]
  };
  hap.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("Status", action, haAction.host, haAction.port, err, status);
    var response = translator.alexaResponseSuccess(message);
    callback(err, response);
  }.bind(this));
}

function handleAlexaMessage(message, callback) {
  this.log("handleAlexaMessage", message);
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

}
