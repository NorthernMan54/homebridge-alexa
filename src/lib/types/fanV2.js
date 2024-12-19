/* eslint-disable max-len */

const { HapClient, ServiceType } = require('@homebridge/hap-client');
const { Characteristic } = require('../hap-types');
const { hapToAlexa, hapToAlexa_t } = require('./hapToAlexa');

class FanV2 extends hapToAlexa {
  discovery(service) {
    let discovery = { ...this.discoveryTemplate(service), ...{ displayCategories: ["FAN"] }};
    return discovery;
  }
}

module.exports = {
  FanV2
}