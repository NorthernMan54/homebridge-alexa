var alexaHAP = require('./alexaHAP.js');
var alexaTranslator = require('./alexaTranslator.js');
var alexaMessages = require('./alexaMessages.js');
var debug = require('debug')('alexaActions');
var alexaLocal = require('./alexaLocal.js');

module.exports = {
  alexaDiscovery: alexaDiscovery,
  alexaColorTemperatureController: alexaColorTemperatureController,
  alexaPlaybackController: alexaPlaybackController,
  alexaPowerController: alexaPowerController,
  alexaThermostatController: alexaThermostatController,
  alexaColorController: alexaColorController,
  alexaPowerLevelController: alexaPowerLevelController,
  alexaSpeaker: alexaSpeaker,
  alexaMessage: alexaMessage,
  alexaEvent: alexaEvent
};

function alexaDiscovery(message, callback) {
  // debug('alexaDiscovery', this);
  alexaHAP.HAPs(function(endPoints) {
    var response = alexaTranslator.endPoints(message, endPoints, this);
    if (response && response.event.payload.endpoints.length < 1) {
      this.log("ERROR: HAP Discovery failed, please review config");
    } else {
      this.log("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
    }
    // debug("Discovery Response", JSON.stringify(response, null, 4));
    callback(null, response);
  }.bind(this));
}

function alexaColorTemperatureController(message, callback) {
  var action = message.directive.header.name;
  var colorTemperature;

  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaColorTemperatureController missing action", action, e.message, message.directive.endpoint.cookie);
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
        if (action.toLowerCase() === "decreasecolortemperature") {
          colorTemperatureDelta = -40;
        }
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
          var response = alexaMessages.alexaResponse(message, status, err, _round(1000000 / colorTemperature));
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
        var response = alexaMessages.alexaResponse(message, status, err, message.directive.payload.colorTemperatureInKelvin);
        callback(err, response);
      }.bind(this));
      break;
  }
}

function alexaPlaybackController(message, callback) {
  var action = message.directive.header.name;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaPlaybackController missing action", action, e.message, message.directive.endpoint.cookie);
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
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaPowerController(message, callback) {
  var action = message.directive.header.name;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaPowerController missing action", action, e.message, message.directive.endpoint.cookie);
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
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaThermostatController(message, callback) {
  var action = message.directive.header.name;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaThermostatController missing action", action, e.message, message.directive.endpoint.cookie);
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
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaColorController(message, callback) {
  var action = message.directive.header.name;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaColorController missing action", action, e.message, message.directive.endpoint.cookie);
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
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaPowerLevelController(message, callback) {
  // debug(JSON.stringify(message, null, 4));
  var action = message.directive.header.name;
  var powerLevel, haAction;
  try {
    haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaPowerLevelController missing action", action, e.message, message.directive.endpoint.cookie);
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
          var response = alexaMessages.alexaResponse(message, status, err, powerLevel);
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
        var response = alexaMessages.alexaResponse(message, status, err, powerLevel);
        callback(err, response);
      }.bind(this));
      break;
  }
}

function alexaSpeaker(message, callback) {
  // debug(JSON.stringify(message, null, 4));
  var action = message.directive.header.name;
  var volume, haAction;
  try {
    haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaSpeaker missing action", action, e.message, message.directive.endpoint.cookie);
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
          var response = alexaMessages.alexaResponse(message, status, err, volume);
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
        var response = alexaMessages.alexaResponse(message, status, err, volume);
        callback(err, response);
      }.bind(this));
      break;
  }
}

function alexaMessage(message, callback) {
  // debug("MESSAGE:", message, message.directive.endpoint.cookie);
  switch (message.directive.header.name.toLowerCase()) {
    case "reportstate": // aka getStatus
      var action = message.directive.header.name;
      try {
        var reportState = JSON.parse(message.directive.endpoint.cookie[action]);
      } catch (e) {
        this.log("alexaMessage missing action", action, e.message, message.directive.endpoint.cookie);
        callback(e);
        return;
      }
      var body = "?id=";
      var spacer = ""; // No spacer for first element
      var host, port;
      reportState.forEach(function(element) {
        host = element.host;
        port = element.port;
        if (element.interface === "Alexa.ColorController") {
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
        // this.log("reportState", action, host, port, status, err);
        var response = alexaMessages.alexaStateResponse(message, reportState, status, err);
        callback(err, response);
      });
      break;

    default:
      this.log("Unhandled alexaMessage Directive", message.directive.header.name);
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
      callback(new Error("Unhandled alexaMessage Directive"), response);
  }
}

function alexaEvent(event) {
  debug("Event", JSON.stringify(event));
  // create alexa message

  alexaLocal.alexaEvent(alexaMessages.eventMessage(event));
}

/*

Utility functions

*/

function _round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
