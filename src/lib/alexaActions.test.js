const { alexaMessage, setHomebridge, destroy, alexaThermostatController } = require('./alexaActions.js');

jest.mock("hap-node-client", () => {
  // console.log('Mock - hap-node-client');
  return { HAPNodeJSClient: jest.fn() };
});

const HAPstatusByDeviceID = (deviceID, body, callback) => {
  // console.log('Mock - HAPstatusByDeviceID', deviceID, body, callback);
  switch (deviceID) {
    case "ColorController-1":  //"hue": {"aid": "1", "iid": "1"}, "saturation": {"aid": "1", "iid": "2"}, "brightness": {"aid": "1", "iid": "3"}}
      callback(null, { "characteristics": [{ "aid": 10, "iid": 10, "value": 0 }, { "aid": 10, "iid": 14, "value": 25 }, { "aid": 10, "iid": 15, "value": 35 }, { "aid": 10, "iid": 11, "value": 45 }] });
      break;
    case "TemperatureSensor-Ok":
      callback(null, { "characteristics": [{ "aid": 52, "iid": 12, "value": 2.5 }] });
      break;
    case "TemperatureSensor-NotResponding":
      callback(null, { "characteristics": [{ "aid": 52, "iid": 12, "status": -70402 }] });
      break;
    case "TemperatureSensor-NoDevice":
      callback(null, { "characteristics": [{ "aid": 52, "iid": 12, "status": -70410 }] });
      break;
    case "0E:53:9E:7C:32:AC": // Thermostat
      callback(null, {
        "characteristics": [
          { "aid": 61, "iid": 4, "value": 1 }, // PowerState
          { "aid": 61, "iid": 6, "value": 1 }, // ThermostatMode
          { "aid": 61, "iid": 7, "value": 20.0 }, // Temperature
          { "aid": 61, "iid": 8, "value": 18.0 }, // LowerSetpoint
          { "aid": 61, "iid": 9, "value": 22.0 } // UpperSetpoint
        ]
      });
      break;
    default:
      console.log('Missing Mock - HAPstatusByDeviceID', deviceID, body, callback);
      callback(null, { deviceID: "device123", status: "off" });
  }
}

const HAPcontrolByDeviceID = (deviceID, body, callback) => {
  // console.log('Mock - HAPstatusByDeviceID', deviceID, body, callback);
  switch (deviceID) {
    case "0E:53:9E:7C:32:AC": // Thermostat
      callback(null, null);
      break;
    default:
      console.log('Missing Mock - HAPcontrolByDeviceID', deviceID, body, callback);
      callback(null);
  }
}

setHomebridge({
  HAPstatusByDeviceID: HAPstatusByDeviceID,
  HAPcontrolByDeviceID: HAPcontrolByDeviceID,
  destroy: jest.fn()
});

describe('ReportState', () => {

  const callback = jest.fn();

  describe('deviceCleanup: false', () => {
    const context = {
      deviceCleanup: false,
      log: jest.fn()
    };
    context.log.error = jest.fn();

    beforeEach(() => {
      callback.mockClear();
      context.log.mockClear();
      context.log.error.mockClear();
    });

    test('ColorController', async () => {

      alexaMessage.call(context, message1, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      expect(callback).toHaveBeenCalled();
      const response = callback.mock.calls[0][1].context.properties;
      // console.log(JSON.stringify(response, null, 2));
      expect(response[0].value).toBe(45);
      expect(response[0].name).toBe("powerLevel");
      // expect(response[1].value).toBe(null);
      expect(response[1].name).toBe("colorTemperatureInKelvin");
      expect(response[2].value).toBe("OFF");
      expect(response[2].name).toBe("powerState");
      expect(response[3].name).toBe("color");
      expect(response[3].value.hue).toBe(25);
      expect(context.log).toHaveBeenCalledTimes(0);
      expect(context.log.error).toHaveBeenCalledTimes(0);
    }, 5000);

    test('TemperatureSensor - Ok', async () => {

      alexaMessage.call(context, message2, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      // console.log(JSON.stringify(callback.mock.calls[0][1], null, 2));
      expect(callback).toHaveBeenCalled();
      const response = callback.mock.calls[0][1];
      expect(response.context.properties[0].value.value).toBe(2.5);
      expect(response.context.properties[0].value.scale).toBe("CELSIUS");
      // ...
    }, 5000);

    test('TemperatureSensor - Not Responding', async () => {
      alexaMessage.call(context, message3, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      // console.log(JSON.stringify(callback.mock.calls[0][1], null, 2));
      expect(callback).toHaveBeenCalled();
      expect(context.log).toHaveBeenCalledTimes(0);
      expect(context.log.error).toHaveBeenCalledTimes(0);
      // expect(context.log.error).toHaveBeenCalledWith("Error: Device not responding, sending delete report", "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx");
      const response = callback.mock.calls[0][1];
      expect(response.event.header.name).toBe('ErrorResponse');
      expect(response.event.payload.type).toBe('ENDPOINT_UNREACHABLE');
      // ...
    }, 5000);

    test('TemperatureSensor - No Device', async () => {
      alexaMessage.call(context, message3_1, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      // console.log(JSON.stringify(callback.mock.calls[0][1], null, 2));
      expect(callback).toHaveBeenCalled();
      expect(context.log).toHaveBeenCalledTimes(0);
      expect(context.log.error).toHaveBeenCalledTimes(0);
      // expect(context.log.error).toHaveBeenCalledWith("Error: Device not responding, sending delete report", "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx");
      const response = callback.mock.calls[0][1];
      expect(response.event.header.name).toBe('ErrorResponse');
      expect(response.event.payload.type).toBe('ENDPOINT_UNREACHABLE');
      // ...
    }, 5000);


    test('should handle unknown directive', () => {
      alexaMessage.call(context, message4, callback);

      // Add your assertions here to verify the behavior of the function
      expect(callback).toHaveBeenCalled();
      // ...
    });
  });

  describe('deviceCleanup: true', () => {
    var context = {
      deviceCleanup: true,
      log: jest.fn()
    };

    context.log.error = jest.fn();

    beforeEach(() => {
      callback.mockClear();
      context.log.mockClear();
      context.log.error.mockClear();
    });

    test('ColorController', async () => {

      alexaMessage.call(context, message1, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      expect(callback).toHaveBeenCalled();
      const response = callback.mock.calls[0][1].context.properties;
      // console.log(JSON.stringify(response, null, 2));
      expect(response[0].value).toBe(45);
      expect(response[0].name).toBe("powerLevel");
      // expect(response[1].value).toBe(null);
      expect(response[1].name).toBe("colorTemperatureInKelvin");
      expect(response[2].value).toBe("OFF");
      expect(response[2].name).toBe("powerState");
      expect(response[3].name).toBe("color");
      expect(response[3].value.hue).toBe(25);
      expect(context.log).toHaveBeenCalledTimes(0);
      expect(context.log.error).toHaveBeenCalledTimes(0);
    }, 5000);

    test('TemperatureSensor - Ok', async () => {

      alexaMessage.call(context, message2, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      // console.log(JSON.stringify(callback.mock.calls[0][1], null, 2));
      expect(callback).toHaveBeenCalled();
      const response = callback.mock.calls[0][1];
      expect(response.context.properties[0].value.value).toBe(2.5);
      expect(response.context.properties[0].value.scale).toBe("CELSIUS");
      expect(context.log).toHaveBeenCalledTimes(0);
      expect(context.log.error).toHaveBeenCalledTimes(0);
      // ...
    }, 5000);

    test('TemperatureSensor - Not Responding', async () => {
      alexaMessage.call(context, message3, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      // console.log(JSON.stringify(callback.mock.calls[0][1], null, 2));
      expect(callback).toHaveBeenCalled();
      expect(context.log).toHaveBeenCalledTimes(0);
      expect(context.log.error).toHaveBeenCalledTimes(0);
      // expect(context.log.error).toHaveBeenCalledWith("Error: Device not responding, sending delete report", "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx");
      const response = callback.mock.calls[0][1];
      expect(response.event.header.name).toBe('ErrorResponse');
      expect(response.event.payload.type).toBe('ENDPOINT_UNREACHABLE');
      // ...
    }, 5000);

    test('TemperatureSensor - No Device', async () => {
      alexaMessage.call(context, message3_1, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      // console.log(JSON.stringify(callback.mock.calls[0][1], null, 2));
      expect(callback).toHaveBeenCalled();
      expect(context.log).toHaveBeenCalledTimes(0);
      expect(context.log.error).toHaveBeenCalledTimes(1);
      expect(context.log.error).toHaveBeenCalledWith("Error: Device not responding, scheduling delete report", "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx");
      const response = callback.mock.calls[0][1];
      expect(response.event.header.name).toBe('ErrorResponse');
      expect(response.event.payload.type).toBe('ENDPOINT_UNREACHABLE');
      // ...
    }, 5000);

    test('should handle unknown directive', () => {
      alexaMessage.call(context, message4, callback);

      // Add your assertions here to verify the behavior of the function
      expect(callback).toHaveBeenCalled();
      // ...
    });
  });



  afterAll(() => {
    destroy();
  });
});

describe('Controller', () => {
  const callback = jest.fn();
  describe('alexaThermostatController', () => {
    describe('SetTargetTemperature', () => {
      const context = {
        deviceCleanup: false,
        log: jest.fn()
      };
      context.log.error = jest.fn();
      context.log.warn = jest.fn();

      beforeEach(() => {
        callback.mockClear();
        context.log.mockClear();
        context.log.error.mockClear();
        context.log.warn.mockClear();
      });
      test('targetSetpoint', async () => {
        alexaThermostatController.call(context, thermostatSet, callback);

        await sleep(500);
        // Add your assertions here to verify the behavior of the function
        expect(context.log).toHaveBeenCalledTimes(1);
        expect(context.log).toHaveBeenCalledWith('Alexa.ThermostatController', 'SetTargetTemperature-Heat', '0E:53:9E:7C:32:AC', 'Q0M6MjI6M0Q6RTM6Q0Y6MzMtaG9tZWJyaWRnZS1TaWduaWZ5IE5ldGhlcmxhbmRzIEIuVi4tQWxpY2XigJlzIExpZ2h0LTAwMDAwMDQzLTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ==', '');
        expect(context.log.error).toHaveBeenCalledTimes(0);
        expect(context.log.warn).toHaveBeenCalledTimes(0);
        expect(callback).toHaveBeenCalled();
        const response = callback.mock.calls[0][1].context.properties;
        //expect(response[0].value).toBe(45);
        expect(response[0].name).toBe("targetSetpoint");
      });
    });
  });
  afterAll(() => {
    destroy();
  });
});


async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const message1 = {
  "directive": {
    "header": { "namespace": "Alexa", "name": "ReportState", "payloadVersion": "3", "messageId": "bbca65f0-183f-4bc9-9c3f-277e963106aa", "correlationToken": "AAAAAAAAAABr5SUHNe8BBkCT1sRvubl2AAIAAAAAAAB90j2CBpD9gvkdeRQB7XdUryxMTIusyHgcdCdx3swJ17yGKRsJsZi4Lx+VxDYBxWrXR8/zNW1axGXiPFGPIMZW9UQCfboB6lvDU8Gwfjxu/BruHTKTjbtLB/OLFc9i+XdGjT5g4NaFSqz8jLNTiHt/gjpEPRhf4nQTLLnqlrAQ/UBqEro+qCrD13Z741DG9qRiMjt9Ell8MfIWF/tMI8nAo5Tl/RN7Vgjq5rfF162bXWWbwiEm+NALzW0rh6SqTG1zv7CEczLKBh3HYIDaAo7W11Gbr8yMayElieKtzuB6rll3s9hJxRID6EY/7Qk4U8F4qflv+ZnpUS78HKkwaqlJOaKbiiRcJ01kM+QxhXD/uTuNYoSHfMoI2cJPJKy7s0QkazZtYQhfrXIm2zWVUX6BbpQOLA6PghDrI0+E37xGpibNwiteLYKgMPySOnJQ819yNjninJfTlKZYeDs3X1nybUysNezzpz+KyQmTlzGj31FV/G+nBzaqcSIfQu9OytV7Oo0midw0Jed3qT9UUO2hzNTM3VyUOupZT0N/h8WkQZQyu8yIy6KWXrEDgW+7LphqlEJ858R8u8fod0Hy75kvm578st9nEF3BhwLQSTq/thXLa0rA/S7w+iOZxg8slHKoUrl+VJyg4CwAnEF92LvTDDIYRY3jtI5QtBCPzA0uGg==" }, "endpoint": {
      "endpointId": "Q0M6MjI6M0Q6RTM6Q0Y6MzMtaG9tZWJyaWRnZS1TaWduaWZ5IE5ldGhlcmxhbmRzIEIuVi4tQWxpY2XigJlzIExpZ2h0LTAwMDAwMDQzLTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ==",
      "cookie": {
        "TurnOn": "{\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":10,\"value\":1}",
        "AdjustPowerLevel": "{\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":11}",
        "ReportState": "[{\"interface\":\"Alexa.PowerLevelController\",\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":11},\{\"interface\":\"Alexa.ColorTemperatureController\",\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":13},{\"interface\":\"Alexa.PowerController\",\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":10},{\"interface\":\"Alexa.ColorController\",\"deviceID\":\"ColorController-1\",\"hue\":{\"aid\":10,\"iid\":14},\"saturation\":{\"aid\":10,\"iid\":15},\"brightness\":{\"aid\":10,\"iid\":11},\"on\":{\"aid\":10,\"iid\":10}}]",
        "SetColorTemperature": "{\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":13}",
        "BrightnessTurnOn": "true",
        "DecreaseColorTemperature": "{\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":13}",
        "SetPowerLevel": "{\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":11}",
        "SetColor": "{\"deviceID\":\"ColorController-1\",\"hue\":{\"aid\":10,\"iid\":14},\"saturation\":{\"aid\":10,\"iid\":15},\"brightness\":{\"aid\":10,\"iid\":11},\"on\":{\"aid\":10,\"iid\":10}}",
        "IncreaseColorTemperature": "{\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":13}",
        "TurnOff": "{\"deviceID\":\"ColorController-1\",\"aid\":10,\"iid\":10,\"value\":0}"
      }
    }, "payload": {}
  }
};

const message2 = { "directive": { "header": { "namespace": "Alexa", "name": "ReportState", "payloadVersion": "3", "messageId": "1cb7b217-3c2d-40e3-ab3d-fb66fb8bca2f", "correlationToken": "AAAAAAAAAAD9h7NYdun8GkFXkq4RJRZvAAIAAAAAAADHILDp6OTWHFoOX24pkmhvbtYnQ8g2cZAZwwHKZaR7/SF/tatX8I5tEBULWfoqY9WqeLu/WmF2n2mq4RFpbVg6yRZMPdeRbllXqMsG+tSGiiVmdyYT7BP32HlAELpOwtSXbnxNqGomxV7dqfZO2HYAj6qXSLUbnXYmSO7pDiMqT/PUbPSO+1MhcjYSF1UGV11JFihHGNuUyd0VN/bUoW46YWbxzB/zYPk+RUqA1uOfUzVWso8NuDNsE2BWFe4xO1thtJCOQjS9Wo5VA0avOeLO48aMNQ4Awby4aJWW+WzT+qp3v5xqQMwa3m0r8b89CTT2L4LcSD+A5JGE5nwppZyXjFeqgX5W1bY41z6cwjL6U+nW9xhQUzMXDDZ0/nD6bw77+oYQBkes2eexQbUgcl3cjw5OrmdbseOcyo4THzNRfuhZbebMQ/jTEameb/GnFWHoXdmpmR8Md5sEaDXv3X6Qfi2oCw7OXzuCBTHngGf82xw6wQd6ETymES0mZdsvwHTL3HUQBhR6xrAcg4MBPYuGSgVSiAAtresmexfxCDvYIcFf1o6c78w+o3c+w4Cprg6sU+OeF16ouuAjhs3qbX+sgmV9W9tWBPGirQA1WXvePz3LP8SPyjj0BAQ9nnr0tJ59jMtSaRwu6FFnwheVSAyZihggIVTD1pQ+nusFrJkahA==" }, "endpoint": { "endpointId": "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx", "cookie": { "ReportState": "[{\"interface\":\"Alexa.TemperatureSensor\",\"deviceID\":\"TemperatureSensor-Ok\",\"aid\":52,\"iid\":12}]" } }, "payload": {} } };

const message3 = { "directive": { "header": { "namespace": "Alexa", "name": "ReportState", "payloadVersion": "3", "messageId": "1cb7b217-3c2d-40e3-ab3d-fb66fb8bca2f", "correlationToken": "AAAAAAAAAAD9h7NYdun8GkFXkq4RJRZvAAIAAAAAAADHILDp6OTWHFoOX24pkmhvbtYnQ8g2cZAZwwHKZaR7/SF/tatX8I5tEBULWfoqY9WqeLu/WmF2n2mq4RFpbVg6yRZMPdeRbllXqMsG+tSGiiVmdyYT7BP32HlAELpOwtSXbnxNqGomxV7dqfZO2HYAj6qXSLUbnXYmSO7pDiMqT/PUbPSO+1MhcjYSF1UGV11JFihHGNuUyd0VN/bUoW46YWbxzB/zYPk+RUqA1uOfUzVWso8NuDNsE2BWFe4xO1thtJCOQjS9Wo5VA0avOeLO48aMNQ4Awby4aJWW+WzT+qp3v5xqQMwa3m0r8b89CTT2L4LcSD+A5JGE5nwppZyXjFeqgX5W1bY41z6cwjL6U+nW9xhQUzMXDDZ0/nD6bw77+oYQBkes2eexQbUgcl3cjw5OrmdbseOcyo4THzNRfuhZbebMQ/jTEameb/GnFWHoXdmpmR8Md5sEaDXv3X6Qfi2oCw7OXzuCBTHngGf82xw6wQd6ETymES0mZdsvwHTL3HUQBhR6xrAcg4MBPYuGSgVSiAAtresmexfxCDvYIcFf1o6c78w+o3c+w4Cprg6sU+OeF16ouuAjhs3qbX+sgmV9W9tWBPGirQA1WXvePz3LP8SPyjj0BAQ9nnr0tJ59jMtSaRwu6FFnwheVSAyZihggIVTD1pQ+nusFrJkahA==" }, "endpoint": { "endpointId": "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx", "cookie": { "ReportState": "[{\"interface\":\"Alexa.TemperatureSensor\",\"deviceID\":\"TemperatureSensor-NotResponding\",\"aid\":52,\"iid\":12}]" } }, "payload": {} } };

const message3_1 = { "directive": { "header": { "namespace": "Alexa", "name": "ReportState", "payloadVersion": "3", "messageId": "1cb7b217-3c2d-40e3-ab3d-fb66fb8bca2f", "correlationToken": "AAAAAAAAAAD9h7NYdun8GkFXkq4RJRZvAAIAAAAAAADHILDp6OTWHFoOX24pkmhvbtYnQ8g2cZAZwwHKZaR7/SF/tatX8I5tEBULWfoqY9WqeLu/WmF2n2mq4RFpbVg6yRZMPdeRbllXqMsG+tSGiiVmdyYT7BP32HlAELpOwtSXbnxNqGomxV7dqfZO2HYAj6qXSLUbnXYmSO7pDiMqT/PUbPSO+1MhcjYSF1UGV11JFihHGNuUyd0VN/bUoW46YWbxzB/zYPk+RUqA1uOfUzVWso8NuDNsE2BWFe4xO1thtJCOQjS9Wo5VA0avOeLO48aMNQ4Awby4aJWW+WzT+qp3v5xqQMwa3m0r8b89CTT2L4LcSD+A5JGE5nwppZyXjFeqgX5W1bY41z6cwjL6U+nW9xhQUzMXDDZ0/nD6bw77+oYQBkes2eexQbUgcl3cjw5OrmdbseOcyo4THzNRfuhZbebMQ/jTEameb/GnFWHoXdmpmR8Md5sEaDXv3X6Qfi2oCw7OXzuCBTHngGf82xw6wQd6ETymES0mZdsvwHTL3HUQBhR6xrAcg4MBPYuGSgVSiAAtresmexfxCDvYIcFf1o6c78w+o3c+w4Cprg6sU+OeF16ouuAjhs3qbX+sgmV9W9tWBPGirQA1WXvePz3LP8SPyjj0BAQ9nnr0tJ59jMtSaRwu6FFnwheVSAyZihggIVTD1pQ+nusFrJkahA==" }, "endpoint": { "endpointId": "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx", "cookie": { "ReportState": "[{\"interface\":\"Alexa.TemperatureSensor\",\"deviceID\":\"TemperatureSensor-NoDevice\",\"aid\":52,\"iid\":12}]" } }, "payload": {} } };

const message4 = {
  directive: {
    header: {
      name: 'Unknown'
    },
    endpoint: {
      cookie: {
        reportstate: '[{"deviceID": "1", "interface": "Alexa.ColorController", "hue": {"aid": "1", "iid": "1"}, "saturation": {"aid": "1", "iid": "2"}, "brightness": {"aid": "1", "iid": "3"}}]'
      }
    }
  }
};

const thermostatSet = {
  directive: {
    header: {
      namespace: "Alexa.ThermostatController",
      "name": "SetTargetTemperature", "payloadVersion": "3", "messageId": "bbca65f0-183f-4bc9-9c3f-277e963106aa", "correlationToken": "AAAAAAAAAABr5SUHNe8BBkCT1sRvubl2AAIAAAAAAAB90j2CBpD9gvkdeRQB7XdUryxMTIusyHgcdCdx3swJ17yGKRsJsZi4Lx+VxDYBxWrXR8/zNW1axGXiPFGPIMZW9UQCfboB6lvDU8Gwfjxu/BruHTKTjbtLB/OLFc9i+XdGjT5g4NaFSqz8jLNTiHt/gjpEPRhf4nQTLLnqlrAQ/UBqEro+qCrD13Z741DG9qRiMjt9Ell8MfIWF/tMI8nAo5Tl/RN7Vgjq5rfF162bXWWbwiEm+NALzW0rh6SqTG1zv7CEczLKBh3HYIDaAo7W11Gbr8yMayElieKtzuB6rll3s9hJxRID6EY/7Qk4U8F4qflv+ZnpUS78HKkwaqlJOaKbiiRcJ01kM+QxhXD/uTuNYoSHfMoI2cJPJKy7s0QkazZtYQhfrXIm2zWVUX6BbpQOLA6PghDrI0+E37xGpibNwiteLYKgMPySOnJQ819yNjninJfTlKZYeDs3X1nybUysNezzpz+KyQmTlzGj31FV/G+nBzaqcSIfQu9OytV7Oo0midw0Jed3qT9UUO2hzNTM3VyUOupZT0N/h8WkQZQyu8yIy6KWXrEDgW+7LphqlEJ858R8u8fod0Hy75kvm578st9nEF3BhwLQSTq/thXLa0rA/S7w+iOZxg8slHKoUrl+VJyg4CwAnEF92LvTDDIYRY3jtI5QtBCPzA0uGg=="
    },
    "endpoint": {
      "endpointId": "Q0M6MjI6M0Q6RTM6Q0Y6MzMtaG9tZWJyaWRnZS1TaWduaWZ5IE5ldGhlcmxhbmRzIEIuVi4tQWxpY2XigJlzIExpZ2h0LTAwMDAwMDQzLTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ==",
      "cookie": {
        thermostatModeCOOL: '{"deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":6,"value":2}',
        TurnOn: '{"deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":4,"value":1}',
        upperSetpoint: '{"deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":9}',
        ReportState: '[{"interface":"Alexa.PowerController","deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":4},{"interface":"Alexa.ThermostatControllerthermostatMode","deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":6},{"interface":"Alexa.TemperatureSensor","deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":7},{"interface":"Alexa.ThermostatControllerlowerSetpoint","deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":8},{"interface":"Alexa.ThermostatControllerupperSetpoint","deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":9}]',
        thermostatModeOFF: '{"deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":6,"value":0}',
        lowerSetpoint: '{"deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":8}',
        thermostatMode: '{"deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":6}',
        thermostatModeAUTO: '{"deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":6,"value":3}',
        TurnOff: '{"deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":4,"value":0}',
        thermostatModeHEAT: '{"deviceID":"0E:53:9E:7C:32:AC","aid":61,"iid":6,"value":1}'
      }
    },
    payload: {
      targetSetpoint: {
        "value": 20.0,
        "scale": "CELSIUS"
      }
    }
  }
};