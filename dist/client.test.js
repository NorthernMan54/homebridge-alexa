"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_helpers_for_client_tests_1 = require("./server_helpers_for_client_tests");
var AlexaLocal = require('./lib/alexaLocal.js').alexaLocal;
jest.setTimeout(30000);
describe('MQTT Client', () => {
    beforeAll(async () => {
        var version;
        let client = null;
        let publishCount = 0;
        const server2 = (0, server_helpers_for_client_tests_1.default)('mqtt', (serverClient) => {
            serverClient.on('connect', () => {
                const connack = version === 5 ? { reasonCode: 0 } : { returnCode: 0 };
                serverClient.connack(connack);
            });
            serverClient.on('publish', (packet) => {
                console.log(packet.payload.toString());
                if (packet.qos !== 0) {
                    serverClient.puback({ messageId: packet.messageId });
                }
            });
        });
    }, 300000);
    afterAll(async () => {
    });
    describe('Validate Inital Startup', () => {
        test('getconf GNU_LIBC_VERSION', async () => {
            var options = {
                mqttURL: 'mqtt://localhost:1883',
                transport: 'mqtt',
                mqttOptions: {
                    username: 'TEST',
                    password: 'PASSWORD',
                    reconnectPeriod: 33,
                    keepalive: 55,
                    rejectUnauthorized: false
                },
            };
            var alexa = new AlexaLocal(options);
        });
    });
});
//# sourceMappingURL=client.test.js.map