const fs = require('fs');
const path = require('path');

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

// Jest test cases
const masterFilePath = path.join(__dirname, 'homebridge-alexa-discovery.json');
const newVersionFilePath = path.join(__dirname, 'new-version.json');

const masterData = readJsonFile(masterFilePath);
const newVersionData = readJsonFile(newVersionFilePath);

describe('Comparison of Master and New Version Endpoints', () => {
  test('Both files should contain endpoints', () => {
    expect(masterData).toBeDefined();
    expect(masterData.payload).toBeDefined();
    expect(Array.isArray(masterData.payload.endpoints)).toBe(true);

    expect(newVersionData).toBeDefined();
    expect(newVersionData.payload).toBeDefined();
    expect(Array.isArray(newVersionData.payload.endpoints)).toBe(true);
  });

  const masterEndpoints = masterData?.payload?.endpoints || [];
  const newEndpoints = newVersionData?.payload?.endpoints || [];

  newEndpoints.forEach((newEndpoint) => {
    const matchingMasterEndpoint = masterEndpoints.find(
      (masterEndpoint) => masterEndpoint.endpointId === newEndpoint.endpointId
    );

    describe(`Endpoint: ${newEndpoint.friendlyName}`, () => {
      test('should exist in the master file', () => {
        expect(matchingMasterEndpoint).toBeDefined();
      });

      if (matchingMasterEndpoint) {
        test('should have the same friendlyName', () => {
          expect(newEndpoint.friendlyName).toBe(matchingMasterEndpoint.friendlyName);
        });

        test('should have the same capabilities', () => {
          expect(newEndpoint.capabilities).toEqual(matchingMasterEndpoint.capabilities);
        });
      }
    });
  });
});
