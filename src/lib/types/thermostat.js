/* eslint-disable max-len */

const { HapClient, ServiceType } = require('@homebridge/hap-client');
const { Characteristic } = require('../hap-types');
const { hapToAlexa, hapToAlexa_t } = require('./hapToAlexa');

class Thermostat extends hapToAlexa {
  discovery(service) {
    let discovery = { ...this.discoveryTemplate(service), ...{ displayCategories: ["THERMOSTAT"] } };
    return discovery;
  }
}

module.exports = {
  Thermostat
}