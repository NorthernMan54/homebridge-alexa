"use strict";

const { alexaLocal: AlexaLocal } = require('./lib/alexaLocal.js');
const alexaActions = require('./lib/alexaActions.js');
const { EventEmitter } = require('events');
const os = require("os");
const packageConfig = require('../package.json');

let Service, Characteristic;

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerPlatform("homebridge-alexa", "Alexa", AlexaHome);
};

class AlexaHome {
  constructor(log, config, api) {
    this.log = log;
    this.api = api;
    this.eventBus = new EventEmitter();
    this.config = config;

    const defaults = {
      pin: "031-45-154",
      username: false,
      password: false,
      filter: null,
      beta: false,
      events: false,
      combine: false,
      oldParser: false,
      refresh: 60 * 15,
      speakers: false,
      inputs: false,
      channel: false,
      blind: false,
      thermostatTurnOn: 0,
      deviceListHandling: [],
      deviceList: [],
      door: false,
      name: "Alexa",
      mergeServiceName: false,
      CloudTransport: "mqtts",
      LegacyCloudTransport: false,
      keepalive: 5,
      enhancedSkip: false,
      deviceCleanup: false,
      debug: false,
    };

    Object.assign(this, defaults, config);
    this.keepalive = Math.max(this.keepalive, 1) * 60;

    if (!['mqtt', 'wss', 'mqtts'].includes(this.CloudTransport)) {
      this.log.error("Invalid CloudTransport setting, defaulting to mqtts.");
      this.CloudTransport = "mqtts";
    }

    if (this.debug) {
      const debugEnable = require('debug');
      const namespaces = debugEnable.disable() || '';
      debugEnable.enable(`${namespaces},alexa*`);
    }


    if (!this.username || !this.password) {
      this.log.error("Missing username and password");
    }

    if (this.oldParser) {
      this.log.error("oldParser was deprecated with version 0.5.0, defaulting to new Parser.");
    }

    if (api) {
      this.api.on('didFinishLaunching', () => this.didFinishLaunching());
    }

    this.log.info(
      '%s v%s, node %s, homebridge v%s',
      packageConfig.name, packageConfig.version, process.version, api.serverVersion
    );
  }
  accessories(callback) {
    callback([new AlexaService(this.name, this.log)]);
  }

  didFinishLaunching() {
    const host = this.beta ? 'clone.homebridge.ca' : (this.CloudTransport === 'wss' ? 'www.homebridge.ca' : 'alexa.homebridge.ca');
    const mqttURL = this.CloudTransport === 'wss'
      ? `wss://${host}/ws`
      : `${this.CloudTransport}://${host}:${this.CloudTransport === 'mqtts' ? '8883' : '1883'}/`;

    const options = {
      api: this.api,
      log: this.log,
      debug: this.debug,
      mqttURL,
      transport: this.CloudTransport,
      mqttOptions: {
        username: this.username,
        password: this.password,
        reconnectPeriod: 65000,
        keepalive: this.CloudTransport === 'wss' ? 55 : this.keepalive,
        rejectUnauthorized: false,
      },
      pin: this.pin,
      refresh: this.refresh,
      eventBus: this.eventBus,
      oldParser: this.oldParser,
      combine: this.combine,
      speakers: this.speakers,
      filter: this.filter,
      alexaService: null,
      Characteristic,
      inputs: this.inputs,
      channel: this.channel,
      thermostatTurnOn: this.thermostatTurnOn,
      blind: this.blind,
      deviceListHandling: this.deviceListHandling,
      deviceList: this.deviceList,
      door: this.door,
      mergeServiceName: this.mergeServiceName,
      events: this.events,
      enhancedSkip: this.enhancedSkip,
    };

    this.log(options.filter
      ? `Starting Homebridge discovery with filter: '${options.filter}'`
      : "Starting Homebridge discovery");

    alexaActions.hapDiscovery(options);

    const alexa = new AlexaLocal(options);

    this.eventBus.on('hapEvent', alexaActions.alexaEvent.bind(this));

    this.eventBus.on('System', msg => this.log.error("ERROR:", msg.directive.header.message));
    this.eventBus.on('Warning', msg => this.log.warn("Warning:", msg.directive.header.message));
    this.eventBus.on('Information', msg => this.log("Info:", msg.directive.header.message));

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
  }
}

class AlexaService {
  constructor(name, log) {
    this.name = name;
    this.log = log;
  }
  getServices() {
    const informationService = new Service.AccessoryInformation();
    const hostname = os.hostname();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "homebridge-alexa")
      .setCharacteristic(Characteristic.SerialNumber, hostname)
      .setCharacteristic(Characteristic.FirmwareRevision, packageConfig.version);

    const contactSensorService = new Service.ContactSensor(this.name);

    return [informationService, contactSensorService];
  }
}


