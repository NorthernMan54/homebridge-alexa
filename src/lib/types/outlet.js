/* eslint-disable max-len */

const { HapClient, ServiceType } = require('@homebridge/hap-client');
const { Characteristic } = require('../hap-types');
const { hapToAlexa, hapToAlexa_t } = require('./hapToAlexa');

class Outlet extends hapToAlexa {
  discovery(service) {
    let discovery = { ...this.discoveryTemplate(service), ...{displayCategories:["SMARTPLUG"]}};
    return discovery;
  }
}

module.exports = {
  Outlet
}