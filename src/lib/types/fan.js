/* eslint-disable max-len */

const { HapClient, ServiceType } = require('@homebridge/hap-client');
const { Characteristic } = require('../hap-types');
const { hapToAlexa, hapToAlexa_t } = require('./hapToAlexa');

class Fan extends hapToAlexa {
  discovery(service) {
    let discovery = { ...{ displayCategories: ["FAN"] }, ...this.discoveryTemplate(service) };
    return discovery;
  }
}

module.exports = {
  Fan
}