var HAPNodeJSClient = require('hap-node-client').HAPNodeJSClient;
var Homebridges = require('./parse/Homebridges.js').Homebridges;
var alexaTranslator = require('./alexaTranslator.js');
var alexaMessages = require('./alexaMessages.js');
var debug = require('debug')('alexaActions');
var alexaLocal = require('./alexaLocal.js');

var homebridge;
var hbDevices;

module.exports = {
  alexaDiscovery: alexaDiscovery,
  alexaColorTemperatureController: alexaColorTemperatureController,
  alexaPlaybackController: alexaPlaybackController,
  alexaPowerController: alexaPowerController,
  alexaThermostatController: alexaThermostatController,
  alexaColorController: alexaColorController,
  alexaPowerLevelController: alexaPowerLevelController,
  alexaSpeaker: alexaSpeaker,
  alexaStepSpeaker: alexaStepSpeaker,
  alexaMessage: alexaMessage,
  alexaEvent: alexaEvent,
  registerEvents: registerEvents,
  hapDiscovery: hapDiscovery,
  alexaLockController: alexaLockController,
  alexaChannelController: alexaChannelController
};

function hapDiscovery(options) {
  homebridge = new HAPNodeJSClient(options);

  homebridge.on('Ready', function() {
    alexaDiscovery.call(options, null, function() {
      // debug("Events", options);
      if (options.oldParser) {
        registerEvents(alexaTranslator.hapEndPoints());
      } else {
        registerEvents(hbDevices.toEvents());
      }
    });
  });

  homebridge.on('hapEvent', function(event) {
    // debug("Event Relay - 2", event);
    options.eventBus.emit('hapEvent', event);
  });
  // debug("Event Relay - 1", homebridge);
}

function registerEvents(message) {
  debug("registerEvents", message);

  var HBMessage = [];

  for (var key in message) {
    // console.log("Key", key, JSON.parse(key));
    var endpoint = JSON.parse(key);
    var device = {
      "aid": endpoint.aid,
      "iid": endpoint.iid,
      "ev": true
    };

    var x = {
      "host": endpoint.host,
      "port": endpoint.port
    };

    if (HBMessage[JSON.stringify(x)]) {
      HBMessage[JSON.stringify(x)].characteristics.push(device);
    } else {
      HBMessage[JSON.stringify(x)] = {
        "characteristics": [device]
      };
    }
  }
  for (var register in HBMessage) {
    // console.log("send", instance, HBMessage[instance]);
    var hbInstance = JSON.parse(register);
    debug("Event Register %s:%s ->", hbInstance.host, hbInstance.port, HBMessage[register]);
    homebridge.HAPevent(hbInstance.host, hbInstance.port, JSON.stringify(HBMessage[register]), function(err, status) {
      if (!err) {
        // debug("Registered Event %s:%s ->", hbInstance.host, hbInstance.port, status);
      } else {
        debug("Error: Event Register %s:%s ->", hbInstance.host, hbInstance.port, err, status);
      }
    });
  }
}

function alexaDiscovery(message, callback) {
  // debug('alexaDiscovery', this);
  homebridge.HAPaccessories(function(endPoints) {
    debug("alexaDiscovery");
    var response;
    if (this.oldParser) {
      response = alexaTranslator.endPoints(message, endPoints, this);
    } else {
      hbDevices = new Homebridges(endPoints, this);
      response = hbDevices.toAlexa(this, message);
    }

    // debug("RESPONSE", JSON.stringify(response));

    var deleteSeen = [];

    for (var i = 0; i < response.event.payload.endpoints.length; i++) {
      var endpoint = response.event.payload.endpoints[i];
      if (deleteSeen[endpoint.friendlyName]) {
        this.log("ERROR: Deleting duplicate device name", endpoint.friendlyName);
        response.event.payload.endpoints.splice(i, 1);
      } else {
        deleteSeen[endpoint.friendlyName] = true;
      }
    }

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

      homebridge.HAPstatus(haAction.host, haAction.port, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
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
        homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
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
      homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
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
  homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
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
  homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("PowerController", action, haAction.host, haAction.port, status, err);
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaLockController(message, callback) {
  var action = message.directive.header.name;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaLockController missing action", action, e.message, message.directive.endpoint.cookie);
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
  homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("alexaLockController", action, haAction.host, haAction.port, status, err);
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaChannelController(message, callback) {
  var action = message.directive.header.name;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaChannelController missing action", action, e.message, message.directive.endpoint.cookie);
    callback(e);
    return;
  }

  var channel = message.directive.payload.channel.number;

  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": Number(channel)
    }]
  };

  // debug("alexaChannelController", JSON.stringify(message, null, 2), JSON.stringify(body, null, 2));

  homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("alexaChannelController", action, haAction.host, haAction.port, status, err);
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaThermostatController(message, callback) {
  // debug("alexaThermostatController", JSON.stringify(message));
  var action = message.directive.header.name;
  var payloads = message.directive.payload;
  // directive.header.name = SetThermostatMode, SetTargetTemperature
  switch (action) {
    case "SetThermostatMode":
      try {
        var mode = message.directive.payload.thermostatMode.value;
        var haAction = JSON.parse(message.directive.endpoint.cookie["thermostatMode" + mode]);
      } catch (e) {
        this.log("alexaThermostatController missing action", "thermostatMode" + mode, e.message, message.directive.endpoint.cookie);
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
      homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
        this.log("SetThermostatMode", mode, haAction.host, haAction.port, status, err);
        var response = alexaMessages.alexaResponse(message, status, err);
        callback(err, response);
      }.bind(this));
      break;
    case "SetTargetTemperature":
      // targetSetpoint, lowerSetpoint, upperSetpoint
      var characteristics = [];
      for (var index in payloads) {
        try {
          var haAction = JSON.parse(message.directive.endpoint.cookie[index]);
        } catch (e) {
          this.log("alexaThermostatController missing action", index, e.message, message.directive.endpoint.cookie);
          callback(e);
          return;
        }
        characteristics.push({
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": payloads[index].value
        });
      }

      var body = {
        "characteristics": characteristics
      };
      homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
        this.log("ThermostatController", action, haAction.host, haAction.port, status, err);
        var response = alexaMessages.alexaResponse(message, status, err);
        callback(err, response);
      }.bind(this));
      break;
      // case "AdjustTargetTemperature":
      // Future expansion
    default:
      var err = {
        message: "Unknown action" + action
      };
      var response = alexaMessages.alexaResponse(message, "", err);
      callback(err, response);
  }
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
  homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
    this.log("ColorController", action, haAction.host, haAction.port, status, err);
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaPowerLevelController(message, callback) {
  // debug(JSON.stringify(message, null, 4));
  var action = message.directive.header.name;
  var powerLevel, haAction, turnOn;
  try {
    haAction = JSON.parse(message.directive.endpoint.cookie[action]);
    // Issue a seperate turn on for brightness only ( workaround for hue concern )
    if (message.directive.endpoint.cookie["BrightnessTurnOn"] && message.directive.endpoint.cookie["TurnOn"]) {
      turnOn = JSON.parse(message.directive.endpoint.cookie["TurnOn"]);
    }
  } catch (e) {
    this.log("alexaPowerLevelController missing action", action, e.message, message.directive.endpoint.cookie);
    callback(e);
    return;
  }

  switch (action.toLowerCase()) {
    case "adjustpowerlevel":
      // Need to get current value prior to dimming
      homebridge.HAPstatus(haAction.host, haAction.port, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
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
        if (turnOn) {
          body.characteristics.push({
            "aid": turnOn.aid,
            "iid": turnOn.iid,
            "value": turnOn.value
          });
        }
        homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
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
      if (turnOn) {
        body.characteristics.push({
          "aid": turnOn.aid,
          "iid": turnOn.iid,
          "value": turnOn.value
        });
      }
      homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
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
      homebridge.HAPstatus(haAction.host, haAction.port, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
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
        homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
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
      homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
        this.log("Speaker", action, haAction.host, haAction.port, status, body, err);
        var response = alexaMessages.alexaResponse(message, status, err, volume);
        callback(err, response);
      }.bind(this));
      break;
  }
}

function alexaStepSpeaker(message, callback) {
  // debug(JSON.stringify(message, null, 4));
  var action = message.directive.header.name;
  var volume, haAction;
  try {
    haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaStepSpeaker missing action", action, e.message, message.directive.endpoint.cookie);
    callback(e);
    return;
  }

  switch (action.toLowerCase()) {
    case "adjustvolume":
      // Characteristic.VolumeSelector.INCREMENT = 0;
      // Characteristic.VolumeSelector.DECREMENT = 1;
      volume = message.directive.payload.volumeSteps;
      var value = (volume > 0 ? 0 : 1);
      var body = {
        "characteristics": [{
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": value
        }]
      };
      homebridge.HAPcontrol(haAction.host, haAction.port, JSON.stringify(body), function(err, status) {
        this.log("StepSpeaker", action, haAction.host, haAction.port, status, body, err);
        var response = alexaMessages.alexaResponse(message, status, err, volume);
        callback(err, response);
      }.bind(this));
      break;
  }
}

function alexaMessage(message, callback) {
  debug("MESSAGE:", JSON.stringify(message), message.directive.endpoint.cookie);
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
        switch (element.interface) {
          case "Alexa.ColorController":
            body = body + spacer + element.hue.aid + "." + element.hue.iid;
            spacer = ",";
            body = body + spacer + element.saturation.aid + "." + element.saturation.iid;
            body = body + spacer + element.brightness.aid + "." + element.brightness.iid;
            break;
            // case "Alexa.ThermostatControllerthermostatMode":
            // case "Alexa.ThermostatControllertargetSetpoint":
          default:
            body = body + spacer + element.aid + "." + element.iid;
            spacer = ",";
        }
      });

      // For performance HAP GET Characteristices supports getting multiple in one call
      homebridge.HAPstatus(host, port, body, function(err, status) {
        debug("reportState", action, host, port, status, err);
        var response = alexaMessages.alexaStateResponse(message, reportState, status, err);
        debug("reportState", JSON.stringify(response));
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

function alexaEvent(events) {
  debug("Events", JSON.stringify(events));
  // create alexa message
  events.forEach(function(event) {
    var x = {
      'host': event.host,
      'port': event.port,
      'aid': event.aid,
      'iid': event.iid
    };
    var device;
    if (hbDevices) {
      device = hbDevices.toEvents(JSON.stringify(x));
    } else {
      device = alexaTranslator.hapEndPoints(JSON.stringify(x));
    }
    var message = alexaMessages.eventMessage(event, device);

    // debug("message to be sent", message);
    // fix for issue #186
    if (message.event.payload.change.properties[0].value) {
      alexaLocal.alexaEvent(message);
    } else {
      // debug("Event message not being sent", message);
    }
  });
}

/*

Utility functions

*/

function _round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
