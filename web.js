"use strict";
// var debug = require('debug')('alexaPlugin');

var AlexaLocal = require('./lib/alexaLocal.js').alexaLocal;
var alexaHAP = require('./lib/alexaHAP.js');
var alexaActions = require('./lib/alexaActions.js');

const packageConfig = require('./package.json');

var alexa;
var options = {};

module.exports = function(homebridge) {
  // Service = homebridge.hap.Service;
  // Characteristic = homebridge.hap.Characteristic;
  // Accessory = homebridge.platformAccessory;
  // UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform("homebridge-alexa", "Alexa", alexaHome);
};

function alexaHome(log, config, api) {
  this.log = log;
  this.config = config;
  this.pin = config['pin'] || "031-45-154";
  this.username = config['username'] || false;
  this.password = config['password'] || false;
  this.filter = config['filter'];
  this.beta = config['beta'] || false;
  this.events = config['events'] || false;
  this.refresh = config['refresh'] || 60 * 15; // Value in seconds, default every 15 minute's
  this.speakers = config['speakers'] || {}; // Array of speaker devices

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
    username: this.username,
    password: this.password,
    clientId: this.username,
    reconnectPeriod: 5000,
    servers: [{
      protocol: 'mqtt',
      host: host,
      port: 1883
    }]
  };

  alexaHAP.HAPDiscovery(this);
  //  init(this);

  alexa = new AlexaLocal(options);

  alexa.on('Alexa', alexaActions.alexaMessage.bind(this));
  alexa.on('Alexa.Discovery', alexaActions.alexaDiscovery.bind(this));
  alexa.on('Alexa.PowerController', alexaActions.alexaPowerController.bind(this));
  alexa.on('Alexa.PowerLevelController', alexaActions.alexaPowerLevelController.bind(this));
  alexa.on('Alexa.ColorController', alexaActions.alexaColorController.bind(this));
  alexa.on('Alexa.ColorTemperatureController', alexaActions.alexaColorTemperatureController.bind(this));
  alexa.on('Alexa.PlaybackController', alexaActions.alexaPlaybackController.bind(this));
  alexa.on('Alexa.Speaker', alexaActions.alexaSpeaker.bind(this));
  alexa.on('Alexa.ThermostatController', alexaActions.alexaThermostatController.bind(this));
  // alexa.on('Alexa.StepSpeaker', alexaActions.alexaStepSpeaker.bind(this));
};

alexaHome.prototype.configureAccessory = function(accessory) {
  this.log("configureAccessory");
  // callback();
};
