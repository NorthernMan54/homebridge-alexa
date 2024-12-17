/* eslint-disable max-len */

const { HapClient, ServiceType } = require('@homebridge/hap-client');
const { Characteristic } = require('../hap-types');
const { hapToAlexa, hapToAlexa_t } = require('./hapToAlexa');

class Thermostat extends hapToAlexa {
  discovery(service) {
    let discovery = { ...{ displayCategories: ["THERMOSTAT"] }, ...this.discoveryTemplate(service) };
    return discovery;
  }
}

module.exports = {
  Thermostat
}