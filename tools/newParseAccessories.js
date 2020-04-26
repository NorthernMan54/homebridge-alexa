// var alexaTranslator = require('../lib/alexaTranslator.js');
var Homebridges = require('../lib/parse/Homebridges.js').Homebridges;
var alexaTranslator = require('../lib/alexaTranslator.js');
var Validator = require('is-my-json-valid');
var debug = require('debug')('parse');
var alexaSchema = require('../lib/alexa_smart_home_message_schema.json');
var normalizeUUID = require('../node_modules/hap-node-client/lib/util.js').normalizeUUID;
var checkAlexaMessage = Validator(alexaSchema, {
  verbose: true
});

var fs = require('fs');
// JSON.parse(fs.readFileSync(process.argv[2]).toString())
var response = fs.readFileSync(process.argv[2]).toString();
// response = response.replace(/[^\x00-\x7F]/g, "");
// response = response.replace(/\uFFFD/g, '');
var accessories = normalizeUUID(JSON.parse(response.replace(/\uFFFD/g, '')));

var endPoints = [{
  ipAddress: "127.0.0.1",
  instance: {
    port: 51826,
    txt: {
      md: 'parseTest',
      pv: '1.0',
      id: 'CC:22:3D:E3:CE:30',
      'c#': '63',
      's#': '1',
      ff: '0',
      ci: '2',
      sf: '0',
      sh: 'kD1sXg=='
    }
  },
  accessories: accessories
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
    "manufacturer": "yamaha-home",
    "name": "Front"
  },
  {
    "manufacturer": "yamaha-home",
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
  },
  {
    "manufacturer": "HTTP-IRBlaster",
    "name": "KODI"
  }
];

var combine = [{
  "into": "TV",
  "from": ["KODI"]
}, {
  "into": "Front",
  "from": ["Yamaha"]
}, {
  "into": "Rear",
  "from": ["Yamaha"]
}];

var inputs = [{
  "into": "TV",
  "devices": [{
    "manufacturer": "HTTP-IRBlaster",
    "name": "Tuner",
    "alexaName": "TUNER"
  }, {
    "manufacturer": "HTTP-IRBlaster",
    "name": "HDMI1",
    "alexaName": "HDMI 1"
  }, {
    "manufacturer": "HTTP-IRBlaster",
    "name": "HDMI1",
    "alexaName": "MEDIA PLAYER"
  }, {
    "manufacturer": "HTTP-IRBlaster",
    "name": "HDMI2",
    "alexaName": "HDMI 2"
  }, {
    "manufacturer": "HTTP-IRBlaster",
    "name": "Tuner",
    "alexaName": "TV"
  }]
}];

var channel = [{
  "into": "TV",
  "manufacturer": "HTTP-IRBlaster",
  "name": "Tuner"
}];

var hbDevices = new Homebridges(endPoints, {
  "events": true,
  "speakers": speakers,
  "combine": combine,
  "inputs": inputs,
  "channel": channel
});
debug("Homebridges");
var response = hbDevices.toAlexa({
  perms: 'pw',
  "events": true,
  "speakers": speakers,
  "combine": combine,
  "inputs": inputs,
  "channel": channel
}, message);

// response = alexaTranslator.endPoints(message, endPoints, this);

// var response = alexaTranslator.endPoints(message, endPoints, {
//   "events": true,
//   "speakers": speakers
// });
debug("toAlexa");
var eventDevices = hbDevices.toEvents();
debug("toEvents - complete");
var status = checkAlexaMessage(response);

var deleteSeen = [];

for (var i = 0; i < response.event.payload.endpoints.length; i++) {
  var endpoint = response.event.payload.endpoints[i];
  if (deleteSeen[endpoint.friendlyName]) {
    console.log("WARNING: Duplicate device name", endpoint.friendlyName);
    // response.event.payload.endpoints.splice(i, 1);
  } else {
    deleteSeen[endpoint.friendlyName] = true;
  }
}

response.event.payload.endpoints = removeDuplicateEndpoints(response.event.payload.endpoints);

if (response && response.event.payload.endpoints.length < 1) {
  console.log("ERROR: HAP Discovery failed, please review config");
} else {
  console.log("alexaDiscovery - returned %s devices", response.event.payload.endpoints.length);
  if (response.event.payload.endpoints.length > 300) {
    console.log("ERROR: Maximum devices/accessories of 300 exceeded.");
  }
}

if (!status) {
  console.log("WARNING - Bad message");

  // console.log(JSON.stringify(checkAlexaMessage.errors, null, 2);
  // console.log("---------------------------- Response -------------------------------");
  // console.log(JSON.stringify(response));
  // console.log("------------------------------------------------------------");
  // process.exit(1);
} else {
  console.log("Alexa Message Validation Passed!");
}

console.log("\n-----------------------------------------------------------\n");
console.log(JSON.stringify(response, null, 2));
console.log("\n-----------------------------------------------------------\n");
// console.log(hbDevices.toEvents());

for (var key in eventDevices) {
  console.log(key);
  // console.log(eventDevices[key].endpointID);
  if (!findById(response, eventDevices[key].endpointID)) {
    console.log("Fail");
  }
  console.log(findById(response, eventDevices[key].endpointID));
  // console.log(eventDevices.find(eventDevices[key].endpointID));
}

function findById(o, id) {
  // Early return
  // console.log('o.id', o.id);
  if (o.endpointId === id) {
    return o;
  }
  var result, p;
  for (p in o) {
    // console.log(p);
    if (o.hasOwnProperty(p) && typeof o[p] === 'object') {
      result = findById(o[p], id);
      if (result) {
        return result;
      }
    }
  }
  return result;
}

console.log("\n-----------------------------------------------------------\n");

function removeDuplicateEndpoints(endpoints) {
  var deleteSeen = [];
  var response = [];
  endpoints.forEach((endpoint) => {
    if (deleteSeen[endpoint.endpointId]) {
      console.log("ERROR: Parsing failed, removing duplicate endpointID =>", endpoint.friendlyName);
    } else {
      // console.log("Adding", endpoint.friendlyName);
      response.push(endpoint);
    }
    deleteSeen[endpoint.endpointId] = true;
  });

  // console.log(response.length);
  // console.log(response);
  return (response);
}
