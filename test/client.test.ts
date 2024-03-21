import serverBuilder from './server_helpers_for_client_tests';
var AlexaLocal = require('../lib/alexaLocal.js').alexaLocal;

jest.setTimeout(30000);


describe('MQTT Client', () => {
  beforeAll(async () => {

    var version;
    let client = null
    let publishCount = 0
    const server2 = serverBuilder('mqtt', (serverClient) => {
      serverClient.on('connect', () => {
        console.log('connect');
        const connack =
          version === 5 ? { reasonCode: 0 } : { returnCode: 0 }
        serverClient.connack(connack)
      })
      serverClient.on('publish', (packet) => {
        console.log('publish', packet.payload.toString());
        if (packet.qos !== 0) {
          serverClient.puback({ messageId: packet.messageId })
        }
      })
    })
  }, 300000);

  afterAll(async () => {

    // await sleep(10000)

  });

  describe('Validate Inital Startup', () => {
    test('getconf GNU_LIBC_VERSION', async () => {
      var options = {
        // MQTT Options
        log: console.log,
        mqttURL: 'mqtt://localhost:1883',
        transport: 'mqtt',
        mqttOptions: {
          username: 'TEST',
          password: 'PASSWORD',
          reconnectPeriod: 33, // Increased reconnect period to allow DDOS protection to reset
          keepalive: 55,
          rejectUnauthorized: false
        },

      };
      var alexa = new AlexaLocal(options);
      await sleep(10000)
    });


  });


});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
