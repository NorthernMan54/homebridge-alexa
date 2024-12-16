
const { ServicesTypes, Service, CharacteristicsTypes, Characteristic } = require( './hap-types');

describe('ServicesTypes', () => {
  test('To have atleast 50 elements', () => {
    expect(Object.keys(ServicesTypes).length).toBeGreaterThan(50);
  });
});

describe('Service', () => {
  test('To have atleast 50 elements', () => {
    expect(Object.keys(Service).length).toBeGreaterThan(50);
  });
});

describe('CharacteristicsTypes', () => {
  test('To have atleast 50 elements', () => {
    expect(Object.keys(CharacteristicsTypes).length).toBeGreaterThan(50);
  });
});

describe('Characteristic', () => {
  test('To have atleast 50 elements', () => {
    expect(Object.keys(Characteristic).length).toBeGreaterThan(50);
  });
});