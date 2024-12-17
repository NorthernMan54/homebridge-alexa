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
    FanV2: new FanV2(),
    GarageDoorOpener: new GarageDoorOpener(),
    Lightbulb: new Lightbulb(),
    MotionSensor: new MotionSensor(),
    OccupancySensor: new ContactSensor(),
    Outlet: new Outlet(),
    Switch: new Switch(),
    Television: new Television(),
    TemperatureSensor: new TemperatureSensor(),
    Thermostat: new Thermostat()
  };


  constructor(socket, log, pin, config) {
    this.services = fs.read
  }

  /**
* Build Google SYNC intent payload
*/
  async buildDiscoveryResponse() {
    const masterFilePath = path.join(__dirname, '../../test/homebridge-gsh-services.json');
    const data = fs.readFileSync(masterFilePath, 'utf8');
    this.services = JSON.parse(data);
    const endpoints = this.services.map((service) => {
      if (!this.types[service.type]) {
        // this.log.debug(`Unsupported service type ${service.type}`);
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
        payload: { endpoints: endpoints }
      }
    };
  }
}

module.exports = {
  Hap
}