const { alexaMessage, setHomebridge, destroy } = require('/Users/sgracey/Code/homebridge-alexa/src/lib/alexaActions.js');

jest.mock("hap-node-client", () => {
  // console.log('Mock - hap-node-client');
  return { HAPNodeJSClient: jest.fn() };
});

const HAPstatusByDeviceID = (deviceID, body, callback) => {
  // console.log('Mock - HAPstatusByDeviceID', deviceID, body, callback);
  switch (deviceID) {
    case "ColorController-1":
      callback(null, { deviceID: "device123", status: "on" });
      break;
    case "TemperatureSensor-Ok":
      callback(null, { "characteristics": [{ "aid": 52, "iid": 12, "value": 2.5 }] });
      break;
    case "TemperatureSensor-NoData":
      callback(null, { "characteristics": [{ "aid": 52, "iid": 12, "status": -70410 }] });
      break;
    default:
      console.log('Missing Mock - HAPstatusByDeviceID', deviceID, body, callback);
      callback(null, { deviceID: "device123", status: "off" });
  }
}

setHomebridge({
  HAPstatusByDeviceID: HAPstatusByDeviceID,
  destroy: jest.fn()
});

describe('lib/alexaActions', () => {
  describe('alexaMessage', () => {

    test('ReportState - ColorController', async () => {
      const message = {
        directive: {
          header: {
            name: 'ReportState'
          },
          endpoint: {
            cookie: {
              ReportState: '[{"deviceID": "ColorController-1", "interface": "Alexa.ColorController", "hue": {"aid": "1", "iid": "1"}, "saturation": {"aid": "1", "iid": "2"}, "brightness": {"aid": "1", "iid": "3"}}]'
            }
          }
        }
      };

      const callback = jest.fn();
      alexaMessage.call({ log: jest.fn() }, message, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      expect(callback).toHaveBeenCalled();
      // expect(callback.mock.calls[0][0].context.properties[0].value).toBe(2.5);
      // ...
    }, 5000);

    test('ReportState - TemperatureSensor - Ok', async () => {
      const message = { "directive": { "header": { "namespace": "Alexa", "name": "ReportState", "payloadVersion": "3", "messageId": "1cb7b217-3c2d-40e3-ab3d-fb66fb8bca2f", "correlationToken": "AAAAAAAAAAD9h7NYdun8GkFXkq4RJRZvAAIAAAAAAADHILDp6OTWHFoOX24pkmhvbtYnQ8g2cZAZwwHKZaR7/SF/tatX8I5tEBULWfoqY9WqeLu/WmF2n2mq4RFpbVg6yRZMPdeRbllXqMsG+tSGiiVmdyYT7BP32HlAELpOwtSXbnxNqGomxV7dqfZO2HYAj6qXSLUbnXYmSO7pDiMqT/PUbPSO+1MhcjYSF1UGV11JFihHGNuUyd0VN/bUoW46YWbxzB/zYPk+RUqA1uOfUzVWso8NuDNsE2BWFe4xO1thtJCOQjS9Wo5VA0avOeLO48aMNQ4Awby4aJWW+WzT+qp3v5xqQMwa3m0r8b89CTT2L4LcSD+A5JGE5nwppZyXjFeqgX5W1bY41z6cwjL6U+nW9xhQUzMXDDZ0/nD6bw77+oYQBkes2eexQbUgcl3cjw5OrmdbseOcyo4THzNRfuhZbebMQ/jTEameb/GnFWHoXdmpmR8Md5sEaDXv3X6Qfi2oCw7OXzuCBTHngGf82xw6wQd6ETymES0mZdsvwHTL3HUQBhR6xrAcg4MBPYuGSgVSiAAtresmexfxCDvYIcFf1o6c78w+o3c+w4Cprg6sU+OeF16ouuAjhs3qbX+sgmV9W9tWBPGirQA1WXvePz3LP8SPyjj0BAQ9nnr0tJ59jMtSaRwu6FFnwheVSAyZihggIVTD1pQ+nusFrJkahA==" }, "endpoint": { "endpointId": "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx", "cookie": { "ReportState": "[{\"interface\":\"Alexa.TemperatureSensor\",\"deviceID\":\"TemperatureSensor-Ok\",\"aid\":52,\"iid\":12}]" } }, "payload": {} } };

      const callback = jest.fn();
      alexaMessage.call({ log: jest.fn() }, message, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      // console.log(JSON.stringify(callback.mock.calls[0][1], null, 2));
      expect(callback).toHaveBeenCalled();
      const response = callback.mock.calls[0][1];
      expect(response.context.properties[0].value.value).toBe(2.5);
      expect(response.context.properties[0].value.scale).toBe("CELSIUS");
      // ...
    }, 5000);

    test('ReportState - TemperatureSensor - No Data', async () => {
      const message = { "directive": { "header": { "namespace": "Alexa", "name": "ReportState", "payloadVersion": "3", "messageId": "1cb7b217-3c2d-40e3-ab3d-fb66fb8bca2f", "correlationToken": "AAAAAAAAAAD9h7NYdun8GkFXkq4RJRZvAAIAAAAAAADHILDp6OTWHFoOX24pkmhvbtYnQ8g2cZAZwwHKZaR7/SF/tatX8I5tEBULWfoqY9WqeLu/WmF2n2mq4RFpbVg6yRZMPdeRbllXqMsG+tSGiiVmdyYT7BP32HlAELpOwtSXbnxNqGomxV7dqfZO2HYAj6qXSLUbnXYmSO7pDiMqT/PUbPSO+1MhcjYSF1UGV11JFihHGNuUyd0VN/bUoW46YWbxzB/zYPk+RUqA1uOfUzVWso8NuDNsE2BWFe4xO1thtJCOQjS9Wo5VA0avOeLO48aMNQ4Awby4aJWW+WzT+qp3v5xqQMwa3m0r8b89CTT2L4LcSD+A5JGE5nwppZyXjFeqgX5W1bY41z6cwjL6U+nW9xhQUzMXDDZ0/nD6bw77+oYQBkes2eexQbUgcl3cjw5OrmdbseOcyo4THzNRfuhZbebMQ/jTEameb/GnFWHoXdmpmR8Md5sEaDXv3X6Qfi2oCw7OXzuCBTHngGf82xw6wQd6ETymES0mZdsvwHTL3HUQBhR6xrAcg4MBPYuGSgVSiAAtresmexfxCDvYIcFf1o6c78w+o3c+w4Cprg6sU+OeF16ouuAjhs3qbX+sgmV9W9tWBPGirQA1WXvePz3LP8SPyjj0BAQ9nnr0tJ59jMtSaRwu6FFnwheVSAyZihggIVTD1pQ+nusFrJkahA==" }, "endpoint": { "endpointId": "Njk6NjI6Qjc6QUU6Mzg6RDQtRGVmYXVsdCBNb2RlbC1OUkNIS0IgLSBMYUNyb3NzZS1UWDE0MVctQmFja3lhcmQtMDAwMDAwOEEtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx", "cookie": { "ReportState": "[{\"interface\":\"Alexa.TemperatureSensor\",\"deviceID\":\"TemperatureSensor-NoData\",\"aid\":52,\"iid\":12}]" } }, "payload": {} } };

      const callback = jest.fn();
      alexaMessage.call({ log: jest.fn() }, message, callback);

      await sleep(500);
      // Add your assertions here to verify the behavior of the function
      // console.log(JSON.stringify(callback.mock.calls[0][1], null, 2));
      expect(callback).toHaveBeenCalled();
      const response = callback.mock.calls[0][1];
      expect(response.event.header.name).toBe('ErrorResponse');
      expect(response.event.payload.type).toBe('ENDPOINT_UNREACHABLE');
      // ...
    }, 5000);


    test('should handle unknown directive', () => {
      const message = {
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

      const callback = jest.fn();

      alexaMessage.call({ log: jest.fn() }, message, callback);

      // Add your assertions here to verify the behavior of the function
      expect(callback).toHaveBeenCalled();
      // ...
    });
  });
  afterAll(() => {
    destroy();
  });
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}