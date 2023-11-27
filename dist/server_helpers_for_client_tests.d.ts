/// <reference types="node" />
import { MqttServerListener } from './server';
import { Server } from 'net';
export default function serverBuilder(protocol: string, handler?: MqttServerListener): Server;
