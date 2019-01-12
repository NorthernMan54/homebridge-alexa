var alexaTranslator = require('../lib/alexaTranslator.js');
var Validator = require('is-my-json-valid');
var debug = require('debug')('parse');
var alexaSchema = require('../lib/alexa_smart_home_message_schema.json');
var checkAlexaMessage = Validator(alexaSchema, {
  verbose: true
});

var fs = require('fs');

var endPoints = [{
  host: "test",
  port: "12345",
  HBname: "Testing",
  accessories: JSON.parse(fs.readFileSync(process.argv[2]).toString())
}];

var message = {
  "directive": {
    "header": {
      "namespace": "Alexa.Discovery",
      "name": "Discover",
      "payloadVersion": "3",
      "messageId": "1bd5d003-31b9-476f-ad03-71d471922820"
    },
    "payload": {
      "scope": {
        "type": "BearerToken",
        "token": "access-token-from-skill"
      }
    }
  }
};

var speakers = [{
    "manufacturer": "Yamaha",
    "name": "Front"
  },
  {
    "manufacturer": "Yamaha",
    "name": "Rear"
  },
  {
    "manufacturer": "HTTP-IRBlaster",
    "name": "Panasonic"
  }
];

var filter = "";

var response = alexaTranslator.endPoints(message, endPoints, filter, speakers);

var status = checkAlexaMessage(response);
if (!status) {
  console.log("WARNING - Bad message", checkAlexaMessage.errors);
  console.log("---------------------------- Response -------------------------------");
  console.log(JSON.stringify(response));
  console.log("------------------------------------------------------------");
} else {
  console.log("Alexa Message Validation Passed!");
}

console.log("\n-----------------------------------------------------------\n");
console.log(JSON.stringify(response, null, 4));
