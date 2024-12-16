/* eslint-disable max-len */

const { HapClient, ServiceType } = require('@homebridge/hap-client');
const { Characteristic } = require('../hap-types');
const { hapToAlexa, hapToAlexa_t } = require('./hapToAlexa');

class TemperatureSensor extends hapToAlexa {
  discovery(service) {
    let discovery = {...{displayCategories:["TEMPERATURE_SENSOR"]}, ...this.discoveryTemplate(service) };
    return discovery;
  }
}

module.exports = {
  TemperatureSensor
}