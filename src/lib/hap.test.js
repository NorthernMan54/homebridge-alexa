const fs = require('fs');
const path = require('path');
const { Hap } = require('./hap');

// Function to read and parse a JSON file
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading or parsing the file:', error);
    return null;
  }
}

const hap = new Hap();

// Jest test cases
const masterFilePath = path.join(__dirname, '../../test/homebridge-alexa-discovery.json');
const masterData = readJsonFile(masterFilePath);
const masterEndpoints = masterData?.event?.payload?.endpoints || [];
var newVersionData, newEndpoints;

describe('newHap', () => {
  beforeAll(async () => {
    newVersionData = await hap.buildDiscoveryResponse();
    newEndpoints = newVersionData?.event?.payload?.endpoints || [];
  });

  test('masterData files should contain endpoints', () => {
    expect(masterData).toBeDefined();
    expect(masterData.event).toBeDefined();
    expect(masterData.event.header).toBeDefined();
    expect(Array.isArray(masterData.event.payload.endpoints)).toBe(true);
    expect((masterData.event.payload.endpoints).length).toBe(87);
  });

  test('newVersionData files should contain endpoints', () => {
    expect(newVersionData).toBeDefined();
    expect(newVersionData.event).toBeDefined();
    expect(newVersionData.event.header).toBeDefined();
    expect(Array.isArray(newVersionData.event.payload.endpoints)).toBe(true);
    expect((newVersionData.event.payload.endpoints).length).toBe(181);
  });


  // existing Endpoints should exist in newEndpoints
  let matchingNewEndpoint;
  masterEndpoints.forEach((masterEndpoint) => {
    describe(`Endpoint: ${masterEndpoint.friendlyName}`, () => {
      test(`${masterEndpoint?.endpointId} should exist in the newEndpoints file`, () => {
        matchingNewEndpoint = newEndpoints.find(
          (newEndpoint) => masterEndpoint?.endpointId === newEndpoint?.endpointId
        );
        expect(matchingNewEndpoint).toBeDefined();
      });
      /*
      test('should have the same friendlyName', () => {
        expect(matchingNewEndpoint.friendlyName).toBe(masterEndpoint.friendlyName);
      });
      test('should have the same description', () => {
        expect(matchingNewEndpoint.description).toBe(masterEndpoint.description);
      });
 
      test('should have the same manufacturerName', () => {
        expect(matchingNewEndpoint.manufacturerName).toBe(masterEndpoint.manufacturerName);
      });
      test('should have the same displayCategories', () => {
        expect(matchingNewEndpoint.displayCategories).toStrictEqual(masterEndpoint.displayCategories);
      });
      */
      //  test('should have the same capabilities', () => {
      //    expect(matchingNewEndpoint.capabilities).toEqual(masterEndpoint.capabilities);
      //  });
    });
  });

  // existing Endpoints should exist in newEndpoints
  newEndpoints.forEach((newEndpoint) => {
    describe(`Endpoint: ${newEndpoint.friendlyName}`, () => {
      test(`${newEndpoint?.endpointId} should exist in the masterEndpoints file`, () => {
        matchingNewEndpoint = masterEndpoints.find(
          (masterEndpoint) => masterEndpoint?.endpointId === newEndpoint?.endpointId
        );
        expect(matchingNewEndpoint).toBeDefined();
      });
      /*
      test('should have the same friendlyName', () => {
        expect(matchingNewEndpoint.friendlyName).toBe(masterEndpoint.friendlyName);
      });
      test('should have the same description', () => {
        expect(matchingNewEndpoint.description).toBe(masterEndpoint.description);
      });
 
      test('should have the same manufacturerName', () => {
        expect(matchingNewEndpoint.manufacturerName).toBe(masterEndpoint.manufacturerName);
      });
      test('should have the same displayCategories', () => {
        expect(matchingNewEndpoint.displayCategories).toStrictEqual(masterEndpoint.displayCategories);
      });
      */
      //  test('should have the same capabilities', () => {
      //    expect(matchingNewEndpoint.capabilities).toEqual(masterEndpoint.capabilities);
      //  });
    });
  });

});
