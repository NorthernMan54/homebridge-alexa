// Local event based client for alexa
//
// Generates events for each Alexa Skill message
//

"use strict";

var mqtt = require('mqtt');
var debug = require('debug')('alexaLocal');
const packageConfig = require('../package.json');
var Bottleneck = require("bottleneck");

var Validator = require('is-my-json-valid');
var alexaSchema = require('./alexa_smart_home_message_schema.json');
var checkAlexaMessage = Validator(alexaSchema, {
  verbose: true
});

var connection = {};
var count = 0;
var username;
var limiter;

module.exports = {
  alexaLocal: alexaLocal,
  alexaEvent: alexaEvent
};

function alexaLocal(options) {
  debug("Connecting to Homebridge Smart Home Skill");
  // Throttle event's to match Amazon's Rate API
  // Limit events to one every 30 seconds, and keep at most 5 minutes worth
  limiter = new Bottleneck({
    maxConcurrent: 1,
    highWater: 10,
    minTime: 10000,
    strategy: Bottleneck.strategy.BLOCK
  });

  limiter.on("dropped", function(dropped) {
    console.log("WARNING: ( homebridge-alexa) Dropped event message, message rate too high.");
  });

  username = options.username;
  connection.client = mqtt.connect(options);
  // connection.client.setMaxListeners(0);
  connection.client.on('connect', function() {
    debug('connect', "command/" + options.username + "/#");
    connection.client.removeAllListeners('message'); // This hangs up everyone on the channel
    connection.client.subscribe("command/" + options.username + "/#");
    connection.client.publish("presence/" + options.username + "/1", JSON.stringify({
      Connected: options.username,
      version: packageConfig.version
    }));
    connection.client.on('message', function(topic, message) {
      var msg = JSON.parse(message.toString());

      //    debug("Count", this.listenerCount(msg.directive.header.namespace.toLowerCase()));
      if (options.eventBus.listenerCount(msg.directive.header.namespace) > 0) {
        debug('Emitting', msg.directive.header.namespace);
        options.eventBus.emit(msg.directive.header.namespace, msg, function(err, response) {
          // TODO: if no message, return error Response
          if (response == null || err) {
            response = _alexaErrorResponse(msg);
          }
          connection.client.publish("response/" + options.username + "/1", JSON.stringify(response));
        });
      } else {
        debug('No listener for', msg.directive.header.namespace.toLowerCase());
        // connection.client.publish("response/1", JSON.stringify(_alexaErrorResponse(msg)));
      }
    });
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
}

function alexaEvent(message) {
  /*
  var status = checkAlexaMessage(message.toString());
  if (!status) {
    debug("WARNING - Bad response message", JSON.stringify(checkAlexaMessage.errors));
    debug("---------------------------- Request --------------------------------");
    debug(JSON.stringify(message));
  }
  */
  var topic = "event/" + username + "/1";
  var publish = function(callback) {
    debug("Sending message", JSON.stringify(message));
    connection.client.publish(topic, JSON.stringify(message), {
      retain: false
    }, callback);
  };
  limiter.submit(publish);
  // debug("publish limit", limiter.counts());
}

function _alexaErrorResponse(message) {
  var response = {
    "event": {
      "header": {
        "name": "ErrorResponse",
        "namespace": message.directive.header.namespace,
        "payloadVersion": "3",
        "messageId": message.directive.header.messageId
      },
      "payload": {
        "endpoints": []
      }
    }
  };
  return (response);
}
