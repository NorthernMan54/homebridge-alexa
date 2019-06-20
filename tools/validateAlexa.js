// var alexaTranslator = require('../lib/alexaTranslator.js');
var Homebridges = require('../lib/parse/Homebridges.js').Homebridges;
var Validator = require('is-my-json-valid');
var debug = require('debug')('parse');
var alexaSchema = require('../lib/alexa_smart_home_message_schema.json');
var checkAlexaMessage = Validator(alexaSchema, {
  verbose: true
});

var fs = require('fs');
// JSON.parse(fs.readFileSync(process.argv[2]).toString())
var response = fs.readFileSync(process.argv[2]).toString();
// response = response.replace(/[^\x00-\x7F]/g, "");

var status = checkAlexaMessage(JSON.parse(response));

if (!status) {
  console.log("WARNING - Bad message", JSON.stringify(checkAlexaMessage.errors, null, 4));
  console.log("---------------------------- Response -------------------------------");
  // console.log(JSON.stringify(response));
  console.log("------------------------------------------------------------");
  process.exit(1);
} else {
  console.log("Alexa Message Validation Passed!");
}

console.log("\n-----------------------------------------------------------\n");
console.log(response);
console.log("\n-----------------------------------------------------------\n");

console.log("\n-----------------------------------------------------------\n");
