"use strict";
// var debug = require('debug')('alexaPlugin');

var AlexaLocal = require('./lib/alexaLocal.js').alexaLocal;
var alexaActions = require('./lib/alexaActions.js');
var EventEmitter = require('events').EventEmitter;
// var debug = require('debug')('alexaPlugin');

const packageConfig = require('./package.json');

var options = {};

module.exports = function(homebridge) {
  homebridge.registerPlatform("homebridge-alexa", "Alexa", alexaHome);
};

function alexaHome(log, config, api) {
  this.log = log;
  this.eventBus = new EventEmitter();
  this.config = config;
  this.pin = config['pin'] || "031-45-154";
  this.username = config['username'] || false;
  this.password = config['password'] || false;
  this.filter = config['filter'];
  this.beta = config['beta'] || false;
  this.events = config['routines'] || false;
  this.combine = config['combine'] || false;
  this.oldParser = config['oldParser'] || false;
  this.refresh = config['refresh'] || 60 * 15; // Value in seconds, default every 15 minute's
  this.speakers = config['speakers'] || false; // Array of speaker devices

  // Enable config based DEBUG logging enable
  this.debug = config['debug'] || false;
  if (this.debug) {
    let debugEnable = require('debug');
    let namespaces = debugEnable.disable();

    // this.log("DEBUG-1", namespaces);
    if (namespaces) {
      namespaces = namespaces + ',alexa*';
    } else {
      namespaces = 'alexa*';
    }
    // this.log("DEBUG-2", namespaces);
    debugEnable.enable(namespaces);
  }

  if (!this.username || !this.password) {
    this.log.error("Missing username and password");
  }

  if (api) {
    this.api = api;
    this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
  }

  this.log.info(
    '%s v%s, node %s, homebridge v%s',
    packageConfig.name, packageConfig.version, process.version, api.serverVersion
  );
}

alexaHome.prototype = {
  accessories: function(callback) {
    this.log("accessories");
    callback();
  }
};

alexaHome.prototype.didFinishLaunching = function() {
  var host = 'homebridge.cloudwatch.net';
  if (this.beta) {
    host = 'homebridgebeta.cloudwatch.net';
  }
  options = {
    eventBus: this.eventBus,
    username: this.username,
    password: this.password,
    clientId: this.username,
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
  alexaActions.hapDiscovery(options);

  var alexa = new AlexaLocal(options);

  // Homebridge HAP Node Events

  this.eventBus.on('hapEvent', alexaActions.alexaEvent.bind(this));

  // Alexa mesages

  this.eventBus.on('System', function(message) {
    this.log.error("ERROR: ", message.directive.header.message);
  }.bind(this));
  this.eventBus.on('Alexa', alexaActions.alexaMessage.bind(this));
  this.eventBus.on('Alexa.Discovery', alexaActions.alexaDiscovery.bind(this));
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
};

alexaHome.prototype.configureAccessory = function(accessory) {
  this.log("configureAccessory");
  // callback();
};
