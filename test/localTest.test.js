// External Libraries

const http = require('node:http');
const util = require('node:util');
const bonjour = require('bonjour-hap')()

// Internal Libraries

var HAPNodeJSClient = require('hap-node-client').HAPNodeJSClient;


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
  md: 'HAPNodeJSClient_Test_Accessory',
  pv: '1.1',
  "s#": 1, // current state number (must be 1)
  sf: '0',
  ci: 2,
  sh: 'setupHash'
};

const publishOptions = {
  name: 'HAPNodeJSClient_Test_Accessory',
  type: testType,
  port: testPort,
  host: 'HAPNodeJSClient_Test_Accessory.local',
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

describe("Local Test", () => {

  let homebridges;
  let service;
  let httpServer;

  beforeAll(() => {

    // Fake Homebridge instance

    // service = bonjour.publish(publishOptions);
    // service.start()

    var options = {
      type: testType,
      timeout: discoveryTimeout,  // Discovery timeout;
    };

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

    homebridges = new HAPNodeJSClient(options);
  });

  describe("Discover Accessories", () => {
    beforeEach(() => {
      service = bonjour.publish(publishOptions);
      service.start()
    });
    test("Retrieve Accessories via HAPaccessories", done => {
      const updateMock = jest.fn((data) => { }); // console.log('called', data)
      const readyMock = jest.fn((data) => { }); // console.log('called', data)

      homebridges.on('Update', updateMock);

      console.log('This takes a couple of seconds');
      homebridges.once('Ready', function () {

        homebridges.HAPaccessories(function (endPoints) {
          // console.log("alexaDiscovery - endPoints", endPoints, endPoints.length);
          // console.log("Test Endpoint", JSON.stringify(endPoints.find(endpoint => endpoint.deviceID === testDeviceID).accessories, null, 2));
          expect(endPoints).toBeDefined();
          expect(endPoints.length).toBeGreaterThanOrEqual(1);
          expect(endPoints[0]).toHaveProperty('instance');
          expect(endPoints[0].instance.configNum).toBe('1');
          expect(endPoints[0].accessories).toHaveLength(2);
          expect(updateMock).toHaveBeenCalledTimes(0);
          done();
        });
      });
    }, 3000);

    test("Retrieve Accessories via Ready event", done => {
      const updateMock = jest.fn((data) => { }); // console.log('called', data)
      const readyMock = jest.fn((data) => { }); // console.log('called', data)

      homebridges.on('Update', updateMock);

      console.log('This takes a couple of seconds');
      homebridges.once('Ready', function (endPoints) {
        // console.log("alexaDiscovery - endPoints", endPoints, endPoints.length);
        // console.log("Test Endpoint", JSON.stringify(endPoints.find(endpoint => endpoint.deviceID === testDeviceID).accessories, null, 2));
        expect(endPoints).toBeDefined();
        expect(endPoints.length).toBeGreaterThanOrEqual(1);
        expect(endPoints[0]).toHaveProperty('instance');
        expect(endPoints[0].instance.configNum).toBe('1');
        expect(endPoints[0].accessories).toHaveLength(2);
        expect(updateMock).toHaveBeenCalledTimes(0);
        done();
      });
    }, 3000);

    afterEach(async () => {
      homebridges.removeAllListeners();
      if (service._activated) {
        service.stop();
        await sleep(500); // service.stop should really be a callback
      }
    });
  });

  describe('Config #', () => {
    beforeAll(() => {
      service = bonjour.publish(publishOptions);
      service.start()
    });

    const updateMock = jest.fn((data) => { }); // console.log('called', data)
    const readyMock = jest.fn((data) => { }); // console.log('called', data)

    test("Initial Publish of accessories", done => {
      homebridges.on('Update', updateMock);

      console.log('This takes a couple of seconds');
      homebridges.once('Ready', function (endPoints) {
        // console.log("alexaDiscovery - endPoints", endPoints, endPoints.length);
        // console.log("Test Endpoint", JSON.stringify(endPoints.find(endpoint => endpoint.deviceID === testDeviceID).accessories, null, 2));
        expect(endPoints).toBeDefined();
        expect(endPoints.length).toBeGreaterThanOrEqual(1);
        expect(endPoints[0]).toHaveProperty('instance');
        expect(endPoints[0].instance.configNum).toBe('1');
        expect(endPoints[0].accessories).toHaveLength(2);
        expect(updateMock).toHaveBeenCalledTimes(0);
        done();
      });
    }, 3000);

    test('Change config # should issue Update event with updated c#', done => {
      readyMock.mockClear();
      updateMock.mockClear();

      const timer = setTimeout(() => {
        expect(readyMock).toHaveBeenCalledTimes(0);
        // console.log(updateMock.mock.calls[0][0]);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(updateMock.mock.calls[0][0][0]).toHaveProperty('instance');
        expect(updateMock.mock.calls[0][0][0].instance.configNum).toBe('2');
        expect(updateMock.mock.calls[0][0][0].accessories).toHaveLength(2);

        done();
      }, 4000);

      homebridges.on('Update', updateMock);
      homebridges.on('Ready', readyMock);

      publishTxt['c#'] = publishTxt['c#'] + 1;
      service.updateTxt(publishTxt);
    });
    afterEach(async () => {
      homebridges.removeAllListeners();
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

const accessory = { "accessories": [{ "aid": 1, "services": [{ "type": "3E", "iid": 1, "characteristics": [{ "type": "14", "iid": 2, "perms": ["pw"], "description": "Identify", "format": "bool" }, { "type": "20", "iid": 3, "value": "homebridge.io", "perms": ["pr"], "description": "Manufacturer", "format": "string", "maxLen": 64 }, { "type": "21", "iid": 4, "value": "homebridge", "perms": ["pr"], "description": "Model", "format": "string", "maxLen": 64 }, { "type": "23", "iid": 5, "value": "Heisenberg 4534", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 }, { "type": "30", "iid": 6, "value": "AA:BB:CC:DD:EE:01", "perms": ["pr"], "description": "Serial Number", "format": "string", "maxLen": 64 }, { "type": "52", "iid": 7, "value": "1.7.0", "perms": ["pr"], "description": "Firmware Revision", "format": "string" }] }, { "type": "A2", "iid": 2000000008, "characteristics": [{ "type": "37", "iid": 9, "value": "1.1.0", "perms": ["pr"], "description": "Version", "format": "string", "maxLen": 64 }] }] }, 
{ "aid": 34, "services": [{ "type": "3E", "iid": 1, "characteristics": [{ "type": "14", "iid": 2, "perms": ["pw"], "description": "Identify", "format": "bool" }, { "type": "20", "iid": 3, "value": "homebridge-alexa", "perms": ["pr"], "description": "Manufacturer", "format": "string", "maxLen": 64 }, { "type": "21", "iid": 4, "value": "Default-Model", "perms": ["pr"], "description": "Model", "format": "string", "maxLen": 64 }, { "type": "23", "iid": 5, "value": "Alexa", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 }, { "type": "30", "iid": 6, "value": "Pinkman.local", "perms": ["pr"], "description": "Serial Number", "format": "string", "maxLen": 64 }, { "type": "52", "iid": 7, "value": "0.6.9", "perms": ["pr"], "description": "Firmware Revision", "format": "string" }] }, { "type": "80", "iid": 8, "characteristics": [{ "type": "23", "iid": 9, "value": "Alexa", "perms": ["pr"], "description": "Name", "format": "string", "maxLen": 64 }, { "type": "6A", "iid": 10, "value": 0, "perms": ["ev", "pr"], "description": "Contact Sensor State", "format": "uint8", "minValue": 0, "maxValue": 1, "minStep": 1, "valid-values": [0, 1] }] }] }] };