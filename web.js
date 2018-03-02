//  {
//    "platform": "Alexa",
//    "name": "Alexa",
//    "username": "....",
//    "password": "...."
//  }

"use strict";

var Accessory, Service, Characteristic, UUIDGen;
var http = require('http');
var debug = require('debug')('AlexaPlugin');

var AlexaConnection = require('./lib/AlexaLocalClient.js').AlexaLocalClient;
var hap = require('./lib/HAPInterface.js');
var translator = require('./lib/AlexaHAPTranslator.js');

var mqtt = require('mqtt');
var alexa;
var options = {};

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

  if (api) {
    this.api = api;
    this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
  }
}

alexahome.prototype = {
  accessories: function(callback) {

    this.log("accessories");
    callback();
  }
};

alexahome.prototype.didFinishLaunching = function() {

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

    alexa.on('alexa', _alexaMessage.bind(this));
    alexa.on('alexa.discovery', _alexaDiscovery.bind(this));
    alexa.on('alexa.powercontroller', _alexaPowerController.bind(this));
    alexa.on('alexa.powerlevelcontroller', _alexaPowerLevelController.bind(this));
}

alexahome.prototype.configureAccessory = function(accessory) {

  this.log("configureAccessory");
  callback();
}

function _alexaDiscovery(message, callback) {

  hap.HAPs(function(endPoints) {
    var response = translator.endPoints(message, endPoints);
    this.log("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
    debug("Discovery Response", JSON.stringify(response, null, 4));
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

function _alexaMessage(message, callback) {
  this.log("handleAlexaMessage", JSON.stringify(message, null, 4));
  var now = new Date();

  switch (message.directive.header.name.toLowerCase()) {
    case "reportstate": // aka getStatus
      var action = message.directive.header.name;
      var endpointId = message.directive.endpoint.endpointId;
      var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
      var body = "?id="+haAction.aid+"."+haAction.iid;

      hap.HAPstatus(haAction.host, haAction.port, body, function(err, status) {
        this.log("Status", action, haAction.host, haAction.port, err, status);
        var response = translator.alexaStateResponse(message,status);
        callback(err, response);
      }.bind(this));
      break;

    default:
      this.log.error("Unhandled Alexa Directive", message.directive.header.name);
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
