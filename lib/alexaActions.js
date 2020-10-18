var HAPNodeJSClient = require('hap-node-client').HAPNodeJSClient;
var Homebridges = require('./parse/Homebridges.js').Homebridges;
var alexaMessages = require('./alexaMessages.js');
var messages = require('./parse/messages');
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
  alexaChannelController: alexaChannelController,
  alexaInputController: alexaInputController,
  alexaRangeController: alexaRangeController,
  alexaModeController: alexaModeController
};

function hapDiscovery(options) {
  homebridge = new HAPNodeJSClient(options);

  homebridge.on('Ready', function() {
    alexaDiscovery.call(options, null, function() {
      // debug("Events", options);
      if (options.events) {

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
      "deviceID": endpoint.deviceID
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
    debug("Event Register %s ->", hbInstance.deviceID, HBMessage[register]);
    homebridge.HAPeventByDeviceID(hbInstance.deviceID, JSON.stringify(HBMessage[register]), function(err, status) {
      if (!err) {
        // debug("Registered Event %s:%s ->", hbInstance.host, hbInstance.port, status);
      } else {
        debug("Error: Event Register %s:%s ->", hbInstance.deviceID, err, status);
      }
    });
  }
}

function alexaDiscovery(message, callback) {
  // debug('alexaDiscovery', this);
  homebridge.HAPaccessories(function(endPoints) {
    debug("alexaDiscovery");
    var response;

    hbDevices = new Homebridges(endPoints, this);
    // debug("RESPONSE", JSON.stringify(hbDevices, null, 2));
    response = hbDevices.toAlexa(this, message);

    // debug("RESPONSE", JSON.stringify(response, null, 2));

    var deleteSeen = [];

    for (var i = 0; i < response.event.payload.endpoints.length; i++) {
      var endpoint = response.event.payload.endpoints[i];
      if (deleteSeen[endpoint.friendlyName]) {
        this.log("WARNING: Duplicate device name", endpoint.friendlyName);
        // response.event.payload.endpoints.splice(i, 1);
      } else {
        deleteSeen[endpoint.friendlyName] = true;
      }
    }
    response.event.payload.endpoints = checkDeviceList.call(this, response.event.payload.endpoints);
    response.event.payload.endpoints = removeLargeCookieEndpoints.call(this, response.event.payload.endpoints);
    response.event.payload.endpoints = removeDuplicateEndpoints.call(this, response.event.payload.endpoints);


    if (response && response.event.payload.endpoints.length < 1) {
      this.log("ERROR: HAP Discovery failed, please review config");
    } else {
      if (process.uptime() > 600) { // Only use console during startup
        debug("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
      } else {
        this.log("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
      }
      if (response.event.payload.endpoints.length > 300) {
        this.log("ERROR: Maximum devices/accessories of 300 exceeded.");
      }
    }
    // debug("Discovery Response", JSON.stringify(response, null, 2));
    // const fs = require('fs');
    // fs.writeFileSync('./Desktop/alexa.json', JSON.stringify(response, null, 2));
    callback(null, response);
  }.bind(this));
}

// Maximum cookie size is 5K

function removeLargeCookieEndpoints(endpoints) {
  var response = [];
  endpoints.forEach((endpoint) => {
    debug("Cookie Object: ", JSON.stringify(endpoint.cookie).length);
    if (JSON.stringify(endpoint.cookie).length < 5000) {
      response.push(endpoint);
    } else {
      console.log("ERROR: Large endpoint Cookie, removing endpointID =>", endpoint.friendlyName);
    }
  });

  // console.log(response.length);
  // console.log(response);
  return (response);
}

function removeDuplicateEndpoints(endpoints) {
  var deleteSeen = [];
  var response = [];
  endpoints.forEach((endpoint) => {
    if (deleteSeen[endpoint.endpointId]) {
      this.log("ERROR: Parsing failed, removing duplicate endpointID =>", endpoint.friendlyName);
    } else {
      response.push(endpoint);
    }
    deleteSeen[endpoint.endpointId] = true;
  });
  return (response);
}

function checkDeviceList(endpoints) {
  if(this.deviceList && this.deviceList.length > 0 && ['allow','deny'].includes(this.deviceListHandling)){
    this.log(`INFO: DeviceList - The following devices are ${this.deviceListHandling} =>`, this.deviceList);
    var response = [];
    endpoints.forEach((endpoint) => {
      if (this.deviceListHandling === "allow") {
        if(verifyDeviceInList(this.deviceList, endpoint.friendlyName)){
          response.push(endpoint);
          this.log("INFO: DeviceList - allow =>", endpoint.friendlyName);
        }
      } else if (this.deviceListHandling === "deny") {
        if(verifyDeviceInList(this.deviceList, endpoint.friendlyName)){
          this.log("INFO: DeviceList - deny =>", endpoint.friendlyName);
        } else {
          response.push(endpoint);
        }
      }
    });
    return (response);
  } else {
    this.log("INFO: DeviceList empty feature not enabled or config error in deviceListHandling");
    return endpoints;
  }
}

function verifyDeviceInList(deviceList, deviceName){
  for (var i = 0, len = deviceList.length; i < len; i++) {
    if (deviceName === deviceList[i] || deviceName.match(new RegExp(deviceList[i]))) return true;
  }
  return false;
}

function alexaColorTemperatureController(message, callback) {
  var action = message.directive.header.name;
  var colorTemperature;

  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaColorTemperatureController missing action", action, e.message, message.directive.endpoint.cookie);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }
  switch (action.toLowerCase()) {
    case "decreasecolortemperature":
    case "increasecolortemperature":
      // This characteristic describes color temperature which is represented in the reciprocal megakelvin (MK-1) or mirek scale. MK = 1,000,000 / K where MK is the desired mirek value and K is temperature in Kelvins.

      homebridge.HAPstatusByDeviceID(haAction.deviceID, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
        this.log("ColorTemperatureController-get", action, haAction.deviceID, status, err);

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
        homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
          this.log("ColorTemperatureController-change", action, haAction.deviceID, status, body, err);
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
      homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
        this.log("ColorTemperatureController-set", action, haAction.deviceID, status, body, err);
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
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": haAction.value
    }]
  };
  homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
    this.log("PlaybackController", action, haAction.deviceID, status, err);
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaInputController(message, callback) {
  var action = message.directive.payload.input;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaInputController missing action", action, e.message, message.directive.endpoint.cookie);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": haAction.value
    }]
  };
  homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
    this.log("InputController", action, haAction.deviceID, status, err);
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
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": haAction.value
    }]
  };
  homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
    this.log("PowerController", action, haAction.deviceID, status, err);
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaModeController(message, callback) {
  var action = message.directive.header.name;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaModeController missing action", action, e.message, message.directive.endpoint.cookie);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }
  var value;
  switch (message.directive.payload.mode) {
    case "Position.Down":
      value = 1;
      break;
    case "Position.Up":
      value = 0;
      break;
    default:
      this.log("alexaModeController missing mode", action, message.directive.payload.mode);
      var e = new Error("alexaModeController missing mode " + action + " " + message.directive.payload);
      var response = alexaMessages.alexaResponse(message, "", e);
      response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
      callback(e, response);
      return;
  }
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": value
    }]
  };
  homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
    this.log("ModeController", action, haAction.deviceID, status, err);
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
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }
  var body = {
    "characteristics": [{
      "aid": haAction.aid,
      "iid": haAction.iid,
      "value": haAction.value
    }]
  };
  homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
    this.log("alexaLockController", action, haAction.deviceID, status, err);
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaChannelController(message, callback) {
  // debug("Directive", JSON.stringify(message));
  /* = Version 1.0
  var action = message.directive.header.name;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaChannelController missing action", action, e.message, message.directive.endpoint.cookie);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  } */

  switch (message.directive.header.name) {
    case "ChangeChannel":
      break;
    default:
      this.log("alexaChannelController missing action", message.directive.header.name);
      var response = alexaMessages.alexaResponse(message, "", new Error("alexaChannelController missing action"));
      response.event.payload.type = "INVALID_DIRECTIVE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
      callback(new Error("Error:"), response);
      return;
  }

  var channel = message.directive.header.name;
  if (message.directive.payload.channel.number) {
    channel = message.directive.payload.channel.number;
  } else if (message.directive.payload.channelMetadata.name) {
    channel = message.directive.payload.channelMetadata.name;
  } else {
    var e = new Error("ERROR: alexaChannelController missing channel", message.directive.endpoint.payload);
    this.log(e.message);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_DIRECTIVE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[channel.toUpperCase()]);
  } catch (e) {
    this.log("alexaChannelController invalid station", channel, e.message, message.directive.endpoint.cookie);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "VALUE_OUT_OF_RANGE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }

  var body = {
    characteristics: [{
      aid: haAction.aid,
      iid: haAction.iid,
      value: haAction.value
    }]
  };

  // debug("alexaChannelController", JSON.stringify(message), JSON.stringify(body));

  homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
    this.log("alexaChannelController", channel, haAction.deviceID, status, err);
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
        var response = alexaMessages.alexaResponse(message, "", e);
        response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
        callback(e, response);
        return;
      }
      var body = {
        "characteristics": [{
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": haAction.value
        }]
      };
      homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
        this.log("SetThermostatMode", mode, haAction.deviceID, status, err);
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
          var response = alexaMessages.alexaResponse(message, "", e);
          response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
          callback(e, response);
          return;
        }
        var value = payloads[index].value;
        if (payloads[index].scale === "FAHRENHEIT") {
          value = (value - 32) * 5 / 9;
        }
        characteristics.push({
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": value
        });
      }

      var body = {
        "characteristics": characteristics
      };
      homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
        this.log("ThermostatController", action, haAction.deviceID, status, err);
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
      response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
      callback(err, response);
  }
}

function alexaColorController(message, callback) {
  var action = message.directive.header.name;
  try {
    var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaColorController missing action", action, e.message, message.directive.endpoint.cookie);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
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
  homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
    this.log("ColorController", action, haAction.deviceID, status, err);
    var response = alexaMessages.alexaResponse(message, status, err);
    callback(err, response);
  }.bind(this));
}

function alexaRangeController(message, callback) {
  // debug(JSON.stringify(message, null, 2));
  var action = message.directive.header.name;
  var rangeLevel, haAction;
  try {
    haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaRangeController missing action", action, e.message, message.directive.endpoint.cookie);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }

  switch (action.toLowerCase()) {
    case "adjustrangevalue":
      // Need to get current value prior to dimming
      homebridge.HAPstatusByDeviceID(haAction.deviceID, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
        this.log("RangeController-get", action, haAction.deviceID, status, err);

        var rangeValueDelta = message.directive.payload.rangeValueDelta;
        rangeLevel = status.characteristics[0].value + rangeValueDelta > 100 ? 100 : status.characteristics[0].value + rangeValueDelta;
        rangeLevel = rangeLevel < 0 ? 0 : rangeLevel;
        rangeLevel = (rangeLevel >= 0 && rangeLevel <= 100) ? rangeLevel : 0;
        var body = {
          "characteristics": [{
            "aid": haAction.aid,
            "iid": haAction.iid,
            "value": rangeLevel
          }]
        };
        homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
          this.log("RangeController-set", action, haAction.deviceID, status, body, err);
          var response = alexaMessages.alexaResponse(message, status, err, rangeLevel);
          callback(err, response);
        }.bind(this));
      }.bind(this));
      break;
    case "setrangevalue":
      // No need to do anything
      var rangeValue = message.directive.payload.rangeValue;
      var body = {
        "characteristics": [{
          "aid": haAction.aid,
          "iid": haAction.iid,
          "value": rangeValue
        }]
      };
      homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
        this.log("RangeController", action, haAction.deviceID, status, body, err);
        var response = alexaMessages.alexaResponse(message, status, err, rangeValue);
        callback(err, response);
      }.bind(this));
      break;
    default:
      var e = new Error("ERROR: alexaRangeController missing " + action);
      this.log(e.message, message.directive.endpoint.cookie);
      var response = alexaMessages.alexaResponse(message, "", e);
      response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
      callback(e, response);
  }
}

function alexaPowerLevelController(message, callback) {
  // debug(JSON.stringify(message, null, 2));
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
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }

  switch (action.toLowerCase()) {
    case "adjustpowerlevel":
      // Need to get current value prior to dimming
      homebridge.HAPstatusByDeviceID(haAction.deviceID, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
        this.log("PowerLevelController-get", action, haAction.deviceID, status, err);

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
        homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
          this.log("PowerLevelController-set", action, haAction.deviceID, status, body, err);
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
      homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
        this.log("PowerLevelController", action, haAction.deviceID, status, body, err);
        var response = alexaMessages.alexaResponse(message, status, err, powerLevel);
        callback(err, response);
      }.bind(this));
      break;
  }
}

function alexaSpeaker(message, callback) {
  // debug(JSON.stringify(message, null, 2));
  var action = message.directive.header.name;
  var volume, haAction;
  try {
    haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaSpeaker missing action", action, e.message, message.directive.endpoint.cookie);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
    return;
  }

  switch (action.toLowerCase()) {
    case "adjustvolume":
      // Need to get current value prior to dimming
      homebridge.HAPstatusByDeviceID(haAction.deviceID, "?id=" + haAction.aid + "." + haAction.iid, function(err, status) {
        this.log("Speaker-get", action, haAction.deviceID, status, err);

        if (!err) {
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
          homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
            this.log("Speaker-set", action, haAction.deviceID, status, body, err);
            var response = alexaMessages.alexaResponse(message, status, err, volume);
            callback(err, response);
            return;
          }.bind(this));
        } else {
          callback(err);
        }
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
      homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
        this.log("Speaker", action, haAction.deviceID, status, body, err);
        var response = alexaMessages.alexaResponse(message, status, err, volume);
        callback(err, response);
      }.bind(this));
      break;
  }
}

function alexaStepSpeaker(message, callback) {
  // debug(JSON.stringify(message, null, 2));
  var action = message.directive.header.name;
  var volume, haAction;
  try {
    haAction = JSON.parse(message.directive.endpoint.cookie[action]);
  } catch (e) {
    this.log("alexaStepSpeaker missing action", action, e.message, message.directive.endpoint.cookie);
    var response = alexaMessages.alexaResponse(message, "", e);
    response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
    callback(e, response);
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
      homebridge.HAPcontrolByDeviceID(haAction.deviceID, JSON.stringify(body), function(err, status) {
        this.log("StepSpeaker", action, haAction.deviceID, status, body, err);
        var response = alexaMessages.alexaResponse(message, status, err, volume);
        callback(err, response);
      }.bind(this));
      break;
  }
}

function alexaMessage(message, callback) {
  debug("alexaMessage:", JSON.stringify(message));
  switch (message.directive.header.name.toLowerCase()) {
    case "reportstate": // aka getStatus
      var action = message.directive.header.name;
      try {
        var reportState = JSON.parse(message.directive.endpoint.cookie[action]);
      } catch (e) {
        this.log("alexaMessage missing action", action, e.message, message.directive.endpoint.cookie);
        var response = alexaMessages.alexaResponse(message, "", e);
        response.event.payload.type = "INVALID_VALUE"; // The directive contains a value that is not valid for the target endpoint. For example, an invalid heating mode, channel, or program value.
        callback(e, response);
        return;
      }

      var statusArray = [];
      reportState.forEach(function(element) {
        if (!statusArray[element.deviceID]) {
          statusArray[element.deviceID] = {};
          statusArray[element.deviceID].body = "?id=";
          statusArray[element.deviceID].interface = "";
          statusArray[element.deviceID].deviceID = element.deviceID;
          statusArray[element.deviceID].spacer = "";
          statusArray[element.deviceID].elements = [];
        }
        switch (element.interface) {
          case "Alexa.ColorController":
            statusArray[element.deviceID].body = statusArray[element.deviceID].body + statusArray[element.deviceID].spacer + element.hue.aid + "." + element.hue.iid;
            statusArray[element.deviceID].interface = statusArray[element.deviceID].interface + statusArray[element.deviceID].spacer + element.interface;
            statusArray[element.deviceID].spacer = ",";
            statusArray[element.deviceID].body = statusArray[element.deviceID].body + statusArray[element.deviceID].spacer + element.saturation.aid + "." + element.saturation.iid;
            statusArray[element.deviceID].body = statusArray[element.deviceID].body + statusArray[element.deviceID].spacer + element.brightness.aid + "." + element.brightness.iid;
            statusArray[element.deviceID].elements.push({
              interface: element.interface,
              hue: {
                aid: element.hue.aid,
                iid: element.hue.iid
              },
              saturation: {
                aid: element.saturation.aid,
                iid: element.saturation.iid
              },
              brightness: {
                aid: element.brightness.aid,
                iid: element.brightness.iid
              }
            });
            break;
            // case "Alexa.ThermostatControllerthermostatMode":
            // case "Alexa.ThermostatControllertargetSetpoint":
          default:
            statusArray[element.deviceID].body = statusArray[element.deviceID].body + statusArray[element.deviceID].spacer + element.aid + "." + element.iid;
            statusArray[element.deviceID].interface = statusArray[element.deviceID].interface + statusArray[element.deviceID].spacer + element.interface;
            statusArray[element.deviceID].spacer = ",";
            statusArray[element.deviceID].elements.push({
              interface: element.interface,
              aid: element.aid,
              iid: element.iid
            });
        }
      });

      // For performance HAP GET Characteristices supports getting multiple in one call
      // debug("alexaMessage - statusArray", statusArray);

      processStatusArray(statusArray, message).then(response => {
        debug("alexaMessage: Response", JSON.stringify(response,
          null, 2));
        callback(null, response);
      }).catch(err => {
        debug("alexaMessage:Error:", err.message);
        callback(alexaMessages.alexaStateResponse(err, message));
      });

      /*
      homebridge.HAPstatusByDeviceID(deviceID, body, function(err, status) {
        debug("reportState", action, deviceID, status, err);
        var response = alexaMessages.alexaStateResponse(message, reportState, status, err);
        debug("reportState", JSON.stringify(response));
        callback(err, response);
      });
      */
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

async function processStatusArray(statusArray, message) {
  try {
    var messageArray = [];
    // debug("processStatusArray-1", statusArray);
    for (let item in statusArray) {
      // debug("processStatusArray-item", statusArray[item]);
      messageArray.push(_HAPstatusByDeviceID(statusArray[item], message));
    }

    // debug("processStatusArray", messageArray);
    var resultArray = await Promise.all(messageArray);

    return (alexaMessages.alexaStateResponse(resultArray, message));
  } catch (err) {
    return (alexaMessages.alexaStateResponse(err, message));
  }
}

function _HAPstatusByDeviceID(statusObject, message) {
  debug("_HAPstatusByDeviceID-1", statusObject);
  return new Promise((resolve, reject) => {
    homebridge.HAPstatusByDeviceID(statusObject.deviceID, statusObject.body, function(err, status) {
      if (err) {
        // debug("Error: _HAPstatusByDeviceID", err);
        reject(err);
      } else {
        debug("_HAPstatusByDeviceID-2", statusObject.deviceID, status);
        resolve(messages.stateToProperties(statusObject, status.characteristics));
      }
    });
  });
}

function alexaEvent(events) {
  debug("Events", JSON.stringify(events));
  // create alexa message
  events.forEach(function(event) {
      var x = {
        'deviceID': event.deviceID,
        'aid': event.aid,
        'iid': event.iid
      };
      var device;

      device = hbDevices.toEvents(JSON.stringify(x));

      var message = alexaMessages.eventMessage(event, device);

      // debug("message to be sent", JSON.stringify(message, null, 2));
      // fix for issue #186
      if (message && message.event.payload.change && message.event.payload.change.properties[0].value) {
          alexaLocal.alexaEvent(message);
        } else if (message.event.header.namespace === "Alexa.DoorbellEventSource") {
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
