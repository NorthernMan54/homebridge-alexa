var Homebridges = require('./Homebridges.js').Homebridges;

describe('Parse Discovery Response', () => {

  test('Routines False', () => {

    const devices = require('../../../test/endPoints.test.json');

    const context = {
      pin: '031-45-154',
      filter: null,
      beta: false,
      routines: false,
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


    const hbDevices = new Homebridges(devices, context);
    expect(hbDevices.homebridges).toHaveLength(21);

    const response = hbDevices.toAlexa(context, null);
    expect(response.event.payload.endpoints).toHaveLength(87);

    const discoveryResponse = require('../../../test/discoveryResponse.test.json');
    expect(response).toEqual(discoveryResponse);

  });

  test('Routines True', () => {

    const devices = require('../../../test/endPoints.test.json');

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

    const hbDevices = new Homebridges(devices, context);
    expect(hbDevices.homebridges).toHaveLength(21);

    const response = hbDevices.toAlexa(context, null);
    expect(response.event.payload.endpoints).toHaveLength(87);

    const discoveryResponse = require('../../../test/discoveryResponse.routines.test.json');
    expect(response).toEqual(discoveryResponse);
  });
});