const { alexaResponse, alexaStateResponse, eventMessage } = require('/Users/sgracey/Code/homebridge-alexa/src/lib/alexaMessages');
const messages = require('/Users/sgracey/Code/homebridge-alexa/src/lib/parse/messages');

jest.mock('/Users/sgracey/Code/homebridge-alexa/src/lib/parse/messages');

describe('alexaMessages', () => {
  describe('alexaResponse', () => {
    test('should return ErrorResponse when there is an error', () => {
      const message = {
        directive: {
          header: {
            messageId: '123',
            namespace: 'Alexa',
            name: 'TurnOn'
          },
          endpoint: {
            endpointId: 'endpoint-001'
          }
        }
      };
      const err = new Error('Test error');
      const response = alexaResponse(message, null, err, null);
      expect(response.event.header.name).toBe('ErrorResponse');
      expect(response.event.payload.type).toBe('ENDPOINT_UNREACHABLE');
    });

    test('should return ErrorResponse when HomeBridge returns an error', () => {
      const message = {
        directive: {
          header: {
            messageId: '123',
            namespace: 'Alexa',
            name: 'TurnOn'
          },
          endpoint: {
            endpointId: 'endpoint-001'
          }
        }
      };
      const hbResponse = { characteristics: [{ status: -70402 }] };
      const response = alexaResponse(message, hbResponse, null, null);
      expect(response.event.header.name).toBe('ErrorResponse');
      expect(response.event.payload.type).toBe('INVALID_VALUE');
    });

    test('should return correct response for Alexa.PowerController', () => {
      const message = {
        directive: {
          header: {
            messageId: '123',
            namespace: 'Alexa.PowerController',
            name: 'TurnOn'
          },
          endpoint: {
            endpointId: 'endpoint-001'
          }
        }
      };
      const response = alexaResponse(message, { characteristics: [{ status: 0 }] }, null, null);
      expect(response.context.properties[0].namespace).toBe('Alexa.PowerController');
      expect(response.context.properties[0].name).toBe('powerState');
      expect(response.context.properties[0].value).toBe('ON');
    });

    // Add more test cases for other namespaces and scenarios
  });

  describe('alexaStateResponse', () => {
    test('should return ErrorResponse when properties is an error', () => {
      const properties = new Error('Test error');
      const message = {
        directive: {
          header: {
            messageId: '123',
            name: 'ReportState'
          },
          endpoint: {
            endpointId: 'endpoint-001'
          }
        }
      };
      const response = alexaStateResponse(properties, message);
      expect(response.event.header.name).toBe('ErrorResponse');
      expect(response.event.payload.type).toBe('ENDPOINT_UNREACHABLE');
    });

    test('should return StateReport for ReportState directive', () => {
      const properties = [{
        namespace: 'Alexa.PowerController',
        name: 'powerState',
        value: 'ON',
        timeOfSample: new Date().toISOString(),
        uncertaintyInMilliseconds: 500
      }];
      const message = {
        directive: {
          header: {
            messageId: '123',
            name: 'ReportState'
          },
          endpoint: {
            endpointId: 'endpoint-001'
          }
        }
      };
      const response = alexaStateResponse(properties, message);
      expect(response.event.header.name).toBe('StateReport');
      expect(response.context.properties).toEqual(properties[0]);
    });

    // Add more test cases for other scenarios
  });

  describe('eventMessage', () => {
    beforeEach(() => {
      messages.createMessageId.mockReturnValue('123');
    });

    test('should return DoorbellPress event for DoorbellEventSource template', () => {
      const event = {};
      const device = {
        template: 'DoorbellEventSource',
        endpointID: 'endpoint-001'
      };
      const response = eventMessage(event, device);
      expect(response.event.header.namespace).toBe('Alexa.DoorbellEventSource');
      expect(response.event.header.name).toBe('DoorbellPress');
    });

    test('should return ChangeReport event for ContactSensor template', () => {
      const event = { value: 'DETECTED' };
      const device = {
        template: 'ContactSensor',
        endpointID: 'endpoint-001',
        DETECTED: 'DETECTED'
      };
      const response = eventMessage(event, device);
      expect(response.event.header.namespace).toBe('Alexa');
      expect(response.event.header.name).toBe('ChangeReport');
      expect(response.event.payload.change.properties[0].namespace).toBe('Alexa.ContactSensor');
      expect(response.event.payload.change.properties[0].value).toBe('DETECTED');
    });

    // Add more test cases for other templates and scenarios
  });
});