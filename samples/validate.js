var validator = require('is-my-json-valid')
//var Ajv = require('ajv');
var fs = require('fs');

//var ajv = new Ajv({
//  ownProperties: false,
//  verbose: false,
//  schemaId: 'id'
//}); // options can be passed, e.g. {allErrors: true}
var schema = require('./homebridgeConfigSchema.json');

for (let j = 0; j < process.argv.length; j++) {
    console.log(j + ' -> ' + (process.argv[j]));
}
//console.log(schema);
console.log('-------------------------1--------------------------------');
var validate = validator(schema, {
  verbose: true
});
//ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
console.log('-------------------------2--------------------------------');
//var validate = ajv.compile(schema);
console.log('-------------------------3--------------------------------');
var alexa;
try {
alexa = JSON.parse(fs.readFileSync(process.argv[2]));
} catch (err) {
  console.log(err);
  alexa = fs.readFileSync(process.argv[2]);
}
console.log('-------------------------4--------------------------------');
//console.log(alexa);
console.log('-------------------------5--------------------------------');
validate(alexa);
console.log('-------------------------6--------------------------------');
console.log(validate.errors)
//if (!valid) console.log(validate.errors);
