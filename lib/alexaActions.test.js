// External Libraries

const http = require('node:http');
const util = require('node:util');
const bonjour = require('bonjour-hap')()
const fs = require('fs');

// Internal Libraries



/*

curl -X PUT http://192.168.1.11:46775/accessories --header "Content-Type:Application/json" --header "authorization: 031-45-154"
curl -X GET http://192.168.1.11:46775/characteristics?id=9.10 --header "Content-Type:Application/json" --header "authorization: 031-45-154"
*/

// Homebridge emulator setup

const testType = 'test';
const discoveryTimeout = 5;   // Rerun discovery every X
const testPort = 3000;

let publishTxt = {
  "c#": 1,
  ff: 0,
  id: 'aa:bb:cc:dd:ee:ff',
  md: 'alexaActions_Test_Accessory',
  pv: '1.1',
  "s#": 1, // current state number (must be 1)
  sf: '0',
  ci: 2,
  sh: 'setupHash'
};

const publishOptions = {
  name: 'alexaActions_Test_Accessory',
  type: testType,
  port: testPort,
  host: 'alexaActions_Test_Accessory.local',
  txt: publishTxt
}

// Test Variables

const testDeviceID = "CC:22:3D:E3:CF:33";
const testAccessoryStatus = "?id=9.10";
const testAccessoryControlOff = JSON.stringify({ "characteristics": [{ "aid": 9, "iid": 10, "value": 0 }] });
const testAccessoryControlOn = JSON.stringify({ "characteristics": [{ "aid": 9, "iid": 10, "value": 1 }] });

const testAccessoryEventFail = JSON.stringify({ "characteristics": [{ "aid": 9, "iid": 9, "ev": true }] });
const testAccessoryEventOn = JSON.stringify({ "characteristics": [{ "aid": 9, "iid": 10, "ev": true }] });

const testResourceDeviceID = "7E:94:75:31:A2:DD";
const testResourceMessage = JSON.stringify({ "resource-type": "image", "image-width": 1920, "image-height": 1080 });

describe.skip("Local Test", () => {
  var alexaActions = require('./alexaActions.js');

  let homebridges;
  let service;
  let httpServer;

  let testResponse;

  var options = {
    type: testType,
    timeout: discoveryTimeout,  // Discovery timeout;
    log: console.log,
  };

  beforeAll(() => {

    let app = async function (req, res) {
      // console.log('req', req.url);
      switch (req.method) {
        case 'PUT':
          console.log('req', req.url, req.body);
          break;
        case 'GET':
          switch (req.url) {
            case '/accessories':
              await res.writeHead(200);
              await res.end(JSON.stringify(testResponse));
              break;
            case '/characteristics?id=9.10':
              await res.writeHead(200);
              await res.end(JSON.stringify({ "characteristics": [{ "aid": 2, "iid": 9, "value": 0 }] }));
              break;
            case '/characteristics':
              await res.writeHead(200);
              await res.end(JSON.stringify({ "characteristics": [{ "aid": 2, "iid": 9, "value": 0 }] }));
              break;
            case '/characteristics%7B%20a:%201%20%7D':
              await res.writeHead(500);
              await res.end(JSON.stringify({ "characteristics": [{ "aid": 2, "iid": 9, "value": 0 }] }));
              break;
            default:
              await res.writeHead(200, { 'Content-Type': 'Application/json' });
              await res.end("hello world\n");
          }
          break;
        default:
          await res.writeHead(200, { 'Content-Type': 'Application/json' });
          await res.end("hello world\n");
      }
    }
    httpServer = http.createServer(app).listen(testPort);

    homebridges = new alexaActions.hapDiscovery(options);
  });

  describe("alexaDiscovery", () => {
    beforeEach(() => {
      service = bonjour.publish(publishOptions);
      service.start()
    });

    test("Homebridge-Alexa Contact Sensor is not returned", done => {
      const updateMock = jest.fn((data) => { }); // console.log('called', data)
      const readyMock = jest.fn((data) => { }); // console.log('called', data)

      testResponse = alexaAccessories
      homebridges.on('Update', updateMock);

      function callback(error, data) {
        if (error) {
          done(error);
          return;
        }
        try {
          expect(data).toBeDefined();
          expect(data.event.payload.endpoints).toBeDefined();
          expect(data.event.payload.endpoints.length).toBe(0);
          done();
        } catch (error) {
          done(error);
        }
      }

      homebridges.once('Ready', function () {
        console.log('REady called');
        alexaActions.alexaDiscovery.call(options, null, callback);
      });
    }, 19000);

    afterEach(async () => {
      homebridges.removeAllListeners();
      if (service._activated) {
        service.stop();
        await sleep(500); // service.stop should really be a callback
      }
    });
  });

  afterAll(async () => {
    await bonjour.unpublishAll(async function (err) {
      if (err)
        console.log('unpublishAll', err);
      bonjour.destroy();
    });
    await homebridges.destroy();
    httpServer.closeAllConnections();
    httpServer.close();
  }, 30000);
});

describe("Local Test - delete devices", () => {
  var alexaActions = require('./alexaActions.js');

  let homebridges;
  let service;
  let httpServer;

  let testResponse;

  var options = {
    type: testType,
    timeout: discoveryTimeout,  // Discovery timeout;
    log: console.log,
    debug: true,
    persist: '.'
  };

  beforeAll(() => {

    let app = async function (req, res) {
      // console.log('req', req.url);
      switch (req.method) {
        case 'PUT':
          console.log('req', req.url, req.body);
          break;
        case 'GET':
          switch (req.url) {
            case '/accessories':
              await res.writeHead(200);
              await res.end(JSON.stringify(testResponse));
              break;
            case '/characteristics?id=9.10':
              await res.writeHead(200);
              await res.end(JSON.stringify({ "characteristics": [{ "aid": 2, "iid": 9, "value": 0 }] }));
              break;
            case '/characteristics':
              await res.writeHead(200);
              await res.end(JSON.stringify({ "characteristics": [{ "aid": 2, "iid": 9, "value": 0 }] }));
              break;
            case '/characteristics%7B%20a:%201%20%7D':
              await res.writeHead(500);
              await res.end(JSON.stringify({ "characteristics": [{ "aid": 2, "iid": 9, "value": 0 }] }));
              break;
            default:
              await res.writeHead(200, { 'Content-Type': 'Application/json' });
              await res.end("hello world\n");
          }
          break;
        default:
          await res.writeHead(200, { 'Content-Type': 'Application/json' });
          await res.end("hello world\n");
      }
    }
    httpServer = http.createServer(app).listen(testPort);

    homebridges = new alexaActions.hapDiscovery(options);
  });

  describe('support functions', () => {
    test("_alexaDiscoveryDeleteReport", async () => {
      const deleteReport = await alexaActions._alexaDiscoveryDeleteReport.call(this, lastEndpoints, currentEndpoints);

      var result = {
        event: {
          header: {
            messageId: "2HA10FNyc_KhxwyQGJWs2_6PNSCc3M",
            name: "DeleteReport",
            namespace: "Alexa.Discovery",
            payloadVersion: "3",
          },
          payload: {
            endpoints: [
              {
                endpointId:
                  "YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLUJhdW0gTGljaHQtMDAwMDAwNDMtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx",
              },
            ],
            scope: { token: "OAuth2.0 bearer token", type: "BearerToken" },
          },
        },
      };

      expect(deleteReport).toBeDefined();
      expect(deleteReport.event.payload.endpoints).toHaveLength(1);
    });
  });

  describe("alexaDiscovery", () => {
    beforeEach(() => {
      service = bonjour.publish(publishOptions);
      service.start()
    });

    test("don't create endpointCache", done => {
      const updateMock = jest.fn((data) => { }); // console.log('called', data)
      const readyMock = jest.fn((data) => { }); // console.log('called', data)
      fs.existsSync(options.persist + '/homebridge-alexa-endpointCache.json') && fs.unlinkSync(options.persist + '/homebridge-alexa-endpointCache.json');
      testResponse = beforeAccessories
      homebridges.on('Update', updateMock);

      function callback(error, data) {
        if (error) {
          done(error);
          return;
        }
        try {
          expect(data).toBeDefined();
          expect(data.event.payload.endpoints).toBeDefined();
          expect(data.event.payload.endpoints.length).toBe(27);
          expect(fs.existsSync(options.persist + '/homebridge-alexa-endpointCache.json')).toBeFalsy();
          done();
        } catch (error) {
          done(error);
        }
      }

      homebridges.once('Ready', function () {
        console.log('REady called');
        alexaActions.alexaDiscovery.call(options, null, callback);
      });
    }, 19000);

    test("create endpointCache", done => {
      options.deleteDevices = true;
      const updateMock = jest.fn((data) => { }); // console.log('called', data)
      const readyMock = jest.fn((data) => { }); // console.log('called', data)
      fs.existsSync(options.persist + '/homebridge-alexa-endpointCache.json') && fs.unlinkSync(options.persist + '/homebridge-alexa-endpointCache.json');
      testResponse = beforeAccessories
      homebridges.on('Update', updateMock);

      function callback(error, data) {
        if (error) {
          done(error);
          return;
        }
        try {
          expect(data).toBeDefined();
          expect(data.event.payload.endpoints).toBeDefined();
          expect(data.event.payload.endpoints.length).toBe(27);
          expect(fs.existsSync(options.persist + '/homebridge-alexa-endpointCache.json')).toBeTruthy();
          done();
        } catch (error) {
          done(error);
        }
      }

      //   homebridges.once('Ready', function () {
      //      console.log('REady called');
      alexaActions.alexaDiscovery.call(options, null, callback);
      //    });
    }, 19000);

    afterEach(async () => {
      homebridges.removeAllListeners();
      if (service._activated) {
        service.stop();
        await sleep(500); // service.stop should really be a callback
      }
    });
  });

  afterAll(async () => {
    await bonjour.unpublishAll(async function (err) {
      if (err)
        console.log('unpublishAll', err);
      bonjour.destroy();
    });
    await homebridges.destroy();
    httpServer.closeAllConnections();
    httpServer.close();
  }, 30000);
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Sample Accessory

const alexaAccessories = {
  "accessories": [
    { "aid": 1, "services": [{ "type": "3E", "iid": 1, "characteristics": [{ "type": "14", "iid": 2, "perms": ["pw"], "description": "Identify", "format": "bool" }, { "type": "20", "iid": 3, "value": "homebridge.io", "perms": ["pr"], "description": "Manufacturer", "format": "string", "maxLen": 64 }, { "type": "21", "iid": 4, "value": "homebridge", "perms": ["pr"], "description": "Model", "format": "string", "maxLen": 64 }, { "type": "23", "iid": 5, "value": "Heisenberg 4534", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 }, { "type": "30", "iid": 6, "value": "AA:BB:CC:DD:EE:01", "perms": ["pr"], "description": "Serial Number", "format": "string", "maxLen": 64 }, { "type": "52", "iid": 7, "value": "1.7.0", "perms": ["pr"], "description": "Firmware Revision", "format": "string" }] }, { "type": "A2", "iid": 2000000008, "characteristics": [{ "type": "37", "iid": 9, "value": "1.1.0", "perms": ["pr"], "description": "Version", "format": "string", "maxLen": 64 }] }] },
    { "aid": 34, "services": [{ "type": "3E", "iid": 1, "characteristics": [{ "type": "14", "iid": 2, "perms": ["pw"], "description": "Identify", "format": "bool" }, { "type": "20", "iid": 3, "value": "homebridge-alexa", "perms": ["pr"], "description": "Manufacturer", "format": "string", "maxLen": 64 }, { "type": "21", "iid": 4, "value": "Default-Model", "perms": ["pr"], "description": "Model", "format": "string", "maxLen": 64 }, { "type": "23", "iid": 5, "value": "Alexa", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 }, { "type": "30", "iid": 6, "value": "Pinkman.local", "perms": ["pr"], "description": "Serial Number", "format": "string", "maxLen": 64 }, { "type": "52", "iid": 7, "value": "0.6.9", "perms": ["pr"], "description": "Firmware Revision", "format": "string" }] }, { "type": "80", "iid": 8, "characteristics": [{ "type": "23", "iid": 9, "value": "Alexa", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 }, { "type": "6A", "iid": 10, "value": 0, "perms": ["ev", "pr"], "description": "Contact Sensor State", "format": "uint8", "minValue": 0, "maxValue": 1, "minStep": 1, "valid-values": [0, 1] }] }] }]
};

var currentEndpoints = [
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLVBvb2wgTGljaHQtMDAwMDAwNDMtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLVJHQiBTdHJpcC0wMDAwMDA0My0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLVNvbWZ5IC0gMC0wMDAwMDA4Qy0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLVdvaG56aW1tZXIgVGVtcGVyYXR1ci0wMDAwMDA4QS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQ3lhbi0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQXRsYW50aWtibGF1LTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQmxhdS0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQmxpbmtlbi0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQmxpdHpsaWNodC0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tR2VsYi0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tR3LDvG4tMDAwMDAwNDktMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tRHVua2VsIEdlbGItMDAwMDAwNDktMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tRHVua2xlci0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tRmFkZS0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tSGVsbGJsYXUtMDAwMDAwNDktMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tSGVsbGVyLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tSGVsbGdyw7xuLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tT3JhbmdlLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tU21vb3RoLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tUGluay0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tUm90LTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tUm95YWxibGF1LTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tV2Vpc3MtMDAwMDAwNDktMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tVG9tYXRvLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tVMO8cmtpcy0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tVmlvbGV0dC0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  }
];

var lastEndpoints = [
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLUJhdW0gTGljaHQtMDAwMDAwNDMtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLVBvb2wgTGljaHQtMDAwMDAwNDMtMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLVJHQiBTdHJpcC0wMDAwMDA0My0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLVNvbWZ5IC0gMC0wMDAwMDA4Qy0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LURlZmF1bHQtTWFudWZhY3R1cmVyLVdvaG56aW1tZXIgVGVtcGVyYXR1ci0wMDAwMDA4QS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQ3lhbi0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQXRsYW50aWtibGF1LTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQmxhdS0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQmxpbmtlbi0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tQmxpdHpsaWNodC0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tR2VsYi0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tR3LDvG4tMDAwMDAwNDktMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tRHVua2VsIEdlbGItMDAwMDAwNDktMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tRHVua2xlci0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tRmFkZS0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tSGVsbGJsYXUtMDAwMDAwNDktMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tSGVsbGVyLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tSGVsbGdyw7xuLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tT3JhbmdlLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tU21vb3RoLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tUGluay0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tUm90LTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tUm95YWxibGF1LTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tV2Vpc3MtMDAwMDAwNDktMDAwMC0xMDAwLTgwMDAtMDAyNkJCNzY1Mjkx'
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tVG9tYXRvLTAwMDAwMDQ5LTAwMDAtMTAwMC04MDAwLTAwMjZCQjc2NTI5MQ=='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tVMO8cmtpcy0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  },
  {
    endpointId: 'YWE6YmI6Y2M6ZGQ6ZWU6ZmYtYWxleGFBY3Rpb25zX1Rlc3RfQWNjZXNzb3J5LVN3aXRjaGVyb28tVmlvbGV0dC0wMDAwMDA0OS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE='
  }
];

const beforeAccessories = {
  "accessories": [{
    "aid": 1,
    "services": [{
      "iid": 1,
      "type": "0000003E-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 2,
        "type": "00000014-0000-1000-8000-0026BB765291",
        "perms": ["pw"],
        "format": "bool",
        "description": "Identify"
      }, {
        "iid": 3,
        "type": "00000020-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Nick Farina",
        "description": "Manufacturer"
      }, {
        "iid": 4,
        "type": "00000021-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Homebridge",
        "description": "Model"
      }, {
        "iid": 5,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Homebride",
        "description": "Name"
      }, {
        "iid": 6,
        "type": "00000030-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "CC:22:3D:E3:CE:30",
        "description": "Serial Number"
      }, {
        "iid": 7,
        "type": "00000052-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "0.4.38",
        "description": "Firmware Revision"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 2000000008,
      "type": "49FB9D4D-0FEA-4BF1-8FA6-E7B18AB86DCE",
      "characteristics": [{
        "iid": 9,
        "type": "77474A2F-FA98-485E-97BE-4762458774D8",
        "perms": ["pr", "ev"],
        "format": "uint8",
        "value": 0,
        "description": "State",
        "maxValue": 1,
        "minValue": 0,
        "minStep": 1
      }, {
        "iid": 10,
        "type": "FD9FE4CC-D06F-4FFE-96C6-595D464E1026",
        "perms": ["pr", "ev"],
        "format": "string",
        "value": "1.0",
        "description": "Version"
      }, {
        "iid": 11,
        "type": "5819A4C2-E1B0-4C9D-B761-3EB1AFF43073",
        "perms": ["pr", "pw", "ev"],
        "format": "data",
        "value": null,
        "description": "Control Point"
      }],
      "primary": false,
      "hidden": false
    }]
  }, {
    "aid": 2,
    "services": [{
      "iid": 1,
      "type": "0000003E-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 2,
        "type": "00000014-0000-1000-8000-0026BB765291",
        "perms": ["pw"],
        "format": "bool",
        "description": "Identify"
      }, {
        "iid": 3,
        "type": "00000020-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Manufacturer",
        "description": "Manufacturer"
      }, {
        "iid": 4,
        "type": "00000021-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Model",
        "description": "Model"
      }, {
        "iid": 5,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "RGB Strip",
        "description": "Name"
      }, {
        "iid": 6,
        "type": "00000030-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-SerialNumber",
        "description": "Serial Number"
      }, {
        "iid": 7,
        "type": "00000052-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "1.0",
        "description": "Firmware Revision"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 8,
      "type": "00000043-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 9,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "RGB Strip",
        "description": "Name"
      }, {
        "iid": 10,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }, {
        "iid": 11,
        "type": "00000008-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "int",
        "value": 0,
        "description": "Brightness",
        "unit": "percentage",
        "maxValue": 100,
        "minValue": 0,
        "minStep": 1
      }, {
        "iid": 12,
        "type": "00000013-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "float",
        "value": 0,
        "description": "Hue",
        "unit": "arcdegrees",
        "maxValue": 360,
        "minValue": 0,
        "minStep": 1
      }, {
        "iid": 13,
        "type": "0000002F-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "float",
        "value": 0,
        "description": "Saturation",
        "unit": "percentage",
        "maxValue": 100,
        "minValue": 0,
        "minStep": 1
      }],
      "primary": false,
      "hidden": false
    }]
  }, {
    "aid": 3,
    "services": [{
      "iid": 1,
      "type": "0000003E-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 2,
        "type": "00000014-0000-1000-8000-0026BB765291",
        "perms": ["pw"],
        "format": "bool",
        "description": "Identify"
      }, {
        "iid": 3,
        "type": "00000020-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Manufacturer",
        "description": "Manufacturer"
      }, {
        "iid": 4,
        "type": "00000021-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Model",
        "description": "Model"
      }, {
        "iid": 5,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Pool Licht",
        "description": "Name"
      }, {
        "iid": 6,
        "type": "00000030-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-SerialNumber",
        "description": "Serial Number"
      }, {
        "iid": 7,
        "type": "00000052-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "1.0",
        "description": "Firmware Revision"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 8,
      "type": "00000043-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 9,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Pool Licht",
        "description": "Name"
      }, {
        "iid": 10,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }]
  }, {
    "aid": 4,
    "services": [{
      "iid": 1,
      "type": "0000003E-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 2,
        "type": "00000014-0000-1000-8000-0026BB765291",
        "perms": ["pw"],
        "format": "bool",
        "description": "Identify"
      }, {
        "iid": 3,
        "type": "00000020-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Manufacturer",
        "description": "Manufacturer"
      }, {
        "iid": 4,
        "type": "00000021-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Model",
        "description": "Model"
      }, {
        "iid": 5,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Baum Licht",
        "description": "Name"
      }, {
        "iid": 6,
        "type": "00000030-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-SerialNumber",
        "description": "Serial Number"
      }, {
        "iid": 7,
        "type": "00000052-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "1.0",
        "description": "Firmware Revision"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 8,
      "type": "00000043-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 9,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Baum Licht",
        "description": "Name"
      }, {
        "iid": 10,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }]
  }, {
    "aid": 5,
    "services": [{
      "iid": 1,
      "type": "0000003E-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 2,
        "type": "00000014-0000-1000-8000-0026BB765291",
        "perms": ["pw"],
        "format": "bool",
        "description": "Identify"
      }, {
        "iid": 3,
        "type": "00000020-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Manufacturer",
        "description": "Manufacturer"
      }, {
        "iid": 4,
        "type": "00000021-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Model",
        "description": "Model"
      }, {
        "iid": 5,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Wohnzimmer Temperatur",
        "description": "Name"
      }, {
        "iid": 6,
        "type": "00000030-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-SerialNumber",
        "description": "Serial Number"
      }, {
        "iid": 7,
        "type": "00000052-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "1.0",
        "description": "Firmware Revision"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 8,
      "type": "0000008A-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 9,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Wohnzimmer Temperatur",
        "description": "Name"
      }, {
        "iid": 10,
        "type": "00000011-0000-1000-8000-0026BB765291",
        "perms": ["pr", "ev"],
        "format": "float",
        "value": 0,
        "description": "Current Temperature",
        "unit": "celsius",
        "maxValue": 125,
        "minValue": -55,
        "minStep": 0.1
      }],
      "primary": false,
      "hidden": false
    }]
  }, {
    "aid": 9,
    "services": [{
      "iid": 1,
      "type": "0000003E-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 2,
        "type": "00000014-0000-1000-8000-0026BB765291",
        "perms": ["pw"],
        "format": "bool",
        "description": "Identify"
      }, {
        "iid": 3,
        "type": "00000020-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Switcheroo",
        "description": "Manufacturer"
      }, {
        "iid": 4,
        "type": "00000021-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Switcheroo",
        "description": "Model"
      }, {
        "iid": 5,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "My HDMI Switcher",
        "description": "Name"
      }, {
        "iid": 6,
        "type": "00000030-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-SerialNumber",
        "description": "Serial Number"
      }, {
        "iid": 7,
        "type": "00000052-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "1.0",
        "description": "Firmware Revision"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 8,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 9,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Dunkler",
        "description": "Name"
      }, {
        "iid": 10,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 11,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 12,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Heller",
        "description": "Name"
      }, {
        "iid": 13,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 14,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 15,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Blinken",
        "description": "Name"
      }, {
        "iid": 16,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 17,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 18,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Blitzlicht",
        "description": "Name"
      }, {
        "iid": 19,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 20,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 21,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Fade",
        "description": "Name"
      }, {
        "iid": 22,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 23,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 24,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Smooth",
        "description": "Name"
      }, {
        "iid": 25,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 26,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 27,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Rot",
        "description": "Name"
      }, {
        "iid": 28,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 29,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 30,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Tomato",
        "description": "Name"
      }, {
        "iid": 31,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 32,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 33,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Orange",
        "description": "Name"
      }, {
        "iid": 34,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 35,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 36,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Dunkel Gelb",
        "description": "Name"
      }, {
        "iid": 37,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 38,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 39,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Gelb",
        "description": "Name"
      }, {
        "iid": 40,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 41,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 42,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Grün",
        "description": "Name"
      }, {
        "iid": 43,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 44,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 45,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Hellgrün",
        "description": "Name"
      }, {
        "iid": 46,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 47,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 48,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Hellblau",
        "description": "Name"
      }, {
        "iid": 49,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 50,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 51,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Atlantikblau",
        "description": "Name"
      }, {
        "iid": 52,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 53,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 54,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Cyan",
        "description": "Name"
      }, {
        "iid": 55,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 56,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 57,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Blau",
        "description": "Name"
      }, {
        "iid": 58,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 59,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 60,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Royalblau",
        "description": "Name"
      }, {
        "iid": 61,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 62,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 63,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Türkis",
        "description": "Name"
      }, {
        "iid": 64,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 65,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 66,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Pink",
        "description": "Name"
      }, {
        "iid": 67,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 68,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 69,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Violett",
        "description": "Name"
      }, {
        "iid": 70,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 71,
      "type": "00000049-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 72,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Weiss",
        "description": "Name"
      }, {
        "iid": 73,
        "type": "00000025-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "bool",
        "value": false,
        "description": "On"
      }],
      "primary": false,
      "hidden": false
    }]
  }, {
    "aid": 7,
    "services": [{
      "iid": 1,
      "type": "0000003E-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 2,
        "type": "00000014-0000-1000-8000-0026BB765291",
        "perms": ["pw"],
        "format": "bool",
        "description": "Identify"
      }, {
        "iid": 3,
        "type": "00000020-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Manufacturer",
        "description": "Manufacturer"
      }, {
        "iid": 4,
        "type": "00000021-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-Model",
        "description": "Model"
      }, {
        "iid": 5,
        "type": "00000023-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Somfy - 0",
        "description": "Name"
      }, {
        "iid": 6,
        "type": "00000030-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "Default-SerialNumber",
        "description": "Serial Number"
      }, {
        "iid": 7,
        "type": "00000052-0000-1000-8000-0026BB765291",
        "perms": ["pr"],
        "format": "string",
        "value": "",
        "description": "Firmware Revision"
      }],
      "primary": false,
      "hidden": false
    }, {
      "iid": 8,
      "type": "0000008C-0000-1000-8000-0026BB765291",
      "characteristics": [{
        "iid": 9,
        "type": "0000006D-0000-1000-8000-0026BB765291",
        "perms": ["pr", "ev"],
        "format": "uint8",
        "value": 0,
        "description": "Current Position",
        "unit": "percentage",
        "maxValue": 100,
        "minValue": 0,
        "minStep": 1
      }, {
        "iid": 10,
        "type": "0000007C-0000-1000-8000-0026BB765291",
        "perms": ["pr", "pw", "ev"],
        "format": "uint8",
        "value": 0,
        "description": "Target Position",
        "unit": "percentage",
        "maxValue": 100,
        "minValue": 0,
        "minStep": 1
      }, {
        "iid": 11,
        "type": "00000072-0000-1000-8000-0026BB765291",
        "perms": ["pr", "ev"],
        "format": "uint8",
        "value": 2,
        "description": "Position State",
        "valid-values": [0, 1, 2],
        "maxValue": 2,
        "minValue": 0
      }],
      "primary": false,
      "hidden": false
    }]
  }]
}
