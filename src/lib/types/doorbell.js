/* eslint-disable max-len */

const { HapClient, ServiceType } = require('@homebridge/hap-client');
const { Characteristic } = require('../hap-types');
const { hapToAlexa, hapToAlexa_t } = require('./hapToAlexa');

class Doorbell extends hapToAlexa {
  discovery(service) {
    let discovery = { ...{ displayCategories: ["DOORBELL"] }, ...this.discoveryTemplate(service) };
    return discovery;
  }
}

module.exports = {
  Doorbell
}