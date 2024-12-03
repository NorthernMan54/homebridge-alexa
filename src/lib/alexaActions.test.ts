const { processStatusArray } = require('/Users/sgracey/Code/homebridge-alexa/src/lib/alexaActions.js');
const alexaMessages = require('/Users/sgracey/Code/homebridge-alexa/src/lib/alexaMessages.js');
const homebridge = require('hap-node-client').HAPNodeJSClient;

jest.mock('hap-node-client');
jest.mock('/Users/sgracey/Code/homebridge-alexa/src/lib/alexaMessages.js');

describe('processStatusArray', () => {
  let statusArray;
  let message;

  beforeEach(() => {
    statusArray = [
      {
        deviceID: 'device1',
        body: '?id=1.1',
        interface: 'Alexa.PowerController',
        spacer: ',',
        elements: [
          { interface: 'Alexa.PowerController', aid: 1, iid: 1 }
        ]
      },
      {
        deviceID: 'device2',
        body: '?id=2.1',
        interface: 'Alexa.BrightnessController',
        spacer: ',',
        elements: [
          { interface: 'Alexa.BrightnessController', aid: 2, iid: 1 }
        ]
      }
    ];
    message = { directive: { header: { messageId: '123' } } };

    homebridge.HAPstatusByDeviceID.mockImplementation((deviceID, body, callback) => {
      if (deviceID === 'device1') {
        callback(null, { characteristics: [{ aid: 1, iid: 1, value: true }] });
      } else if (deviceID === 'device2') {
        callback(null, { characteristics: [{ aid: 2, iid: 1, value: 50 }] });
      } else {
        callback(new Error('Device not found'));
      }
    });

    alexaMessages.alexaStateResponse.mockImplementation((resultArray, message) => {
      return { event: { header: { messageId: message.directive.header.messageId }, payload: { properties: resultArray } } };
    });
  });

  test.skip('should process status array successfully', async () => {
    const result = await processStatusArray(statusArray, message);
    expect(result).toEqual({
      event: {
        header: { messageId: '123' },
        payload: {
          properties: [
            { interface: 'Alexa.PowerController', aid: 1, iid: 1, value: true },
            { interface: 'Alexa.BrightnessController', aid: 2, iid: 1, value: 50 }
          ]
        }
      }
    });
  });

  test.skip('should handle errors during processing', async () => {
    homebridge.HAPstatusByDeviceID.mockImplementationOnce((deviceID, body, callback) => {
      callback(new Error('Device not found'));
    });

    const result = await processStatusArray(statusArray, message);
    expect(result).toEqual({
      event: {
        header: { messageId: '123' },
        payload: {
          properties: [
            { interface: 'Alexa.PowerController', aid: 1, iid: 1, value: true },
            { interface: 'Alexa.BrightnessController', aid: 2, iid: 1, value: 50 }
          ]
        }
      }
    });
  });

  test.skip('should return correct response format', async () => {
    const result = await processStatusArray(statusArray, message);
    expect(result).toHaveProperty('event.header.messageId', '123');
    expect(result).toHaveProperty('event.payload.properties');
    expect(result.event.payload.properties).toHaveLength(2);
  });

  afterAll(() => {
    jest.clearAllMocks();
    homebridge.destroy();
  });
});