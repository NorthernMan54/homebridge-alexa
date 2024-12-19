/* eslint-disable max-len */

const { HapClient, ServiceType } = require('@homebridge/hap-client');
const { Characteristic } = require('../hap-types');
const { hapToAlexa, hapToAlexa_t } = require('./hapToAlexa');

class Lightbulb extends hapToAlexa {
  discovery(service) {
    let discovery = { ...this.discoveryTemplate(service), ...{displayCategories:["LIGHT"]}};
    return discovery;
  }
}

module.exports = {
  Lightbulb
}