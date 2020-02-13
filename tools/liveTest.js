"use strict";
// var debug = require('debug')('alexaPlugin');

var AlexaLocal = require('../lib/alexaLocal.js').alexaLocal;
var alexaActions = require('../lib/alexaActions.js');
var EventEmitter = require('events').EventEmitter;
var Homebridges = require('../lib/parse/Homebridges.js').Homebridges;
var debug = require('debug')('liveTest');
var fs = require('fs');
// var debug = require('debug')('alexaPlugin');

var options = {};

this.log = console.log;
this.eventBus = new EventEmitter();

this.pin = "031-45-154";
this.beta = true;
this.events = false;
this.oldParser = false;
this.refresh = 60 * 15; // Value in seconds, default every 15 minute's

var passwords = JSON.parse(fs.readFileSync("passwords.json"));

var hbAccDump = fs.readFileSync(process.argv[2]).toString();
var accessories = JSON.parse(hbAccDump.replace(/\uFFFD/g, ''));

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

var hbDevices = new Homebridges(endPoints, {
  "events": true,
  "speakers": speakers,
  "combine": combine
});
debug("Homebridges");

var response = hbDevices.toAlexa({
  perms: 'pw',
  "events": this.events,
  "speakers": speakers,
  "combine": combine
}, message);

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
  log: this.log,
  pin: this.pin,
  refresh: this.refresh,
  oldParser: this.oldParser,
  reconnectPeriod: 5000,
  combine: this.combine,
  speakers: this.speakers,
  filter: this.filter,
  servers: [{
    protocol: 'mqtt',
    host: host,
    port: 1883
  }]
};

// Initialize HAP Connections
// alexaActions.hapDiscovery(options);

var alexa = new AlexaLocal(options);

// Homebridge HAP Node Events

this.eventBus.on('hapEvent', alexaActions.alexaEvent.bind(this));

// Alexa mesages

this.eventBus.on('System', function(message) {
  this.log.error("ERROR: ", message.directive.header.message);
}.bind(this));
this.eventBus.on('Alexa', alexaMessage.bind(this));
this.eventBus.on('Alexa.Discovery', alexaDiscovery.bind(this));
this.eventBus.on('Alexa.PowerController', alexaActions.alexaPowerController.bind(this));
this.eventBus.on('Alexa.PowerLevelController', alexaPowerLevelController.bind(this));
this.eventBus.on('Alexa.ColorController', alexaActions.alexaColorController.bind(this));
this.eventBus.on('Alexa.ColorTemperatureController', alexaActions.alexaColorTemperatureController.bind(this));
this.eventBus.on('Alexa.PlaybackController', alexaActions.alexaPlaybackController.bind(this));
this.eventBus.on('Alexa.Speaker', alexaActions.alexaSpeaker.bind(this));
this.eventBus.on('Alexa.ThermostatController', alexaActions.alexaThermostatController.bind(this));
this.eventBus.on('Alexa.LockController', alexaActions.alexaLockController.bind(this));
this.eventBus.on('Alexa.ChannelController', alexaActions.alexaChannelController.bind(this));
this.eventBus.on('Alexa.StepSpeaker', alexaActions.alexaStepSpeaker.bind(this));
this.eventBus.on('Alexa.ModeController', alexaModeController.bind(this));

/*

{
  "directive": {
    "header": {
      "namespace": "Alexa.PowerLevelController",
      "name": "SetPowerLevel",
      "payloadVersion": "3",
      "messageId": "709a0ca4-3e57-485a-bf58-8748c99e3e2e",
      "correlationToken": "AAAAAAAAAACD4pj0ADsaqu3j0F9kk/4QDAIAAAAAAABYW38O5qg1EU9ggaH8SjxfPNf7lSkws/lUgmX0rOYcpZlSXeFVsLXaJkTkb6e/PtR9PTH7mwBUkuoRLP1bptIbVte7gl7eI6s6zWuBaafgFneVvl4pFyG9bBGupjrhQoloIjdu+ExQSk6J+4jRlUJB/LQ26xdIPq10JxGgf6noiPduwzIDjUmPkbs3MFCrIaIPTyJ5YuW5tAcCn3gqas7q+UU73PpuUz+5p4iN7O7pMWCb/xs7aa2Kprvr25YcSgr8sExapACOYqoD2EjF3A2BAvVcrgji5wSv0hYIgKGH9WpwZQW2UqPmuJvsVQpdIW9IsTri8w22LKUO7twkIOQ9lJ5MQchBIJeP5AEh+q4RTLe6c+sDRNTTKV+RVrRVZXQ9DF3ujDB4dlZx545gcAeGjTu5E+tzpp9mGdvcwGix5+IwDYP5wOdq+keyGdPet+zAtsqqkQaYQjyihLtTs/bcoRf8cATOS7eDdkMutzF5aVW6VPKuE8yI3GIBsi9zZ4+8ApL/qo9NjALag7WIHLOocjYxGLf73PtgeRKsW1jcjEJAcFIZ6JWS5c/Vedl66tvH1p0dPdwNMl8mxHcc935S+IzAjzCvOymO4twVts1H9SWzx3Dmj6A99Vii3NzHyQlkG7kA+6bdjZzmXlKJ9uPPAtR9FV9+xZ9ztafj0Gn42pEc1THGLP7rtm5S/Q=="
    },
    "endpoint": {
      "endpointId": "Q0M6MjI6M0Q6RTM6Q0U6MzAtcGFyc2VUZXN0LUJFVEEtRmFrZSBCbGluZHMtMDAwMDAwOEMtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx",
      "cookie": {
        "TurnOn": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11,\"value\":100}",
        "AdjustPowerLevel": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11}",
        "ReportState": "[{\"interface\":\"Alexa.PowerController\",\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11},{\"interface\":\"Alexa.PowerLevelController\",\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11}]",
        "SetPowerLevel": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11}",
        "TurnOff": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11,\"value\":0}"
      }
    },
    "payload": {
      "powerLevel": 26
    }
  }
}

*/

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

/*
{
  "directive": {
    "header": {
      "namespace": "Alexa.ModeController",
      "name": "SetMode",
      "payloadVersion": "3",
      "instance": "Blinds.Position",
      "messageId": "53cd9757-8180-40a5-88b8-b52eb9a58cc2",
      "correlationToken": "AAAAAAAAAAB2FB2EQZWa00PWx2Yaqp8BDAIAAAAAAAD6WXf+ly2plF5NKyZcsTMAVB+Ki/lt9CAhGufdsNU2al6puqgcGWb/wu4JnNDG4j5uxzT7Wr+O54k4qDBY+WwjTz5ejFuq8BkGa1qA8fvMmbwDrcx5bdFMFxU+h/FlRjHcJBdQZ4cGOiZgnjIsK4F+iWA9T8YZ1cDi3+QIAK6rndwflMliZecVI05UB799H3kTdR2ScmMEwFHwtEZ5/T+g4h6dZFCBZWhiTlB7h34vu9FI5l3IOCM4OGlvT4QypThX3VGFDhPCzlqynK7Hu6CZoJj0HgbN5jwFLmyQpnlGvNjcJjxSnR4ubNVy0+mv6xmMxVN6P3wkLgRpmau/lnlFnnjsclYLZdBJQidEUcp6tnGhFbAPaHpjfv9wPTpTKRiSNK5cr1/FYVm0gLpPT9BWyUqblnJC7a0an69uT4jDJuJhPvLqSqFvXyB/Pp0ohOtWtA9ldiNcln0wnPSEYEndhtkhONLmuFXI4uWFUiB1N7h0M5CgBfU0JA987j9rcI3fiCWjGgGtw+mr+L3lp/f99BPZ3Z9G1UD3RwFBnmHEXfnoGZ9uzRvgqlPcJ7ghbq3inXURvSPpj/VxKRA1tINz8ApN1DFPB7jU/wZKgt1whdNQkkI8YLR3LtSUbfwa4J8AX35kQU8rsb8G6r9byD3OTOyGutceEDDk1UDv3sY37X6uBj/Pj6sVD6gZYw=="
    },
    "endpoint": {
      "endpointId": "Q0M6MjI6M0Q6RTM6Q0U6MzAtcGFyc2VUZXN0LUJFVEEtVGVzdCBCbGluZHMtMDAwMDAwOEMtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx",
      "cookie": {
        "TurnOn": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11,\"value\":100}",
        "AdjustPowerLevel": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11}",
        "ReportState": "[{\"interface\":\"Alexa.PowerController\",\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11},{\"interface\":\"Alexa.PowerLevelController\",\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11}]",
        "SetPowerLevel": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11}",
        "TurnOff": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11,\"value\":0}"
      }
    },
    "payload": {
      "mode": "Position.Down"
    }
  }
}

*/

function alexaModeController(message, callback) {
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

/*

{
  "directive": {
    "header": {
      "namespace": "Alexa",
      "name": "ReportState",
      "payloadVersion": "3",
      "messageId": "5fbdaa33-f283-442a-b9aa-0b42a1e90db9",
      "correlationToken": "AAAAAAAAAAB2FB2EQZWa00PWx2Yaqp8BDAIAAAAAAAAUcVNoG4N2AfMC3FSjMh/c6k1Mol1QsBXczGwTP9qzDJrn7uKaj0UoLx46PgDgP/4shKpqCYTZ8XGU9Tw+2c2woOplQXojnF3IsDvkkcM56sb73jKVf/WK2lbDRm6cK06wRg66SEQ7qqRIzj9JIAUN3tCZW8t5vvD7bMOH+lzxqL0dik46MmHajNeA/J9hpU9knMcC0wlo9Ozlcs5aynm+lkVLkiLNbzQGi+TYinLA2EbWcO/BHRMDJrKos3INyZ99tWph8rlnsg6H4oRptdNxwpeevweYZnawdky36szMaXTfBjzT55mCjvE+PaBZwPGlHIuk+KBnwZ+b3a9jrCONzMbFwTuwLQ3SeGGpyxw3LmUZSWaWqF704fCRRrfBhhXHKtJk5mCGD8qz4u4DJryQbl6FwxdvNSizn8XvDKf2RNVyHJ1eYkGutrBsn5alnqqoDGdWJC421MJk/jvjDle4I7j0LQ8Xw8tN2qfCLoKQloQBSd8DblP3+9TsAebN/devdetM5wdMnkLb9KbQPsDjGt3LFVWeSgCWAHUTYb4RnL5Leow0tLGYWpk7K9vpENl64GSafqO8lvupALhUCINc7RKQrAWikj+fVwH2gt2ozVQIdNX2b08sQdvTER4lfIIatzxWLsBuWAfdTLvUdp54wP+20u6unq+Ur2+M9u5kPrGEGBSEgwXyImzp7w=="
    },
    "endpoint": {
      "endpointId": "Q0M6MjI6M0Q6RTM6Q0U6MzAtcGFyc2VUZXN0LUJFVEEtRmFrZSBCbGluZHMtMDAwMDAwOEMtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx",
      "cookie": {
        "TurnOn": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11,\"value\":100}",
        "AdjustPowerLevel": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11}",
        "ReportState": "[{\"interface\":\"Alexa.PowerController\",\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11},{\"interface\":\"Alexa.PowerLevelController\",\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11}]",
        "SetPowerLevel": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11}",
        "TurnOff": "{\"host\":\"127.0.0.1\",\"port\":51826,\"aid\":38,\"iid\":11,\"value\":0}"
      }
    },
    "payload": {}
  }
}

*/


function alexaMessage(message, callback) {
  debug('alexaMessage', message);
  var now = new Date();
  var response = {
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "ErrorResponse",
        "messageId": message.directive.header.messageId,
        "correlationToken": message.directive.header.correlationToken,
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": message.directive.endpoint.endpointId
      },
      "payload": {
        "type": "ENDPOINT_UNREACHABLE",
        "message": "err.message"
      }
    }
  };

  response = {
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

        "endpointId": message.directive.endpoint.endpointId,
        "cookie": {}
      },
      "payload": {}
    }
  };
  callback(null, response);
}

function alexaDiscovery(message, callback) {
  // debug('alexaDiscovery', this);
  var messageID = (message ? message.directive.header.messageId : '');
  debug("messageID", messageID);
  response.event.header.messageId = messageID;
  var alreadySeen = [];

  response.event.payload.endpoints.forEach(function(endpoint) {
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

  console.log(JSON.stringify(response));
  callback(null, response);
}
