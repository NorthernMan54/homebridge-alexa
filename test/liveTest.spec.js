// External Libraries

const http = require('node:http');
const util = require('node:util');
const bonjour = require('bonjour-hap')()
const EventEmitter = require('node:events').EventEmitter;

// spy on the global console

// const logSpy = jest.spyOn(console, "log");

// Internal Libraries

// const alexaActions = require('./alexaActions.js');

/*

curl -X PUT http://192.168.1.11:46775/accessories --header "Content-Type:Application/json" --header "authorization: 031-45-154"
curl -X GET http://192.168.1.11:46775/characteristics?id=9.10 --header "Content-Type:Application/json" --header "authorization: 031-45-154"
*/

// Homebridge emulator setup

const testType = 'hap';
const discoveryTimeout = 5;   // Rerun discovery every X
const testPort = 3000;

const eventBus = new EventEmitter();

let publishTxt = {
  "c#": 1,
  ff: 0,
  id: 'aa:bb:cc:dd:ee:ff',
  md: 'Alexa_Test_Accessory',
  pv: '1.1',
  "s#": 1, // current state number (must be 1)
  sf: '0',
  ci: 2,
  sh: 'setupHash'
};

const publishOptions = {
  name: 'Alexa_Test_Accessory',
  type: testType,
  port: testPort,
  host: 'Alexa_Test_Accessory.local',
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

// Sample Accessories

const oneAccessory = {
  "accessories": [
    {
      "aid": 1, "services": [
        { "type": "3E", "iid": 1, "characteristics": [{ "type": "14", "iid": 2, "perms": ["pw"], "description": "Identify", "format": "bool" }, { "type": "20", "iid": 3, "value": "homebridge.io", "perms": ["pr"], "description": "Manufacturer", "format": "string", "maxLen": 64 }, { "type": "21", "iid": 4, "value": "homebridge", "perms": ["pr"], "description": "Model", "format": "string", "maxLen": 64 }, { "type": "23", "iid": 5, "value": "Heisenberg 4534", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 }, { "type": "30", "iid": 6, "value": "AA:BB:CC:DD:EE:01", "perms": ["pr"], "description": "Serial Number", "format": "string", "maxLen": 64 }, { "type": "52", "iid": 7, "value": "1.7.0", "perms": ["pr"], "description": "Firmware Revision", "format": "string" }] },
        {
          "type": "A2", "iid": 2000000008, "characteristics": [
            { "type": "37", "iid": 9, "value": "1.1.0", "perms": ["pr"], "description": "Version", "format": "string", "maxLen": 64 }
          ]
        }]
    },
    {
      "aid": 34, "services": [
        {
          "type": "3E", "iid": 1, "characteristics": [
            { "type": "14", "iid": 2, "perms": ["pw"], "description": "Identify", "format": "bool" },
            { "type": "20", "iid": 3, "value": "homebridge-stub", "perms": ["pr"], "description": "Manufacturer", "format": "string", "maxLen": 64 },
            { "type": "21", "iid": 4, "value": "Default-Model", "perms": ["pr"], "description": "Model", "format": "string", "maxLen": 64 },
            { "type": "23", "iid": 5, "value": "Stub Contact Sensor", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 },
            { "type": "30", "iid": 6, "value": "Pinkman.local", "perms": ["pr"], "description": "Serial Number", "format": "string", "maxLen": 64 },
            { "type": "52", "iid": 7, "value": "0.6.9", "perms": ["pr"], "description": "Firmware Revision", "format": "string" }
          ]
        },
        {
          "type": "80", "iid": 8, "characteristics": [
            { "type": "23", "iid": 9, "value": "Stub Contact Sensor", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 },
            { "type": "6A", "iid": 10, "value": 0, "perms": ["ev", "pr"], "description": "Contact Sensor State", "format": "uint8", "minValue": 0, "maxValue": 1, "minStep": 1, "valid-values": [0, 1] }
          ]
        }
      ]
    }
  ]
};

const twoAccessory = {
  "accessories": [
    {
      "aid": 1, "services": [
        { "type": "3E", "iid": 1, "characteristics": [{ "type": "14", "iid": 2, "perms": ["pw"], "description": "Identify", "format": "bool" }, { "type": "20", "iid": 3, "value": "homebridge.io", "perms": ["pr"], "description": "Manufacturer", "format": "string", "maxLen": 64 }, { "type": "21", "iid": 4, "value": "homebridge", "perms": ["pr"], "description": "Model", "format": "string", "maxLen": 64 }, { "type": "23", "iid": 5, "value": "Heisenberg 4534", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 }, { "type": "30", "iid": 6, "value": "AA:BB:CC:DD:EE:01", "perms": ["pr"], "description": "Serial Number", "format": "string", "maxLen": 64 }, { "type": "52", "iid": 7, "value": "1.7.0", "perms": ["pr"], "description": "Firmware Revision", "format": "string" }] },
        {
          "type": "A2", "iid": 2000000008, "characteristics": [
            { "type": "37", "iid": 9, "value": "1.1.0", "perms": ["pr"], "description": "Version", "format": "string", "maxLen": 64 }
          ]
        }]
    },
    {
      "aid": 34, "services": [
        {
          "type": "3E", "iid": 1, "characteristics": [
            { "type": "14", "iid": 2, "perms": ["pw"], "description": "Identify", "format": "bool" },
            { "type": "20", "iid": 3, "value": "homebridge-stub", "perms": ["pr"], "description": "Manufacturer", "format": "string", "maxLen": 64 },
            { "type": "21", "iid": 4, "value": "Default-Model", "perms": ["pr"], "description": "Model", "format": "string", "maxLen": 64 },
            { "type": "23", "iid": 5, "value": "Stub Contact Sensor", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 },
            { "type": "30", "iid": 6, "value": "Pinkman.local", "perms": ["pr"], "description": "Serial Number", "format": "string", "maxLen": 64 },
            { "type": "52", "iid": 7, "value": "0.6.9", "perms": ["pr"], "description": "Firmware Revision", "format": "string" }
          ]
        },
        {
          "type": "80", "iid": 8, "characteristics": [
            { "type": "23", "iid": 9, "value": "Stub Contact Sensor", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 },
            { "type": "6A", "iid": 10, "value": 0, "perms": ["ev", "pr"], "description": "Contact Sensor State", "format": "uint8", "minValue": 0, "maxValue": 1, "minStep": 1, "valid-values": [0, 1] }
          ]
        }
      ]
    },
    {
      "aid": 35, "services": [
        {
          "type": "3E", "iid": 1, "characteristics": [
            { "type": "14", "iid": 2, "perms": ["pw"], "description": "Identify", "format": "bool" },
            { "type": "20", "iid": 3, "value": "homebridge-stub", "perms": ["pr"], "description": "Manufacturer", "format": "string", "maxLen": 64 },
            { "type": "21", "iid": 4, "value": "Default-Model", "perms": ["pr"], "description": "Model", "format": "string", "maxLen": 64 },
            { "type": "23", "iid": 5, "value": "2nd Stub Contact Sensor", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 },
            { "type": "30", "iid": 6, "value": "Pinkman.local", "perms": ["pr"], "description": "Serial Number", "format": "string", "maxLen": 64 },
            { "type": "52", "iid": 7, "value": "0.6.9", "perms": ["pr"], "description": "Firmware Revision", "format": "string" }
          ]
        },
        {
          "type": "80", "iid": 8, "characteristics": [
            { "type": "23", "iid": 9, "value": "2nd Stub Contact Sensor", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 },
            { "type": "6A", "iid": 10, "value": 0, "perms": ["ev", "pr"], "description": "Contact Sensor State", "format": "uint8", "minValue": 0, "maxValue": 1, "minStep": 1, "valid-values": [0, 1] }
          ]
        }
      ]
    }
  ]
};

describe.skip("liveTest - Event Reg fails", () => {

  //  let homebridges;
  let service;
  let httpServer;

  let accessory = oneAccessory;

  var options = {
    type: testType,
    timeout: discoveryTimeout,  // Discovery timeout;
    eventBus: eventBus,
    log: console.log,
    pin: '031-45-154'
  };

  beforeAll(() => {

    // Fake Homebridge instance

    // service = bonjour.publish(publishOptions);
    // service.start()

    let app = async function (req, res) {
      // console.log('req', req);
      console.log('req', req.socket.remoteAddress, req.method, req.url, req.body);
      switch (req.method) {
        case 'PUT':
        //  await res.writeHead(200, { 'Content-Type': 'Application/json' });
        //  await res.end("hello world\n");
          break;
        case 'GET':
          switch (req.url) {
            case '/accessories':
              await res.writeHead(200);
              await res.end(JSON.stringify(accessory));
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

    // alexaActions.hapDiscovery(options);
  });

  describe.only("Publish Accessories", () => {

    beforeAll(() => {
      service = bonjour.publish(publishOptions);
      service.start()
    });

    test("Publish Accessory", async () => {
      await sleep(30000);
      
      
      // publishTxt['c#'] = publishTxt['c#'] + 1;
      // service.updateTxt(publishTxt);
    }, 60000);

    test("Update c#", async () => {
      publishTxt['c#'] = publishTxt['c#'] + 1;
      service.updateTxt(publishTxt);
      await sleep(4500);
      
      
    }, 5000);

    test("add second accessory and increment c#", async () => {
      accessory = twoAccessory;
      publishTxt['c#'] = publishTxt['c#'] + 1;
      service.updateTxt(publishTxt);
      await sleep(4500);
    }, 5000);

    afterAll(async () => {
      if (service._activated) {
        service.stop();
        await sleep(500); // service.stop should really be a callback
      }
    });
  });

  afterAll(async () => {
    // await alexaActions.destroy();
    bonjour.unpublishAll(async function (err) {
      if (err)
        console.log('unpublishAll', err);
      bonjour.destroy();
    });
    httpServer.closeAllConnections();
    httpServer.close();
  }, 30000);
});

describe.only("liveTest - Event Reg Succeeds", () => {

  //  let homebridges;
  let service;
  let httpServer;

  let accessory = oneAccessory;

  var options = {
    type: testType,
    timeout: discoveryTimeout,  // Discovery timeout;
    eventBus: eventBus,
    log: console.log,
    pin: '031-45-154'
  };

  beforeAll(() => {

    // Fake Homebridge instance

    // service = bonjour.publish(publishOptions);
    // service.start()

    let app = async function (req, res) {
      // console.log('req', req);
      console.log('req', req.socket.remoteAddress, req.method, req.url, req.body);
      switch (req.method) {
        case 'PUT':
          // console.log('req', req.socket.remoteAddress, req.method, req.url, req.body);
          await res.setHeader('Connection', 'keep-alive');
          await res.writeHead(204);
          res.end();
          break;
        case 'GET':
          switch (req.url) {
            case '/accessories':
              await res.writeHead(200);
              await res.end(JSON.stringify(accessory));
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

    // alexaActions.hapDiscovery(options);
  });

  describe.only("publish Accessories", () => {

    beforeAll(() => {
      service = bonjour.publish(publishOptions);
      service.start()
    });

    test("Publish Accessory", async () => {
      await sleep(30000);
      
      
      // publishTxt['c#'] = publishTxt['c#'] + 1;
      // service.updateTxt(publishTxt);
    }, 60000);

    test("Update c#", async () => {
      publishTxt['c#'] = publishTxt['c#'] + 1;
      service.updateTxt(publishTxt);
      await sleep(4500);
      
      
    }, 5000);

    test("add second accessory and increment c#", async () => {
      accessory = twoAccessory;
      publishTxt['c#'] = publishTxt['c#'] + 1;
      service.updateTxt(publishTxt);
      await sleep(4500);
    }, 5000);

    afterAll(async () => {
      if (service._activated) {
        service.stop();
        await sleep(500); // service.stop should really be a callback
      }
    });
  });

  afterAll(async () => {
    // await alexaActions.destroy();
    bonjour.unpublishAll(async function (err) {
      if (err)
        console.log('unpublishAll', err);
      bonjour.destroy();
    });
    httpServer.closeAllConnections();
    httpServer.close();
  }, 30000);
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Normal Response
Event Register 0E:BA:1B:4F:CA:8D -> { characteristics: [ { aid: 5, iid: 10, ev: true } ] }

{
  protocol: 'HTTP',
  httpVersion: 1.1,
  statusCode: 204,
  statusMessage: 'No Content',
  method: null,
  url: null,
  headers: { Date: 'Fri, 29 Mar 2024 13:32:25 GMT', Connection: 'keep-alive' },
  body: null,
  boundary: null,
  multipart: null,
  additional: ''
}

*/