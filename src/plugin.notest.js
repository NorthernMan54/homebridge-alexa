const EventEmitter = require('events').EventEmitter;
const alexaActions = require('./lib/alexaActions.js');
const { alexaLocal } = require('./lib/alexaLocal.js');
const packageConfig = require('../package.json');
const alexaHome = require('./plugin.js');

jest.mock('events');
jest.mock('./lib/alexaActions.js');
jest.mock('./lib/alexaLocal.js');

describe.skip('alexaHome', () => {
  let log, config, api, homebridge, alexaHomeInstance;

  beforeEach(() => {
    log = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
    config = {
      pin: '031-45-154',
      username: 'testUser',
      password: 'testPass',
      filter: 'testFilter',
      beta: false,
      routines: false,
      combine: false,
      oldParser: false,
      refresh: 900,
      speakers: false,
      inputs: false,
      channel: false,
      blind: false,
      thermostatTurnOn: 0,
      deviceListHandling: [],
      deviceList: [],
      door: false,
      name: 'Alexa',
      mergeServiceName: false,
      CloudTransport: 'mqtts',
      LegacyCloudTransport: false,
      keepalive: 5,
      enhancedSkip: false,
      debug: false
    };
    api = { on: jest.fn(), serverVersion: '1.0.0' };
    homebridge = { hap: { Service: jest.fn(), Characteristic: jest.fn() }, registerPlatform: jest.fn() };

    alexaHomeInstance = new alexaHome(log, config, api);
  });

  test('should initialize correctly', () => {
    expect(alexaHomeInstance.log).toBe(log);
    expect(alexaHomeInstance.config).toBe(config);
    expect(alexaHomeInstance.api).toBe(api);
    expect(alexaHomeInstance.pin).toBe(config.pin);
    expect(alexaHomeInstance.username).toBe(config.username);
    expect(alexaHomeInstance.password).toBe(config.password);
    expect(alexaHomeInstance.filter).toBe(config.filter);
    expect(alexaHomeInstance.beta).toBe(config.beta);
    expect(alexaHomeInstance.events).toBe(config.routines);
    expect(alexaHomeInstance.combine).toBe(config.combine);
    expect(alexaHomeInstance.oldParser).toBe(config.oldParser);
    expect(alexaHomeInstance.refresh).toBe(config.refresh);
    expect(alexaHomeInstance.speakers).toBe(config.speakers);
    expect(alexaHomeInstance.inputs).toBe(config.inputs);
    expect(alexaHomeInstance.channel).toBe(config.channel);
    expect(alexaHomeInstance.blind).toBe(config.blind);
    expect(alexaHomeInstance.thermostatTurnOn).toBe(config.thermostatTurnOn);
    expect(alexaHomeInstance.deviceListHandling).toBe(config.deviceListHandling);
    expect(alexaHomeInstance.deviceList).toBe(config.deviceList);
    expect(alexaHomeInstance.door).toBe(config.door);
    expect(alexaHomeInstance.name).toBe(config.name);
    expect(alexaHomeInstance.mergeServiceName).toBe(config.mergeServiceName);
    expect(alexaHomeInstance.CloudTransport).toBe(config.CloudTransport);
    expect(alexaHomeInstance.LegacyCloudTransport).toBe(config.LegacyCloudTransport);
    expect(alexaHomeInstance.keepalive).toBe(config.keepalive * 60);
    expect(alexaHomeInstance.enhancedSkip).toBe(config.enhancedSkip);
  });

  test('should log error if username or password is missing', () => {
    config.username = false;
    config.password = false;
    alexaHomeInstance = new alexaHome(log, config, api);
    expect(log.error).toHaveBeenCalledWith("Missing username and password");
  });

  test('should log error if oldParser is true', () => {
    config.oldParser = true;
    alexaHomeInstance = new alexaHome(log, config, api);
    expect(log.error).toHaveBeenCalledWith("ERROR: oldParser was deprecated with version 0.5.0, defaulting to new Parser.");
  });

  test('should log info on didFinishLaunching', () => {
    alexaHomeInstance.didFinishLaunching();
    expect(log.info).toHaveBeenCalledWith(
      '%s v%s, node %s, homebridge v%s',
      packageConfig.name, packageConfig.version, process.version, api.serverVersion
    );
  });

  test('should call hapDiscovery on didFinishLaunching', () => {
    alexaHomeInstance.didFinishLaunching();
    expect(alexaActions.hapDiscovery).toHaveBeenCalledWith(expect.objectContaining({
      log: log,
      debug: config.debug,
      mqttURL: expect.any(String),
      transport: config.CloudTransport,
      mqttOptions: expect.objectContaining({
        username: config.username,
        password: config.password,
        reconnectPeriod: expect.any(Number),
        keepalive: expect.any(Number),
        rejectUnauthorized: false
      }),
      pin: config.pin,
      refresh: config.refresh,
      eventBus: expect.any(EventEmitter),
      oldParser: config.oldParser,
      combine: config.combine,
      speakers: config.speakers,
      filter: config.filter,
      alexaService: expect.anything(),
      Characteristic: expect.anything(),
      inputs: config.inputs,
      channel: config.channel,
      thermostatTurnOn: config.thermostatTurnOn,
      blind: config.blind,
      deviceListHandling: config.deviceListHandling,
      deviceList: config.deviceList,
      door: config.door,
      mergeServiceName: config.mergeServiceName,
      events: config.routines,
      enhancedSkip: config.enhancedSkip
    }));
  });

  test('should return correct accessories', () => {
    const callback = jest.fn();
    alexaHomeInstance.accessories(callback);
    expect(callback).toHaveBeenCalledWith([expect.any(Object)]);
  });

  test('should return correct services in AlexaService', () => {
    const name = 'Test Alexa';
    const alexaServiceInstance = new AlexaService(name, log);
    const services = alexaServiceInstance.getServices();
    expect(services).toHaveLength(2);
    expect(services[0]).toBeInstanceOf(homebridge.hap.Service.AccessoryInformation);
    expect(services[1]).toBeInstanceOf(homebridge.hap.Service.ContactSensor);
  });
});