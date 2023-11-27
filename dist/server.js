"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttSecureServer = exports.MqttServerNoWait = exports.MqttServer = void 0;
const net_1 = require("net");
const tls_1 = require("tls");
const mqtt_connection_1 = require("mqtt-connection");
class MqttServer extends net_1.default.Server {
    constructor(listener) {
        super();
        this.connectionList = [];
        this.on('connection', (duplex) => {
            this.connectionList.push(duplex);
            const connection = new mqtt_connection_1.default(duplex, () => {
                this.emit('client', connection);
            });
        });
        if (listener) {
            this.on('client', listener);
        }
    }
}
exports.MqttServer = MqttServer;
class MqttServerNoWait extends net_1.default.Server {
    constructor(listener) {
        super();
        this.connectionList = [];
        this.on('connection', (duplex) => {
            this.connectionList.push(duplex);
            const connection = new mqtt_connection_1.default(duplex);
            this.emit('client', connection);
        });
        if (listener) {
            this.on('client', listener);
        }
    }
}
exports.MqttServerNoWait = MqttServerNoWait;
class MqttSecureServer extends tls_1.default.Server {
    constructor(opts, listener) {
        if (typeof opts === 'function') {
            listener = opts;
            opts = {};
        }
        super(opts);
        this.connectionList = [];
        this.on('secureConnection', (socket) => {
            this.connectionList.push(socket);
            const connection = new mqtt_connection_1.default(socket, () => {
                this.emit('client', connection);
            });
        });
        if (listener) {
            this.on('client', listener);
        }
    }
    setupConnection(duplex) {
        const connection = new mqtt_connection_1.default(duplex, () => {
            this.emit('client', connection);
        });
    }
}
exports.MqttSecureServer = MqttSecureServer;
//# sourceMappingURL=server.js.map