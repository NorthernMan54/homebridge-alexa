"use strict";
// var debug = require('debug')('alexaPlugin');

var AlexaLocal = require('../lib/alexaLocal.js').alexaLocal;
var alexaActions = require('../lib/alexaActions.js');
var EventEmitter = require('events').EventEmitter;
var Homebridges = require('../lib/parse/Homebridges.js').Homebridges;
var normalizeUUID = require('../node_modules/hap-node-client/lib/util.js').normalizeUUID;
var debug = require('debug')('alexa:liveTest');
var fs = require('fs');
// var debug = require('debug')('alexaPlugin');

var options = {};

this.log = console.log;
this.eventBus = new EventEmitter();

this.pin = "031-45-154";
// this.beta = true;
this.events = false;
this.oldParser = false;
this.refresh = 60 * 15; // Value in seconds, default every 15 minute's

var passwords = JSON.parse(fs.readFileSync(process.argv[3]));

var hbAccDump = fs.readFileSync(process.argv[2]).toString();
// var accessories = normalizeUUID(JSON.parse(hbAccDump.replace(/\uFFFD/g, '')));

/*

var endPoints = [{
  ipAddress: "127.0.0.1",
  instance: {
    port: 51826,
    txt: {
      md: 'parseTest',
      pv: '1.0',
      id: 'CC:22:3D:E3:CE:30',
      'c#': '63',
      's#': '1',
      ff: '0',
      ci: '2',
      sf: '0',
      sh: 'kD1sXg=='
    }
  },
  accessories: accessories
}];

var message = {
  "directive": {
    "header": {
      "namespace": "Alexa.Discovery",
      "name": "Discover",
      "payloadVersion": "3",
      "messageId": "1bd5d003-31b9-476f-ad03-71d471922820"
    },
    "payload": {
      "scope": {
        "type": "BearerToken",
        "token": "access-token-from-skill"
      }
    }
  }
};

var speakers = [{
    "manufacturer": "yamaha-home",
    "name": "Front"
  },
  {
    "manufacturer": "yamaha-home",
    "name": "Rear"
  },
  {
    "manufacturer": "HTTP-IRBlaster",
    "name": "Panasonic"
  },
  {
    "manufacturer": "Bose SoundTouch",
    "name": "Bose SoundTouch 10"
  },
  {
    "manufacturer": "Bose SoundTouch",
    "name": "Bose SoundTouch 20"
  },
  {
    "manufacturer": "Bose SoundTouch",
    "name": "Bose SoundTouch 300"
  },
  {
    "manufacturer": "HTTP-IRBlaster",
    "name": "KODI"
  }
];

var combine = [{
  "into": "TV",
  "from": ["KODI"]
}, {
  "into": "Front",
  "from": ["Yamaha"]
}, {
  "into": "Rear",
  "from": ["Yamaha"]
}];

var inputs = [{
  "into": "TV",
  "devices": [{
    "manufacturer": "HTTP-IRBlaster",
    "name": "Tuner",
    "alexaName": "TUNER"
  }, {
    "manufacturer": "HTTP-IRBlaster",
    "name": "HDMI1",
    "alexaName": "HDMI 1"
  }, {
    "manufacturer": "HTTP-IRBlaster",
    "name": "HDMI1",
    "alexaName": "MEDIA PLAYER"
  }, {
    "manufacturer": "HTTP-IRBlaster",
    "name": "HDMI2",
    "alexaName": "HDMI 2"
  }, {
    "manufacturer": "HTTP-IRBlaster",
    "name": "Tuner",
    "alexaName": "TV"
  }]
}];

var hbDevices = new Homebridges(endPoints, {
  "events": true,
  "speakers": speakers,
  "combine": combine,
  "inputs": inputs,
  "blind": true
});
debug("Homebridges");

var response = hbDevices.toAlexa({
  perms: 'pw',
  "events": this.events,
  "speakers": speakers,
  "combine": combine,
  "inputs": inputs
}, message);

*/

var response = JSON.parse(hbAccDump);

var host = 'alexa.homebridge.ca';
if (this.beta) {
  host = 'homebridgebeta.cloudwatch.net';
}
options = {
  eventBus: this.eventBus,
  username: passwords.username,
  password: passwords.password,
  clientId: passwords.username,
  debug: this.debug,
  events: this.events,
  log: { error: this.log },
  pin: this.pin,
  refresh: this.refresh,
  oldParser: this.oldParser,
  reconnectPeriod: 5000,
  combine: this.combine,
  speakers: this.speakers,
  filter: this.filter,
  mqttURL: (this.CloudTransport === 'wss' ? "wss://" + host + "/ws" : (this.CloudTransport === 'mqtts' ? "mqtts://" + host + ":8883/" : "mqtt://" + host + ":1883/")),
  mqttOptions: {
    username: passwords.username,
    password: passwords.password,
    reconnectPeriod: 65000, // Increased reconnect period to allow DDOS protection to reset
    keepalive: (this.CloudTransport === 'wss' ? 55 : this.keepalive), // Keep alive not used when using WSS Transport
    rejectUnauthorized: false
  },
};

// Initialize HAP Connections
// alexaActions.hapDiscovery(options);

var alexa = new AlexaLocal(options);

// Homebridge HAP Node Events

this.eventBus.on('hapEvent', alexaActions.alexaEvent.bind(this));

// Alexa mesages

this.eventBus.on('System', function (message) {
  this.log.error("ERROR: ", message.directive.header.message);
}.bind(this));
this.eventBus.on('Alexa', alexaMessage.bind(this));
this.eventBus.on('Alexa.Discovery', alexaDiscovery.bind(this));
this.eventBus.on('Alexa.PowerController', alexaPowerController.bind(this));
this.eventBus.on('Alexa.PowerLevelController', alexaPowerLevelController.bind(this));
this.eventBus.on('Alexa.ColorController', alexaActions.alexaColorController.bind(this));
this.eventBus.on('Alexa.ColorTemperatureController', alexaActions.alexaColorTemperatureController.bind(this));
this.eventBus.on('Alexa.PlaybackController', alexaActions.alexaPlaybackController.bind(this));
this.eventBus.on('Alexa.Speaker', alexaActions.alexaSpeaker.bind(this));
this.eventBus.on('Alexa.ThermostatController', alexaThermostatController.bind(this));
this.eventBus.on('Alexa.LockController', alexaActions.alexaLockController.bind(this));
this.eventBus.on('Alexa.ChannelController', alexaActions.alexaChannelController.bind(this));
this.eventBus.on('Alexa.StepSpeaker', alexaActions.alexaStepSpeaker.bind(this));
this.eventBus.on('Alexa.InputController', alexaInputController.bind(this));
this.eventBus.on('Alexa.ModeController', alexaModeController.bind(this));
this.eventBus.on('Alexa.RangeController', alexaRangeController.bind(this));

function alexaThermostatController(message, callback) {
  debug('alexaThermostatController', JSON.stringify(message, null, 2));
  var now = new Date();
  var response = {};
  switch (message.directive.header.name) {
    case "SetThermostatMode":
      response = {
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "Response",
            "messageId": message.directive.header.messageId,
            "correlationToken": message.directive.header.correlationToken,
            "payloadVersion": "3"
          },
          "endpoint": {
            "endpointId": message.directive.endpoint.endpointId
          },
          "payload": {}
        },
        "context": {
          "properties": [
            {
              "namespace": "Alexa.ThermostatController",
              "name": "thermostatMode",
              "value": message.directive.payload.thermostatMode.value,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            },
            {
              "namespace": "Alexa.ThermostatController",
              "name": "targetSetpoint",
              "value": {
                "value": 72.0,
                "scale": "CELSIUS"
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            },
            {
              "namespace": "Alexa.TemperatureSensor",
              "name": "temperature",
              "value": {
                "value": 66.5,
                "scale": "CELSIUS"
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 1000
            }
          ]
        }
      }
      break;
    case "SetTargetTemperature":
      response = {
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "Response",
            "messageId": message.directive.header.messageId,
            "correlationToken": message.directive.header.correlationToken,
            "payloadVersion": "3"
          },
          "endpoint": {
            "endpointId": message.directive.endpoint.endpointId
          },
          "payload": {}
        },
        "context": {
          "properties": [
            {
              "namespace": "Alexa.ThermostatController",
              "name": "thermostatMode",
              "value": "HEAT",
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            },
            {
              "namespace": "Alexa.ThermostatController",
              "name": "targetSetpoint",
              "value": {
                "value": 72.0,
                "scale": "CELSIUS"
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            },
            {
              "namespace": "Alexa.TemperatureSensor",
              "name": "temperature",
              "value": {
                "value": 66.5,
                "scale": "CELSIUS"
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 1000
            }
          ]
        }
      };
      break;
    case "AdjustTargetTemperature":
      response = {
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "Response",
            "messageId": message.directive.header.messageId,
            "correlationToken": message.directive.header.correlationToken,
            "payloadVersion": "3"
          },
          "endpoint": {
            "endpointId": message.directive.endpoint.endpointId
          },
          "payload": {}
        },
        "context": {
          "properties": [
            {
              "namespace": "Alexa.ThermostatController",
              "name": "thermostatMode",
              "value": "HEAT",
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            },
            {
              "namespace": "Alexa.ThermostatController",
              "name": "targetSetpoint",
              "value": {
                "value": 72.0,
                "scale": "CELSIUS"
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            },
            {
              "namespace": "Alexa.TemperatureSensor",
              "name": "temperature",
              "value": {
                "value": 66.5,
                "scale": "CELSIUS"
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 1000
            }
          ]
        }
      };
      break;
    default:
      response = {
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "Response",
            "messageId": message.directive.header.messageId,
            "correlationToken": message.directive.header.correlationToken,
            "payloadVersion": "3"
          },
          "endpoint": {
            "endpointId": message.directive.endpoint.endpointId
          },
          "payload": {}
        },
        "context": {
          "properties": [{
            "namespace": "Alexa.ModeController",
            "instance": message.directive.header.instance,
            "name": "mode",
            "value": message.directive.payload.mode,
            "timeOfSample": now.toISOString(),
            "uncertaintyInMilliseconds": 500
          }]
        }
      };
  }
  callback(null, response);
}

function alexaRangeController(message, callback) {
  debug('alexaRangeController', JSON.stringify(message, null, 2));
  var now = new Date();
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "Response",
        "messageId": message.directive.header.messageId,
        "correlationToken": message.directive.header.correlationToken,
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": message.directive.endpoint.endpointId
      },
      "payload": {}
    },
    "context": {
      "properties": [{
        "namespace": "Alexa.ModeController",
        "instance": message.directive.header.instance,
        "name": "mode",
        "value": message.directive.payload.mode,
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 500
      }]
    }
  };
  callback(null, response);
}

function alexaModeController(message, callback) {
  debug('alexaModeController', JSON.stringify(message, null, 2));
  var now = new Date();
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "Response",
        "messageId": message.directive.header.messageId,
        "correlationToken": message.directive.header.correlationToken,
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": message.directive.endpoint.endpointId
      },
      "payload": {}
    },
    "context": {
      "properties": [{
        "namespace": "Alexa.ModeController",
        "instance": message.directive.header.instance,
        "name": "mode",
        "value": message.directive.payload.mode,
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 500
      }]
    }
  };

  callback(null, response);
}

function alexaMessage(message, callback) {
  debug('alexaMessage', JSON.stringify(message, null, 2));
  var now = new Date();

  var response = {
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "StateReport",
        "messageId": message.directive.header.messageId,
        "correlationToken": message.directive.header.correlationToken,
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": message.directive.endpoint.endpointId
      },
      "payload": {}
    },
    "context": {
      "properties": [{
        "namespace": "Alexa.ThermostatController",
        "name": "thermostatMode",
        "value": "HEAT",
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 500
      },
      {
        "namespace": "Alexa.ThermostatController",
        "name": "targetSetpoint",
        "value": {
          "value": 22.0,
          "scale": "CELSIUS"
        },
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 500
      },
      {
        "namespace": "Alexa.TemperatureSensor",
        "name": "temperature",
        "value": {
          "value": 19.9,
          "scale": "CELSIUS"
        },
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 1000
      },
      {
        "namespace": "Alexa.EndpointHealth",
        "name": "connectivity",
        "value": {
          "value": "OK"
        },
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 0
      }
      ]
    }
  }
  /*
  var response = {
    "context": {
      "properties": [{
        "namespace": "Alexa.ModeController",
        "instance": "Blinds.Position",
        "name": "mode",
        "value": "Position.Down",
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 500
      }]
    },
    "event": {
      "header": {
        "messageId": message.directive.header.messageId,
        "correlationToken": message.directive.header.correlationToken,
        "namespace": "Alexa",
        "name": "StateReport",
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": message.directive.endpoint.endpointId
      },
      "payload": {}
    }
  };
  */
  debug('alexaMessage - response: ', JSON.stringify(response));
  callback(null, response);
}

function alexaInputController(message, callback) {
  console.log(JSON.stringify(message));
  var now = new Date();
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "Response",
        "messageId": message.directive.header.messageId,
        "correlationToken": message.directive.header.correlationToken,
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": message.directive.endpoint.endpointId
      },
      "payload": {}
    },
    "context": {
      "properties": [{
        "namespace": "Alexa.PowerLevelController",
        "name": "powerLevel",
        "value": message.directive.payload.powerLevel,
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 500
      }]
    }
  };
  console.log(JSON.stringify(response));
  callback(null, response);
}

function alexaPowerLevelController(message, callback) {
  // console.log(JSON.stringify(message));
  var now = new Date();
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "Response",
        "messageId": message.directive.header.messageId,
        "correlationToken": message.directive.header.correlationToken,
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": message.directive.endpoint.endpointId
      },
      "payload": {}
    },
    "context": {
      "properties": [{
        "namespace": "Alexa.PowerLevelController",
        "name": "powerLevel",
        "value": message.directive.payload.powerLevel,
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 500
      }]
    }
  };
  console.log(JSON.stringify(response));
  callback(null, response);
}

function alexaPowerController(message, callback) {
  // console.log(JSON.stringify(message));
  var now = new Date();
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "Response",
        "messageId": message.directive.header.messageId,
        "correlationToken": message.directive.header.correlationToken,
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": message.directive.endpoint.endpointId
      },
      "payload": {}
    },
    "context": {
      "properties": [{
        "namespace": "Alexa.PowerLevelController",
        "name": "powerLevel",
        "value": message.directive.payload.powerLevel,
        "timeOfSample": now.toISOString(),
        "uncertaintyInMilliseconds": 500
      }]
    }
  };
  console.log(JSON.stringify(response));
  callback(null, response);
}

function alexaDiscovery(message, callback) {
  // debug('alexaDiscovery', this);
  var messageID = (message ? message.directive.header.messageId : '');
  debug("messageID", messageID);
  response.event.header.messageId = messageID;
  var alreadySeen = [];

  response.event.payload.endpoints.forEach(function (endpoint) {
    if (alreadySeen[endpoint.friendlyName]) {
      debug("Duplicate name", endpoint.friendlyName);
    } else {
      alreadySeen[endpoint.friendlyName] = true;
    }
  });
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

  deleteSeen = [];

  for (i = 0; i < response.event.payload.endpoints.length; i++) {
    endpoint = response.event.payload.endpoints[i];
    if (deleteSeen[endpoint.endpointId]) {
      this.log("ERROR: Parsing failed, duplicate endpointID.", endpoint.friendlyName);
      // response.event.payload.endpoints.splice(i, 1);
    } else {
      deleteSeen[endpoint.endpointId] = true;
    }
  }

  if (response && response.event.payload.endpoints.length < 1) {
    this.log("ERROR: HAP Discovery failed, please review config");
  } else {
    this.log("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
    if (response.event.payload.endpoints.length > 300) {
      this.log("ERROR: Maximum devices/accessories of 300 exceeded.");
    }
  }

  callback(null, response);
}
