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

    test('should return ContactSensor capability for Smoke Detected - Routines false, alexaAlertSensors true', () => {
      const capability = 'Smoke Detected';
      const options = { routines: false, alexaAlertSensors: true };
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

    test('should return empty array for Smoke Detected when alexaAlertSensors is false', () => {
      const capability = 'Smoke Detected';
      const options = { routines: false, alexaAlertSensors: false };
      const result = lookupCapabilities(capability, options, {}, {});
      expect(result).toEqual([]);
    });

    test('should return ContactSensor capability for Carbon Monoxide Detected - Routines true, alexaAlertSensors true', () => {
      const capability = 'Carbon Monoxide Detected';
      const options = { routines: true, alexaAlertSensors: true };
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

    test('should return ContactSensor capability for Leak Detected - Routines false, alexaAlertSensors true', () => {
      const capability = 'Leak Detected';
      const options = { routines: false, alexaAlertSensors: true };
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