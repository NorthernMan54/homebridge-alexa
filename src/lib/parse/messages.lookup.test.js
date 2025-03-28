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

    // Add more test cases for other capabilities

  });
});