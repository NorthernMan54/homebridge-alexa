"use strict";
// var debug = require('debug')('alexaPlugin');

var AlexaLocal = require('../lib/alexaLocal.js').alexaLocal;
var alexaActions = require('../lib/alexaActions.js');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('liveTest');
var fs = require('fs');
// var debug = require('debug')('alexaPlugin');

var options = {};

var passwords = JSON.parse(fs.readFileSync("passwords.json"));

var response = JSON.parse(fs.readFileSync(process.argv[2]).toString());

this.log = console.log;
this.eventBus = new EventEmitter();

this.pin = "031-45-154";
this.beta = false;
this.events = false;
this.combine = false;
this.oldParser = false;
this.refresh = 60 * 15; // Value in seconds, default every 15 minute's
this.speakers = false; // Array of speaker devices


var host = 'homebridge.cloudwatch.net';
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
this.eventBus.on('Alexa', alexaActions.alexaMessage.bind(this));
this.eventBus.on('Alexa.Discovery', alexaDiscovery.bind(this));
this.eventBus.on('Alexa.PowerController', alexaActions.alexaPowerController.bind(this));
this.eventBus.on('Alexa.PowerLevelController', alexaActions.alexaPowerLevelController.bind(this));
this.eventBus.on('Alexa.ColorController', alexaActions.alexaColorController.bind(this));
this.eventBus.on('Alexa.ColorTemperatureController', alexaActions.alexaColorTemperatureController.bind(this));
this.eventBus.on('Alexa.PlaybackController', alexaActions.alexaPlaybackController.bind(this));
this.eventBus.on('Alexa.Speaker', alexaActions.alexaSpeaker.bind(this));
this.eventBus.on('Alexa.ThermostatController', alexaActions.alexaThermostatController.bind(this));
this.eventBus.on('Alexa.LockController', alexaActions.alexaLockController.bind(this));
this.eventBus.on('Alexa.ChannelController', alexaActions.alexaChannelController.bind(this));
this.eventBus.on('Alexa.StepSpeaker', alexaActions.alexaStepSpeaker.bind(this));

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
  /*
  var deleteSeen = [];
  for (var i = 0; i < response.event.payload.endpoints.length; i++) {
    var endpoint = response.event.payload.endpoints[i];
    if (deleteSeen[endpoint.endpointId]) {
      debug("Delete name", endpoint.friendlyName);
      response.event.payload.endpoints.splice(i, 1);
    } else {
      deleteSeen[endpoint.endpointId] = true;
    }
  }
  */
  var checkSeen = [];

  response.event.payload.endpoints.forEach(function(endpoint) {
    if (checkSeen[endpoint.endpointId]) {
      debug("Check endpointId", endpoint.friendlyName);
    } else {
      checkSeen[endpoint.endpointId] = true;
    }
  });

  // debug("Discovery Response", JSON.stringify(response, null, 4));
  debug("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
  callback(null, response);
}
