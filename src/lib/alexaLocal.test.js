const mqtt = require('mqtt');
const debug = require('debug');
const Bottleneck = require('bottleneck');
const { alexaLocal, alexaEvent, alexaPriorityEvent } = require('/Users/sgracey/Code/homebridge-alexa/src/lib/alexaLocal');

jest.mock('mqtt');
jest.mock('debug');
jest.mock('bottleneck');

describe.skip('alexaLocal', () => {
  let options;
  let mockClient;
  let mockLimiter;

  beforeEach(() => {
    options = {
      mqttURL: 'mqtt://test.mosquitto.org',
      mqttOptions: { username: 'testUser' },
      alexaService: {
        setCharacteristic: jest.fn()
      },
      Characteristic: {
        ContactSensorState: {
          CONTACT_DETECTED: 'CONTACT_DETECTED',
          CONTACT_NOT_DETECTED: 'CONTACT_NOT_DETECTED'
        }
      },
      eventBus: {
        listenerCount: jest.fn().mockReturnValue(1),
        emit: jest.fn()
      },
      log: jest.fn()
    };

    mockClient = {
      on: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn(),
      removeAllListeners: jest.fn(),
      end: jest.fn()
    };

    mqtt.connect.mockReturnValue(mockClient);

    mockLimiter = {
      submit: jest.fn(),
      on: jest.fn()
    };

    Bottleneck.mockImplementation(() => mockLimiter);
  });

  test('should connect to MQTT broker and set up event handlers', () => {
    alexaLocal(options);

    expect(mqtt.connect).toHaveBeenCalledWith(options.mqttURL, options.mqttOptions);
    expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('offline', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('reconnect', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  test('should handle successful connection', () => {
    alexaLocal(options);

    const connectHandler = mockClient.on.mock.calls[0][1];
    connectHandler();

    expect(mockClient.subscribe).toHaveBeenCalledWith('command/testUser/#');
    expect(mockClient.publish).toHaveBeenCalledWith('presence/testUser/1', expect.any(String));
    expect(options.alexaService.setCharacteristic).toHaveBeenCalledWith(
      options.Characteristic.ContactSensorState,
      options.Characteristic.ContactSensorState.CONTACT_DETECTED
    );
  });

  test('should handle offline event', () => {
    alexaLocal(options);

    const offlineHandler = mockClient.on.mock.calls[1][1];
    offlineHandler();

    expect(options.alexaService.setCharacteristic).toHaveBeenCalledWith(
      options.Characteristic.ContactSensorState,
      options.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    );
  });

  test('should handle reconnect event', () => {
    alexaLocal(options);

    const reconnectHandler = mockClient.on.mock.calls[2][1];
    reconnectHandler();

    expect(options.alexaService.setCharacteristic).toHaveBeenCalledWith(
      options.Characteristic.ContactSensorState,
      options.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    );
  });

  test('should handle error event', () => {
    alexaLocal(options);

    const errorHandler = mockClient.on.mock.calls[3][1];
    const error = new Error('Test error');
    error.code = 5;
    errorHandler(error);

    expect(options.alexaService.setCharacteristic).toHaveBeenCalledWith(
      options.Characteristic.ContactSensorState,
      options.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    );
    expect(options.log.error).toHaveBeenCalledWith(expect.stringContaining('Login to homebridge.ca failed'));
  });

  test('should publish alexaEvent', () => {
    alexaLocal(options);
    const message = { test: 'message' };

    alexaEvent(message);

    expect(mockLimiter.submit).toHaveBeenCalledWith(expect.any(Function));
  });

  test('should publish alexaPriorityEvent', () => {
    alexaLocal(options);
    const message = { test: 'priorityMessage' };

    alexaPriorityEvent(message);

    expect(mockLimiter.submit).toHaveBeenCalledWith({ priority: 4 }, expect.any(Function));
  });

  test('should generate alexaErrorResponse', () => {
    const message = {
      directive: {
        header: {
          messageId: 'testMessageId'
        }
      }
    };

    const response = _alexaErrorResponse(message);

    expect(response).toEqual({
      event: {
        header: {
          name: 'ErrorResponse',
          namespace: 'Alexa',
          payloadVersion: '3',
          messageId: 'testMessageId'
        },
        payload: {
          type: 'INVALID_DIRECTIVE',
          message: 'No listener for directive'
        }
      }
    });
  });
});