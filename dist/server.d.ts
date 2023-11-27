/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import net from 'net';
import tls, { TlsOptions } from 'tls';
import Connection from 'mqtt-connection';
import { Duplex } from 'stream';
export type MqttServerListener = (client: Connection) => void;
export declare class MqttServer extends net.Server {
    connectionList: Duplex[];
    constructor(listener: MqttServerListener);
}
export declare class MqttServerNoWait extends net.Server {
    connectionList: Duplex[];
    constructor(listener: MqttServerListener);
}
export declare class MqttSecureServer extends tls.Server {
    connectionList: Duplex[];
    constructor(opts: TlsOptions, listener: MqttServerListener);
    setupConnection(duplex: Duplex): void;
}
