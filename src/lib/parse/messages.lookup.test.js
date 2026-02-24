const { lookupCapabilities } = require('./messages');

describe('lib/parse/messages', () => {
  describe('lookupCapabilities', () => {
    test('should return supported operations for PlaybackController capability', () => {
      const capability = 'PlaybackController';
      const options = {};
      const operations = {
        Play: {},
        Pause: {},
        Stop: {},
      };
      const devices = {};

      const result = lookupCapabilities(capability, options, operations, devices);

      expect(result).toEqual([
        {
          type: 'AlexaInterface',
          interface: 'Alexa.PlaybackController',
          version: '3',
          supportedOperations: ['Play', 'Pause', 'Stop'],
        },
      ]);
    });

    test('should return supported properties for ChannelController capability', () => {
      const capability = 'ChannelController';
      const options = {};
      const operations = {};
      const devices = {};

      const result = lookupCapabilities(capability, options, operations, devices);

      expect(result).toEqual([
        {
          type: 'AlexaInterface',
          interface: 'Alexa.ChannelController',
          version: '3',
          properties: {
            supported: [{ name: 'channel' }],
            proactivelyReported: false,
            retrievable: true,
          },
        },
      ]);
    });

    test('should return supported properties for Motion Detected capability - Routines false', () => {
      const capability = 'Motion Detected';
      const options = { routines: false };
      const operations = {};
      const devices = {};

      const result = lookupCapabilities(capability, options, operations, devices);

      expect(result).toEqual([
        {
          type: 'AlexaInterface',
          interface: 'Alexa.MotionSensor',
          version: '3',
          properties: {
            supported: [{ name: 'detectionState' }],
            proactivelyReported: false,
            retrievable: true,
          },
        },
      ]);
    });

    test('should return supported properties for Motion Detected capability - Routines true', () => {
      const capability = 'Motion Detected';
      const options = { routines: true };
      const operations = {};
      const devices = {};

      const result = lookupCapabilities(capability, options, operations, devices);

      expect(result).toEqual([
        {
          type: 'AlexaInterface',
          interface: 'Alexa.MotionSensor',
          version: '3',
          properties: {
            supported: [{ name: 'detectionState' }],
            proactivelyReported: true,
            retrievable: false,
          },
        },
      ]);
    });

    test('should return ContactSensor capability for Smoke Detected - Routines false', () => {
      const capability = 'Smoke Detected';
      const options = { routines: false };
      const result = lookupCapabilities(capability, options, {}, {});
      expect(result).toEqual([
        {
          type: 'AlexaInterface',
          interface: 'Alexa.ContactSensor',
          version: '3',
          properties: {
            supported: [{ name: 'detectionState' }],
            proactivelyReported: false,
            retrievable: true,
          },
        },
      ]);
    });

    test('should return ContactSensor capability for Carbon Monoxide Detected - Routines true', () => {
      const capability = 'Carbon Monoxide Detected';
      const options = { routines: true };
      const result = lookupCapabilities(capability, options, {}, {});
      expect(result).toEqual([
        {
          type: 'AlexaInterface',
          interface: 'Alexa.ContactSensor',
          version: '3',
          properties: {
            supported: [{ name: 'detectionState' }],
            proactivelyReported: true,
            retrievable: false,
          },
        },
      ]);
    });

    test('should return ContactSensor capability for Leak Detected - Routines false', () => {
      const capability = 'Leak Detected';
      const options = { routines: false };
      const result = lookupCapabilities(capability, options, {}, {});
      expect(result).toEqual([
        {
          type: 'AlexaInterface',
          interface: 'Alexa.ContactSensor',
          version: '3',
          properties: {
            supported: [{ name: 'detectionState' }],
            proactivelyReported: false,
            retrievable: true,
          },
        },
      ]);
    });

    // Add more test cases for other capabilities

  });
});