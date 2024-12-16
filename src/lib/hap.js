var debug = require('debug')('alexaHap');
const { HapClient, ServiceType } = require('@homebridge/hap-client');

const path = require('path');
const fs = require('fs');

const { Lightbulb } = require('./types/lightbulb');
const { ContactSensor } = require('./types/contactSensor');
const { MotionSensor } = require('./types/motionSensor');
const { Outlet } = require('./types/outlet');
const { Switch } = require('./types/switch');
const { TemperatureSensor } = require('./types/temperatureSensor');

class Hap {

  services = [];
  hapClient;

  /* GSH Supported types */
  types = {
    ContactSensor: new ContactSensor(),
    Lightbulb: new Lightbulb(),
    MotionSensor: new MotionSensor(),
    Outlet: new Outlet(),
    Switch: new Switch(),
    TemperatureSensor: new TemperatureSensor(),
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