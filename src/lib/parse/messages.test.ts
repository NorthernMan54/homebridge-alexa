const { stateToProperties } = require('/Users/sgracey/Code/homebridge-alexa/src/lib/parse/messages');

describe('stateToProperties', () => {
  const now = new Date();
  const mockDate = now.toISOString();

  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(now);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should convert Alexa.PowerController response correctly', () => {
    const statusObject = {
      elements: [{ interface: 'Alexa.PowerController', aid: 101, iid: 10 }]
    };
    const hbResponse = [{ aid: 101, iid: 10, value: true }];

    const result = stateToProperties(statusObject, hbResponse);

    expect(result).toEqual([{
      namespace: 'Alexa.PowerController',
      name: 'powerState',
      value: 'ON',
      timeOfSample: mockDate,
      uncertaintyInMilliseconds: 500
    }]);
  });

  test('should convert Alexa.PowerController response correctly', () => {
    const statusObject = {
      elements: [{ interface: 'Alexa.PowerController', aid: 101, iid: 10 }]
    };
    const hbResponse = [{ aid: 101, iid: 10, value: true }];

    const result = stateToProperties(statusObject, hbResponse);

    expect(result).toEqual([{
      namespace: 'Alexa.PowerController',
      name: 'powerState',
      value: 'ON',
      timeOfSample: mockDate,
      uncertaintyInMilliseconds: 500
    }]);
  });

  test('should convert Alexa.TemperatureSensor error response correctly', () => {
    const statusObject = {
      elements: [{ interface: 'Alexa.TemperatureSensor', aid: 101, iid: 10 }]
    };
    const hbResponse = [{ aid: 123, iid: 10, status: -70410 }];

    const result = stateToProperties(statusObject, hbResponse);

    expect(result).toEqual([{
      namespace: 'Alexa.TemperatureSensor',
      name: 'temperature',
      value: {
        "scale": "CELSIUS",
        "value": 25,
      },
      timeOfSample: mockDate,
      uncertaintyInMilliseconds: 500
    }]);
  });

  test('should convert Alexa.ColorController response correctly', () => {
    const statusObject = {
      elements: [{ interface: 'Alexa.ColorController', aid: 101, iid: 10 }]
    };
    const hbResponse = [{ aid: 101, iid: 10, value: true }];

    const result = stateToProperties(statusObject, hbResponse);

    expect(result).toEqual([{
      namespace: 'Alexa.ColorController',
      name: 'temperature',
      value: {
        "scale": "CELSIUS",
        "value": 25,
      },
      timeOfSample: mockDate,
      uncertaintyInMilliseconds: 500
    }]);
  });

  test('should convert Alexa.Speaker response correctly', () => {
    const statusObject = {
      elements: [{ interface: 'Alexa.Speaker', aid: 101, iid: 10 }]
    };
    const hbResponse = [{ aid: 101, iid: 10, value: 50 }];

    const result = stateToProperties(statusObject, hbResponse);

    expect(result).toEqual([
      {
        namespace: 'Alexa.Speaker',
        name: 'volume',
        value: 50,
        timeOfSample: mockDate,
        uncertaintyInMilliseconds: 500
      },
      {
        namespace: 'Alexa.Speaker',
        name: 'muted',
        value: false,
        timeOfSample: mockDate,
        uncertaintyInMilliseconds: 500
      }
    ]);
  });

  test('should convert Alexa.ColorTemperatureController response correctly', () => {
    const statusObject = {
      elements: [{ interface: 'Alexa.ColorTemperatureController', aid: 101, iid: 10 }]
    };
    const hbResponse = [{ aid: 101, iid: 10, value: 5000 }];

    const result = stateToProperties(statusObject, hbResponse);

    expect(result).toEqual([{
      namespace: 'Alexa.ColorTemperatureController',
      name: 'colorTemperatureInKelvin',
      value: 200,
      timeOfSample: mockDate,
      uncertaintyInMilliseconds: 500
    }]);
  });

  test('should convert Alexa.TemperatureSensor response correctly', () => {
    const statusObject = {
      elements: [{ interface: 'Alexa.TemperatureSensor', aid: 101, iid: 10 }]
    };
    const hbResponse = [{ aid: 101, iid: 10, value: 22.5 }];

    const result = stateToProperties(statusObject, hbResponse);

    expect(result).toEqual([{
      namespace: 'Alexa.TemperatureSensor',
      name: 'temperature',
      value: {
        value: 22.5,
        scale: 'CELSIUS'
      },
      timeOfSample: mockDate,
      uncertaintyInMilliseconds: 500
    }]);
  });

  test('should handle unknown interface gracefully', () => {
    const statusObject = {
      elements: [{ interface: 'Unknown.Interface', aid: 101, iid: 10 }]
    };
    const hbResponse = [{ aid: 101, iid: 10, value: 100 }];

    const result = stateToProperties(statusObject, hbResponse);

    expect(result).toEqual([]);
  });
});