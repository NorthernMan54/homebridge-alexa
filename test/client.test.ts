import { Server } from 'net';
import { MqttServer, MqttSecureServer, MqttServerListener } from './server'
import serverBuilder from './server_helpers_for_client_tests';
var AlexaLocal = require('../lib/alexaLocal.js').alexaLocal;

jest.setTimeout(30000);

// const ports = getPorts(2) 
var server: MqttServer;
var alexa: any;

describe('MQTT Client', () => {
  beforeAll(async () => {
    var version: number;
    server = serverBuilder('mqtt', (serverClient) => {
      serverClient.on('connect', () => {
        const connack =
          version === 5 ? { reasonCode: 0 } : { returnCode: 0 }
        serverClient.connack(connack)
      })
      serverClient.on('publish', (packet: { payload: { toString: () => any; }; qos: number; messageId: any; }) => {
        console.log('publish', packet.payload.toString());
        if (packet.qos !== 0) {
          serverClient.puback({ messageId: packet.messageId })
        }
      })
      serverClient.on('auth', (packet: any) => {
        console.log('auth');
        if (serverClient.writable) return false
        const rc = 'reasonCode'
        const connack = {}
        connack[rc] = 0
        serverClient.connack(connack)
      })
      serverClient.on('subscribe', (packet: { subscriptions: any[]; messageId: any; }) => {
        console.log('subscribe', packet.subscriptions);
        if (!serverClient.writable) return false
        serverClient.suback({
          messageId: packet.messageId,
          granted: packet.subscriptions.map((e: { qos: any; }) => e.qos),
        })
      })
    })
    console.log('MQTT Server starting listener')
    await server.listen(1883)
    console.log('MQTT Server listening')
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
    alexa = new AlexaLocal(options);
  }, 300000);

  afterAll(async () => {
    console.log('MQTT Server exiting', server.listening)
    if (server.listening) {
			await server.close()
		}
  });

  describe('Validate Inital Startup', () => {
    test('Discover Devices', async () => {
      server.publish('command/TEST/1', {"directive":{"header":{"namespace":"Alexa.Discovery","name":"Discover","payloadVersion":"3","messageId":"e68a6720-1222-4030-b044-f01360935f18"},"payload":{}}});
      expect(server).toReceiveMessage('junk');
      // await sleep(10000)
    });


  });


});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
