var alexaTranslator = require('../lib/alexaTranslator.js');
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
  },
  {
    "manufacturer": "Bose SoundTouch",
    "name": "Bose SoundTouch 10"
  },
  {
    "manufacturer": "Bose SoundTouch",
    "name": "Bose SoundTouch 20"
  },
  {
    "manufacturer": "Bose SoundTouch",
    "name": "Bose SoundTouch 300"
  }
];

var filter = "";

var response = alexaTranslator.endPoints(message, endPoints, filter, speakers);
console.log("\n-----------------------------------------------------------\n");
console.log(JSON.stringify(response, null, 4));
