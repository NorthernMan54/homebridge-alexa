var Ajv = require('ajv');
var fs = require('fs');

var ajv = new Ajv({
  ownProperties: false,
  verbose: false,
  schemaId: 'id'
}); // options can be passed, e.g. {allErrors: true}
var schema = require('../lib/alexa_smart_home_message_schema.json');
console.log(schema);
console.log('-------------------------1--------------------------------');
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
console.log('-------------------------2--------------------------------');
var validate = ajv.compile(schema);
console.log('-------------------------3--------------------------------');
var data = JSON.parse(fs.readFileSync('discovery.json'));
console.log('-------------------------4--------------------------------');
console.log(data);
console.log('-------------------------5--------------------------------');
var valid = validate(data);
console.log('-------------------------6--------------------------------');
if (!valid) console.log(validate.errors);
