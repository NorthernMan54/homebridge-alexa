const Characteristic = require('./Characteristic.js').Characteristic;

describe('Characteristic', () => {
  test('creates boolean TurnOn/TurnOff cookie values for On characteristics', () => {
    const context = {
      aid: 1,
      liid: 2,
      options: {},
      info: { Manufacturer: 'Test', Name: 'Test Device' }
    };

    const characteristic = new Characteristic({
      iid: 2,
      type: '00000025-0000-1000-8000-0026BB765291',
      perms: ['pr', 'pw'],
      value: false,
      description: 'On'
    }, context);

    expect(JSON.parse(characteristic.cookie.TurnOn).value).toBe(true);
    expect(JSON.parse(characteristic.cookie.TurnOff).value).toBe(false);
  });
});
