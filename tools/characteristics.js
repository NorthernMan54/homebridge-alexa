// var alexaTranslator = require('../lib/alexaTranslator.js');
var Homebridges = require('../lib/parse/Homebridges.js').Homebridges;
// var alexaTranslator = require('../lib/alexaTranslator.js');
var Validator = require('is-my-json-valid');
var debug = require('debug')('parse');
var alexaSchema = require('../lib/alexa_smart_home_message_schema.json');
var normalizeUUID = require('../node_modules/hap-node-client/lib/util.js').normalizeUUID;
var checkAlexaMessage = Validator(alexaSchema, {
  verbose: true
});
// var char = require('hap-nodejs');

// console.log('A ->', JSON.stringify(char, null, 2));

var defs = require('../node_modules/hap-nodejs/dist/lib/definitions/CharacteristicDefinitions.js');

console.log('B ->', JSON.stringify(defs, null, 2));

console.log('C ->', JSON.stringify(defs.CurrentTime, null, 2));

console.log('D ->', JSON.stringify(defs.AccessControlLevel, null, 2));
