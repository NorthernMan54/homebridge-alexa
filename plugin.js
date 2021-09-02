"use strict";
// var debug = require('debug')('alexaPlugin');

var AlexaLocal = require('./lib/alexaLocal.js').alexaLocal;
var alexaActions = require('./lib/alexaActions.js');
var EventEmitter = require('events').EventEmitter;
var os = require("os");

const packageConfig = require('./package.json');
let Service, Characteristic;

var options = {};
var alexaService;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

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
  this.inputs = config['inputs'] || false; // Array of input devices
  this.channel = config['channel'] || false; // Array of input devices
  this.blind = config['blind'] || false; // Use range controller for Blinds
  this.deviceListHandling = config['deviceListHandling'] || []; // Use ea
  this.deviceList = config['deviceList'] || []; // Use ea
  this.door = config['door'] || false; // Use mode controller for Garage Doors
  this.name = config['name'] || "homebridgeAlexa";
  this.keepalive = config['keepalive'] || 1200; // MQTT Connection Keepalive

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

  if (this.oldParser) {
    this.log.error("ERROR: oldParser was deprecated with version 0.5.0, defaulting to new Parser.");
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
    // this.log("Accessories");
    var accessories = [];
    accessories.push(new AlexaService(this.name, this.log));
    callback(accessories);
  }
};

alexaHome.prototype.didFinishLaunching = function() {
  var host = 'alexa.homebridge.ca';
  if (this.beta) {
    host = 'alexabeta.homebridge.ca';
  }
  options = {
    // Shared Options
    log: this.log,
    debug: this.debug,
    // MQTT Options
    username: this.username,
    password: this.password,
    servers: [{
      protocol: 'mqtt',
      host: host,
      port: 1883
    }],
    reconnectPeriod: 65000,
    keepalive: this.keepalive,      // Reduce client timeout to 10 minutes
    // HAP Node Client options
    pin: this.pin,
    refresh: this.refresh,
    eventBus: this.eventBus,
    // HB Parser options
    oldParser: this.oldParser,
    combine: this.combine,
    speakers: this.speakers,
    filter: this.filter,
    alexaService: alexaService,
    Characteristic: Characteristic,
    inputs: this.inputs,
    channel: this.channel,
    blind: this.blind,
    deviceListHandling: this.deviceListHandling,
    deviceList: this.deviceList,
    door: this.door,
    // Other Options
    events: this.events
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
  this.eventBus.on('Alexa.InputController', alexaActions.alexaInputController.bind(this));
  this.eventBus.on('Alexa.ModeController', alexaActions.alexaModeController.bind(this));
  this.eventBus.on('Alexa.RangeController', alexaActions.alexaRangeController.bind(this));
};

/*
alexaHome.prototype.configureAccessory = function(accessory) {
  this.log("configureAccessory");
  // callback();
};
*/

function AlexaService(name, log) {
  this.name = name;
  this.log = log;
}

AlexaService.prototype = {
  getServices: function() {
    // this.log("getServices", this.name);
    // Information Service
    var informationService = new Service.AccessoryInformation();
    var hostname = os.hostname();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "homebridge-alexa")
      .setCharacteristic(Characteristic.SerialNumber, hostname)
      .setCharacteristic(Characteristic.FirmwareRevision, require('./package.json').version);
    // Thermostat Service

    alexaService = new Service.ContactSensor(this.name);

    return [informationService, alexaService];
  }
};
