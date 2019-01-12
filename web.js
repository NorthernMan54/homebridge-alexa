"use strict";
var Accessory, Service, Characteristic, UUIDGen;
var http = require('http');
var debug = require('debug')('alexaPlugin');

var alexaLocal = require('./lib/alexaLocal.js').alexaLocal;
var alexaHAP = require('./lib/alexaHAP.js');
var alexaTranslator = require('./lib/alexaTranslator.js');
const packageConfig = require('./package.json');

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
  this.filter = config['filter'];
  this.refresh = config['refresh'] || 60 * 15; // Value in seconds, default every 15 minute's
  this.speakers = config['speakers'] || {}; // Array of speaker devices

  if (!this.username || !this.password)
    this.log.error("Missing username and password");

  if (api) {
    this.api = api;
    this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
  }

  this.log.info(
    '%s v%s, node %s, homebridge v%s',
    packageConfig.name, packageConfig.version, process.version, api.serverVersion
  );
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
    servers: [
      {
        protocol: 'mqtt',
        host: 'homebridgebeta.cloudwatch.net',
        port: 1883
      }
    ]
  };

  alexaHAP.HAPDiscovery({
    "pin": this.pin,
    "refresh": this.refresh
  });
  //  init(this);

  alexa = new alexaLocal(options);

  alexa.on('Alexa', _alexaMessage.bind(this));
  alexa.on('Alexa.Discovery', _alexaDiscovery.bind(this));
  alexa.on('Alexa.PowerController', _alexaPowerController.bind(this));
  alexa.on('Alexa.PowerLevelController', _alexaPowerLevelController.bind(this));
  alexa.on('Alexa.ColorController', _alexaColorController.bind(this));
  alexa.on('Alexa.ColorTemperatureController', _alexaColorTemperatureController.bind(this));
  alexa.on('Alexa.PlaybackController', _alexaPlaybackController.bind(this));
  alexa.on('Alexa.Speaker', _alexaSpeaker.bind(this));
  alexa.on('Alexa.ThermostatController', _alexaThermostatController.bind(this));
  //alexa.on('Alexa.StepSpeaker', _alexaStepSpeaker.bind(this));
}

alexahome.prototype.configureAccessory = function(accessory) {

  this.log("configureAccessory");
  callback();
}

function _alexaDiscovery(message, callback) {

  alexaHAP.HAPs(function(endPoints) {
    var response = alexaTranslator.endPoints(message, endPoints, this.filter, this.speakers);
    if (response.event.payload.endpoints.length < 1) {
      this.log("ERROR: HAP Discovery failed, please review config");

    } else {
      this.log("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
    }
    //debug("Discovery Response", JSON.stringify(response, null, 4));
    callback(null, response);
  }.bind(this))

}

function _alexaColorTemperatureController(message, callback) {
  var action = message.directive.header.name;
  var endpointId = message.directive.endpoint.endpointId;
  var colorTemperature;

  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log.error("_alexaColorTemperatureController missing action", action, e.message, message.directive.endpoint.cookie);
    callback(e);
    return;
  }
  switch (action.toLowerCase()) {
    case "decreasecolortemperature":
    case "increasecolortemperature":
      // This characteristic describes color temperature which is represented in the reciprocal megakelvin (MK-1) or mirek scale. MK = 1,000,000 / K where MK is the desired mirek value and K is temperature in Kelvins.

      alexaHAP.HAPstatus(haAction.host, haAction.port, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
        this.log("ColorTemperatureController-get", action, haAction.host, haAction.port, status, err);

        var colorTemperatureDelta = 40;
        if (action.toLowerCase() == "decreasecolortemperature")
          colorTemperatureDelta = -40;
        colorTemperature = status.characteristics[0].value + colorTemperatureDelta > 500 ? 500 : status.characteristics[0].value + colorTemperatureDelta;
        colorTemperature = colorTemperature < 140 ? 140 : colorTemperature;
        var body = {
          "characteristics": [{
            "aid": haAction.aid,
            "iid": haAction.iid,
            "value": colorTemperature
          }]
        };
        alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
          this.log("ColorTemperatureController-change", action, haAction.host, haAction.port, status, body, err);
          var response = alexaTranslator.alexaResponse(message, status, err, _round(1000000 / colorTemperature));
          callback(err, response);
        }.bind(this));
      }.bind(this));
      break;
    case "setcolortemperature":
      // No need to do anything
      colorTemperature = _round(1000000 / message.directive.payload.colorTemperatureInKelvin);
      var body = {
        "characteristics": [{
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": colorTemperature
        }]
      };
      alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
        this.log("ColorTemperatureController-set", action, haAction.host, haAction.port, status, body, err);
        var response = alexaTranslator.alexaResponse(message, status, err, message.directive.payload.colorTemperatureInKelvin);
        callback(err, response);
      }.bind(this));
      break;
  }
}

function _alexaPlaybackController(message, callback) {
  var action = message.directive.header.name;
  var endpointId = message.directive.endpoint.endpointId;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log.error("_alexaPlaybackController missing action", action, e.message, message.directive.endpoint.cookie);
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
    this.log("PlaybackController", action, haAction.host, haAction.port, status, err);
    var response = alexaTranslator.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
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

function _alexaThermostatController(message, callback) {
  var action = message.directive.header.name;
  var endpointId = message.directive.endpoint.endpointId;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log.error("_alexaThermostatController missing action", action, e.message, message.directive.endpoint.cookie);
    callback(e);
    return;
  }
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": message.directive.payload.targetSetpoint.value
    }]
  };
  alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("ThermostatController", action, haAction.host, haAction.port, status, err);
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
  debug("action", haAction, message.directive.payload);
  var body = {
    "characteristics": [{
      "aid": haAction.on.aid,
      "iid": haAction.on.iid,
      "value": 1
    }, {
      "aid": haAction.hue.aid,
      "iid": haAction.hue.iid,
      "value": message.directive.payload.color.hue
    }, {
      "aid": haAction.saturation.aid,
      "iid": haAction.saturation.iid,
      "value": message.directive.payload.color.saturation * 100
    }]
  };
  debug("color HB command", body);
  alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("ColorController", action, haAction.host, haAction.port, status, err);
    var response = alexaTranslator.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function _alexaPowerLevelController(message, callback) {
  // debug(JSON.stringify(message, null, 4));
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

function _alexaSpeaker(message, callback) {
  //debug(JSON.stringify(message, null, 4));
  var action = message.directive.header.name;
  var endpointId = message.directive.endpoint.endpointId;
  var volume, haAction;
  try {
    haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log.error("_alexaSpeaker missing action", action, e.message, message.directive.endpoint.cookie);
    callback(e);
    return;
  }

  switch (action.toLowerCase()) {
    case "adjustvolume":
      // Need to get current value prior to dimming
      alexaHAP.HAPstatus(haAction.host, haAction.port, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
        this.log("Speaker-get", action, haAction.host, haAction.port, status, err);

        var volumeDelta = message.directive.payload.volume;
        volume = status.characteristics[0].value + volumeDelta > 100 ? 100 : status.characteristics[0].value + volumeDelta;
        volume = volume < 0 ? 0 : volume;
        var body = {
          "characteristics": [{
            "aid": haAction.aid,
            "iid": haAction.iid,
            "value": volume
          }]
        };
        alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
          this.log("Speaker-set", action, haAction.host, haAction.port, status, body, err);
          var response = alexaTranslator.alexaResponse(message, status, err, volume);
          callback(err, response);
        }.bind(this));
      }.bind(this));
      break;
    case "setvolume":
      // No need to do anything
      volume = message.directive.payload.volume;
      var body = {
        "characteristics": [{
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": volume
        }]
      };
      alexaHAP.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
        this.log("Speaker", action, haAction.host, haAction.port, status, body, err);
        var response = alexaTranslator.alexaResponse(message, status, err, volume);
        callback(err, response);
      }.bind(this));
      break;
  }

}

function _alexaMessage(message, callback) {

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
        if (element.interface == "Alexa.ColorController") {
          body = body + spacer + element.hue.aid + "." + element.hue.iid;
          spacer = ",";
          body = body + spacer + element.saturation.aid + "." + element.saturation.iid;
          body = body + spacer + element.brightness.aid + "." + element.brightness.iid;
        } else {
          body = body + spacer + element.aid + "." + element.iid;
          spacer = ",";
        }
      });

      // For performance HAP GET Characteristices supports getting multiple in one call
      alexaHAP.HAPstatus(host, port, body, function(err, status) {
        //this.log("reportState", action, host, port, status, err);
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

function _round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
