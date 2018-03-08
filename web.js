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

var alexaLocal = require('./lib/alexaLocal.js').alexaLocal;
var alexaHAP = require('./lib/alexaHAP.js');
var alexaTranslator = require('./lib/alexaTranslator.js');

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

  alexaHAP.HAPDiscovery({
    "pin": this.pin
  });
  //  init(this);

  alexa = new alexaLocal(options);

  alexa.on('alexa', _alexaMessage.bind(this));
  alexa.on('alexa.discovery', _alexaDiscovery.bind(this));
  alexa.on('alexa.powercontroller', _alexaPowerController.bind(this));
  alexa.on('alexa.powerlevelcontroller', _alexaPowerLevelController.bind(this));
  alexa.on('Alexa.colorcontroller', _alexaColorController.bind(this));
}

alexahome.prototype.configureAccessory = function(accessory) {

  this.log("configureAccessory");
  callback();
}

function _alexaDiscovery(message, callback) {

  alexaHAP.HAPs(function(endPoints) {
    var response = alexaTranslator.endPoints(message, endPoints);
    this.log("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
    //    debug("Discovery Response", JSON.stringify(response, null, 4));
    callback(null, response);
  }.bind(this))

}

function _alexaPowerController(message, callback) {
  var action = message.directive.header.name;
  var endpointId = message.directive.endpoint.endpointId;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log.error("_alexaPowerController missing action", action, e.message, message.directive.endpoint.cookie);
    callback(e);
    return;
  }
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": haAction.value
    }]
  };
  alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("PowerController", action, haAction.host, haAction.port, status, err);
    var response = alexaTranslator.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function _alexaColorController(message, callback) {
  var action = message.directive.header.name;
  var endpointId = message.directive.endpoint.endpointId;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log.error("_alexaColorController missing action", action, e.message, message.directive.endpoint.cookie);
    callback(e);
    return;
  }
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": haAction.value
    }]
  };
  alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("ColorController", action, haAction.host, haAction.port, status, err);
    var response = alexaTranslator.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function _alexaPowerLevelController(message, callback) {
  //debug(JSON.stringify(message, null, 4));
  var action = message.directive.header.name;
  var endpointId = message.directive.endpoint.endpointId;
  var powerLevel, haAction;
  try {
    haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log.error("_alexaPowerLevelController missing action", action, e.message, message.directive.endpoint.cookie);
    callback(e);
    return;
  }

  //debug("haAction", haAction);
  switch (action.toLowerCase()) {
    case "adjustpowerlevel":
      // Need to get current value prior to dimming
      alexaHAP.HAPstatus(haAction.host, haAction.port, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
        this.log("PowerLevelController-get", action, haAction.host, haAction.port, status, err);

        var powerLevelDelta = message.directive.payload.powerLevelDelta;
        powerLevel = status.characteristics[0].value + powerLevelDelta > 100 ? 100 : status.characteristics[0].value + powerLevelDelta;
        powerLevel = powerLevel < 0 ? 0 : powerLevel;
        var body = {
          "characteristics": [{
            "aid": haAction.aid,
            "iid": haAction.iid,
            "value": powerLevel
          }]
        };
        alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
          this.log("PowerLevelController-set", action, haAction.host, haAction.port, status, body, err);
          var response = alexaTranslator.alexaResponse(message, status, err, powerLevel);
          callback(err, response);
        }.bind(this));
      }.bind(this));
      break;
    case "setpowerlevel":
      // No need to do anything
      powerLevel = message.directive.payload.powerLevel;
      var body = {
        "characteristics": [{
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": powerLevel
        }]
      };
      alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
        this.log("PowerLevelController", action, haAction.host, haAction.port, status, body, err);
        var response = alexaTranslator.alexaResponse(message, status, err, powerLevel);
        callback(err, response);
      }.bind(this));
      break;
  }

}

function _alexaMessage(message, callback) {
  //  this.log("handleAlexaMessage", JSON.stringify(message, null, 4));
  var now = new Date();

  switch (message.directive.header.name.toLowerCase()) {
    case "reportstate": // aka getStatus
      var action = message.directive.header.name;
      var endpointId = message.directive.endpoint.endpointId;
      try {
        var reportState = JSON.parse(message.directive.endpoint.cookie[action]);
      } catch (e) {
        this.log.error("_alexaMessage missing action", action, e.message, message.directive.endpoint.cookie);
        callback(e);
        return;
      }
      var body = "?id=";
      var spacer = ""; // No spacer for first element
      var host, port;
      reportState.forEach(function(element) {
        host = element.host;
        port = element.port;
        body = body + spacer + element.aid + "." + element.iid;
        spacer = ",";
      });

      // For performance HAP GET Characteristices supports getting multiple in one call
      alexaHAP.HAPstatus(host, port, body, function(err, status) {
        this.log("reportState", action, host, port, status, err);
        var response = alexaTranslator.alexaStateResponse(message, reportState, status, err);
        callback(err, response);
      }.bind(this));
      break;

    default:
      this.log.error("Unhandled _alexaMessage Directive", message.directive.header.name);
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
