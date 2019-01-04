"use strict";

var mqtt = require('mqtt');
var debug = require('debug')('event');

var Validator = require('is-my-json-valid');
var alexaSchema = require('../lib/alexa_smart_home_message_schema.json');
var checkAlexaMessage = Validator(alexaSchema, {
  verbose: true
});

var connection = {};
var count = 0;

var options = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  clientId: process.env.USERNAME,
  reconnectPeriod: 5000,
  servers: [{
      protocol: 'mqtt',
      host: 'homebridgebeta.cloudwatch.net',
      port: 1883
    },
    {
      protocol: 'mqtts',
      host: 'homebridgebeta.cloudwatch.net',
      port: 8883
    }
  ]
};

console.log("Connecting",options);
connection.client = mqtt.connect(options);
// connection.client.setMaxListeners(0);

connection.client.on('connect', function() {
  debug('connect', "command/" + options.username + "/#");
  // Send message after Connecting
  var message = {
    "context": {},
    "event": {
      "header": {
        "messageId": "abc-123-def-456",
        "namespace": "Alexa",
        "name": "ChangeReport",
        "payloadVersion": "3"
      },
      "endpoint": {
        "endpointId": "endpoint-001"
      },
      "payload": {
        "change": {
          "cause": {
            "type": "PHYSICAL_INTERACTION"
          },
          "properties": [{
            "namespace": "Alexa.MotionSensor",
            "name": "detectionState",
            "value": "DETECTED",
            "timeOfSample": "2018-02-03T16:20:50.52Z",
            "uncertaintyInMilliseconds": 0
          }]
        }
      }
    }
  };

  var status = checkAlexaMessage(message.toString());
  if (!status) {
    debug("WARNING - Bad response message", checkAlexaMessage.errors);
    debug("---------------------------- Request --------------------------------");
    debug(JSON.stringify(message));
  }
  var topic = "event/" + process.env.USERNAME + "/1";
  console.log("Sending message");
  connection.client.publish(topic, JSON.stringify(message));
});

connection.client.on('offline', function() {
  debug('offline');
});

connection.client.on('reconnect', function() {
  count++;
  debug('reconnect');
  if (count % 5 === 0) console.log("ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README.");
  if (count > 1000) {
    connection.client.end({
      force: true
    });
    console.log("ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.");
  }
});

connection.client.on('error', function(err) {
  debug('error', err);
});
