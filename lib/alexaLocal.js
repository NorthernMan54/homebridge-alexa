// Local event based client for alexa
//
// Generates events for each Alexa Skill message
//

"use strict";

var mqtt = require('mqtt');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('alexaLocal');

var Validator = require('is-my-json-valid');
var alexaSchema = require('./alexa_smart_home_message_schema.json');
var checkAlexaMessage = Validator(alexaSchema, {
  verbose: true
});

var connection = {};
var count = 0;

inherits(alexaLocal, EventEmitter);

module.exports = {
  alexaLocal: alexaLocal,
  alexaEvent: alexaEvent
};

function alexaLocal(options) {
  debug("Connecting to Homebridge Smart Home Skill");
  connection.client = mqtt.connect(options);
  // connection.client.setMaxListeners(0);
  connection.client.on('connect', function() {
    debug('connect', "command/" + options.username + "/#");
    connection.client.removeAllListeners('message'); // This hangs up everyone on the channel
    connection.client.subscribe("command/" + options.username + "/#");
    connection.client.on('message', function(topic, message) {
      var msg = JSON.parse(message.toString());

      //    debug("Count", this.listenerCount(msg.directive.header.namespace.toLowerCase()));
      if (this.listenerCount(msg.directive.header.namespace) > 0) {
        debug('Emitting', msg.directive.header.namespace);
        this.emit(msg.directive.header.namespace, msg, function(err, response) {
          // TODO: if no message, return error Response
          if (response == null || err) {
            response = _alexaErrorResponse(msg);
          }
          /*
          var status = checkAlexaMessage(response);
          if (!status) {
            debug("WARNING - Bad response message", checkAlexaMessage.errors);
            debug("---------------------------- Request --------------------------------");
            debug(JSON.stringify(msg));
            debug("---------------------------- Response -------------------------------");
            debug(JSON.stringify(response));
            debug("------------------------------------------------------------");
          }
          */
          connection.client.publish("response/" + options.username + "/1", JSON.stringify(response));
        });
      } else {
        debug('No listener for', msg.directive.header.namespace.toLowerCase());
        connection.client.publish("response/1", JSON.stringify(_alexaErrorResponse(msg)));
      }
    }.bind(this));
  }.bind(this));

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
  var status = checkAlexaMessage(message.toString());
  if (!status) {
    debug("WARNING - Bad response message", checkAlexaMessage.errors);
    debug("---------------------------- Request --------------------------------");
    debug(JSON.stringify(message));
  }
  var topic = "event/" + process.env.USERNAME + "/1";
  console.log("Sending message");
  connection.client.publish(topic, JSON.stringify(message));
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
