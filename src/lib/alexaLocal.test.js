const mqtt = require('mqtt');
const Bottleneck = require('bottleneck');
const { alexaLocal, alexaEvent, alexaPriorityEvent } = require('./alexaLocal');

jest.mock('mqtt');
jest.mock('bottleneck');

// Prevent any real network calls
jest.mock('dns', () => ({
  lookup: jest.fn((hostname, callback) => callback(null, '127.0.0.1', 4))
}));

jest.mock('net', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    destroy: jest.fn()
  }))
}));

describe('alexaLocal', () => {
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

    options.log.error = jest.fn();

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
    expect(options.log.error).toHaveBeenCalledWith(expect.stringContaining('ERROR: (homebridge-alexa) Login failed. Validate credentials in config.json.'));
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

  describe('MQTT Message Handler', () => {
    test("Without Response - should generate alexaErrorResponse", async () => {
      alexaLocal(options);
      const connectHandler = mockClient.on.mock.calls[0][1];
      connectHandler();
      mockClient.publish.mockClear();
      // await sleep(10000);
      // Find the message handler from mockClient.on calls
      const messageHandler = mockClient.on.mock.calls.find(
        (call) => call[0] === "message"
      )[1];

      // Simulate an incoming MQTT message
      const topic = "command/testUser/1";
      const payload = JSON.stringify(message1);

      messageHandler(topic, payload);

      // Verify eventBus.emit was called with the received message
      expect(options.eventBus.emit).toHaveBeenCalledWith("Alexa", message1, expect.any(Function));

      const emitCallback = options.eventBus.emit.mock.calls.find(
        (call) => call[0] === "Alexa"
      )[2];

      expect(emitCallback).toBeInstanceOf(Function); // Ensure it's a function

      // Call the captured callback
      emitCallback();

      expect(mockClient.publish).toHaveBeenCalledWith("response/testUser/1", "{\"event\":{\"header\":{\"name\":\"ErrorResponse\",\"namespace\":\"Alexa\",\"payloadVersion\":\"3\",\"messageId\":\"1cb7b217-3c2d-40e3-ab3d-fb66fb8bca2f\"},\"payload\":{\"type\":\"INVALID_DIRECTIVE\",\"message\":\"No listener for directive\"}}}");
      expect(options.log.error).toHaveBeenCalledWith("ERROR Response", JSON.stringify(message1));
      expect(options.log.error).toHaveBeenCalledTimes(1);
    });

    test("With Response", async () => {
      alexaLocal(options);
      const connectHandler = mockClient.on.mock.calls[0][1];
      connectHandler();
      mockClient.publish.mockClear();
      // await sleep(10000);
      // Find the message handler from mockClient.on calls
      const messageHandler = mockClient.on.mock.calls.find(
        (call) => call[0] === "message"
      )[1];

      // Simulate an incoming MQTT message
      const topic = "command/testUser/1";
      const payload = JSON.stringify(message1);

      messageHandler(topic, payload);

      // Verify eventBus.emit was called with the received message
      expect(options.eventBus.emit).toHaveBeenCalledWith("Alexa", message1, expect.any(Function));

      const emitCallback = options.eventBus.emit.mock.calls.find(
        (call) => call[0] === "Alexa"
      )[2];

      expect(emitCallback).toBeInstanceOf(Function); // Ensure it's a function

      // Call the captured callback
      emitCallback(null, message1);

      expect(mockClient.publish).toHaveBeenCalledWith('response/testUser/1', JSON.stringify(message1));
      expect(options.log.error).toHaveBeenCalledTimes(0);

    });
  });
});

const message1 = { "directive": { "header": { "namespace": "Alexa", "name": "ReportState", "payloadVersion": "3", "messageId": "1cb7b217-3c2d-40e3-ab3d-fb66fb8bca2f", "correlationToken": "AAAAAAAAAAD9h7NYdun8GkFXkq4RJRZvAAIAAAAAAADHILDp6OTWHFoOX24pkmhvbtYnQ8g2cZAZwwHKZaR7/SF/tatX8I5tEBULWfoqY9WqeLu/WmF2n2mq4RFpbVg6yRZMPdeRbllXqMsG+tSGiiVmdyYT7BP32HlAELpOwtSXbnxNqGomxV7dqfZO2HYAj6qXSLUbnXYmSO7pDiMqT/PUbPSO+1MhcjYSF1UGV11JFihHGNuUyd0VN/bUoW46YWbxzB/zYPk+RUqA1uOfUzVWso8NuDNsE2BWFe4xO1thtJCOQjS9Wo5VA0avOeLO48aMNQ4Awby4aJWW+WzT+qp3v5xqQMwa3m0r8b89CTT2L4LcSD+A5JGE5nwppZyXjFeqgX5W1bY41z6cwjL6U+nW9xhQUzMXDDZ0/nD6bw77+oYQBkes2eexQbUgcl3cjw5OrmdbseOcyo4THzNRfuhZbebMQ/jTEameb/GnFWHoXdmpmR8Md5sEaDXv3X6Qfi2oCw7OXzuCBTHngGf82xw6wQd6ETymES0mZdsvwHTL3HUQBhR6xrAcg4MBPYuGSgVSiAAtresmexfxCDvYIcFf1o6c78w+o3c+w4Cprg6sU+OeF16ouuAjhs3qbX+sgmV9W9tWBPGirQA1WXvePz3LP8SPyjj0BAQ9nnr0tJ59jMtSaRwu6FFnwheVSAyZihggIVTD1pQ+nusFrJkahA==" }, "endpoint": { "endpointId": "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx", "cookie": { "ReportState": "[{\"interface\":\"Alexa.TemperatureSensor\",\"deviceID\":\"TemperatureSensor-Ok\",\"aid\":52,\"iid\":12}]" } }, "payload": {} } };

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}