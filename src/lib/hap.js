var debug = require('debug')('alexaHap');
const { HapClient, ServiceType } = require('@homebridge/hap-client');

const path = require('path');
const fs = require('fs');


const { ContactSensor } = require('./types/contactSensor');
const { Doorbell } = require('./types/doorbell');
const { Fan } = require('./types/fan');
const { FanV2 } = require('./types/fanV2');
const { GarageDoorOpener } = require('./types/garageDoorOpener');
const { Lightbulb } = require('./types/lightbulb');
const { MotionSensor } = require('./types/motionSensor');
const { Outlet } = require('./types/outlet');
const { Speaker } = require('./types/speaker');
const { Switch } = require('./types/switch');
const { Television } = require('./types/television');
const { TemperatureSensor } = require('./types/temperatureSensor');
const { Thermostat } = require('./types/thermostat');

class Hap {

  services = [];
  hapClient;

  /* GSH Supported types */
  types = {
    ContactSensor: new ContactSensor(),
    Doorbell: new Doorbell(),
    Fan: new Fan(),
    Fanv2: new FanV2(),
    GarageDoorOpener: new GarageDoorOpener(),
    Lightbulb: new Lightbulb(),
    MotionSensor: new MotionSensor(),
    OccupancySensor: new ContactSensor(),
    Outlet: new Outlet(),
    Speaker: new Speaker(),
    Switch: new Switch(),
    Television: new Television(),
    TemperatureSensor: new TemperatureSensor(),
    Thermostat: new Thermostat()
  };


  constructor(socket, log, pin, config) {
    this.services = fs.read
    this.config = config;
  }

  /**
  * Build Google SYNC intent payload
  */
  buildDiscoveryResponse() {
    const masterFilePath = path.join(__dirname, '../../test/homebridge-gsh-services.json');
    const data = fs.readFileSync(masterFilePath, 'utf8');

    this.services = JSON.parse(data);
    this.services = this.services.filter(x => !(x.serviceName === 'Alexa' && x.type === 'ContactSensor')); // Remove Alexa service

    this.services = this.services.map(x => {
      if (this.config.speakers.some(speaker => speaker.name === x.serviceName) && this.config.speakers.some(speaker => speaker.manufacturer === x.accessoryInformation.Manufacturer)) {
        console.log('Speaker', x.name);
        return { ...x, type: 'Speaker', humanType: 'Speaker' };
      }
      return x;
    });

    const endpoints = this.services.map((service) => {
      if (!this.types[service.type]) {
        // console.log(`Unsupported service type ${service.type} for`, JSON.stringify(service));
        return;
      }
      // console.log('buildSyncResponse', service);
      return this.types[service.type].discovery(service);
    });
    return {
      event: {
        header: {
          namespace: 'Alexa.Discovery',
          name: 'Discover.Response',
          payloadVersion: '3',
          messageId: ''
        },
        payload: { endpoints: endpoints.filter(item => item !== undefined) }
      }
    };
  }
}

module.exports = {
  Hap
}