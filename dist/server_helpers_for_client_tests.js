"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const debug_1 = require("debug");
const path_1 = require("path");
const fs_1 = require("fs");
const http_1 = require("http");
const ws_1 = require("ws");
const mqtt_connection_1 = require("mqtt-connection");
const KEY = path_1.default.join(__dirname, 'helpers', 'tls-key.pem');
const CERT = path_1.default.join(__dirname, 'helpers', 'tls-cert.pem');
const debug = (0, debug_1.default)('mqttjs:server_helpers_for_client_tests');
function serverBuilder(protocol, handler) {
    const sockets = [];
    const defaultHandler = (serverClient) => {
        sockets.push(serverClient);
        serverClient.on('auth', (packet) => {
            if (serverClient.writable)
                return false;
            const rc = 'reasonCode';
            const connack = {};
            connack[rc] = 0;
            serverClient.connack(connack);
        });
        serverClient.on('connect', (packet) => {
            if (!serverClient.writable)
                return false;
            let rc = 'returnCode';
            const connack = {};
            if (serverClient.options.protocolVersion >= 4) {
                connack['sessionPresent'] = false;
            }
            if (serverClient.options &&
                serverClient.options.protocolVersion === 5) {
                rc = 'reasonCode';
                if (packet.clientId === 'invalid') {
                    connack[rc] = 128;
                }
                else {
                    connack[rc] = 0;
                }
            }
            else if (packet.clientId === 'invalid') {
                connack[rc] = 2;
            }
            else {
                connack[rc] = 0;
            }
            if (packet.properties && packet.properties.authenticationMethod) {
                return false;
            }
            serverClient.connack(connack);
        });
        serverClient.on('publish', (packet) => {
            if (!serverClient.writable)
                return false;
            setImmediate(() => {
                switch (packet.qos) {
                    case 0:
                        break;
                    case 1:
                        serverClient.puback(packet);
                        break;
                    case 2:
                        serverClient.pubrec(packet);
                        break;
                }
            });
        });
        serverClient.on('pubrel', (packet) => {
            if (!serverClient.writable)
                return false;
            serverClient.pubcomp(packet);
        });
        serverClient.on('pubrec', (packet) => {
            if (!serverClient.writable)
                return false;
            serverClient.pubrel(packet);
        });
        serverClient.on('pubcomp', () => {
        });
        serverClient.on('subscribe', (packet) => {
            if (!serverClient.writable)
                return false;
            serverClient.suback({
                messageId: packet.messageId,
                granted: packet.subscriptions.map((e) => e.qos),
            });
        });
        serverClient.on('unsubscribe', (packet) => {
            if (!serverClient.writable)
                return false;
            packet.granted = packet.unsubscriptions.map(() => 0);
            serverClient.unsuback(packet);
        });
        serverClient.on('pingreq', () => {
            if (!serverClient.writable)
                return false;
            serverClient.pingresp();
        });
        serverClient.on('end', () => {
            debug('disconnected from server');
            const index = sockets.findIndex((s) => s === serverClient);
            if (index !== -1) {
                sockets.splice(index, 1);
            }
        });
    };
    if (!handler) {
        handler = defaultHandler;
    }
    let mqttServer = null;
    if (protocol === 'mqtt') {
        mqttServer = new server_1.MqttServer(handler);
    }
    if (protocol === 'mqtts') {
        mqttServer = new server_1.MqttSecureServer({
            key: fs_1.default.readFileSync(KEY),
            cert: fs_1.default.readFileSync(CERT),
        }, handler);
    }
    if (protocol === 'ws') {
        const attachWebsocketServer = (server) => {
            const webSocketServer = new ws_1.default.Server({
                server,
                perMessageDeflate: false,
            });
            webSocketServer.on('connection', (ws) => {
                const stream = ws_1.default.createWebSocketStream(ws);
                const connection = new mqtt_connection_1.default(stream);
                connection.protocol = ws.protocol;
                server.emit('client', connection);
                stream.on('error', () => { });
                connection.on('error', () => { });
                connection.on('close', () => { });
            });
        };
        const httpServer = http_1.default.createServer();
        attachWebsocketServer(httpServer);
        httpServer.on('client', handler);
        mqttServer = httpServer;
    }
    const originalClose = mqttServer.close;
    mqttServer.close = (cb) => {
        sockets.forEach((socket) => {
            socket.destroy();
        });
        originalClose.call(mqttServer, cb);
    };
    return mqttServer;
}
exports.default = serverBuilder;
//# sourceMappingURL=server_helpers_for_client_tests.js.map