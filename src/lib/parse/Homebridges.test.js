var Homebridges = require('./Homebridges.js').Homebridges;
const Homebridge = require('./Homebridge');

describe('Homebridges', () => {
  test('should create an array of Homebridge instances', () => {

    const fs = require('fs');
    const storagePath = 'test/endPoints.test.json';
    const devices = fs.readFileSync(storagePath);

    const context = {
      pin: '031-45-154',
      filter: null,
      beta: false,
      routines: true,
      combine: [
        { into: 'Living', from: [Array] },
        { into: 'Deck', from: [Array] }
      ],
      oldParser: false,
      refresh: 900,
      speakers: [
        { manufacturer: 'yamaha-home', name: 'Deck' },
        { manufacturer: 'yamaha-home', name: 'Living' },
        { manufacturer: 'HTTP-IRBlaster', name: 'Stereo' }
      ],
      inputs: false,
      channel: false,
      blind: false,
      thermostatTurnOn: 0,
      deviceListHandling: 'none',
      deviceList: [],
      door: false,
      name: 'Alexa',
      mergeServiceName: false,
      CloudTransport: 'wss',
      LegacyCloudTransport: false,
      keepalive: 300,
      enhancedSkip: true,
      deviceCleanup: true,
      debug: true,
      platform: 'Alexa'
    };

    const homebridges = new Homebridges(JSON.parse(devices), context);

    expect(homebridges.homebridges).toHaveLength(21);
    homebridges.homebridges.forEach((homebridge, index) => {
      expect(homebridge).toBeInstanceOf(Homebridge);
      expect(homebridge.element).toEqual(devices[index]);
      expect(homebridge.context).toBe(context);
    });
  });
});