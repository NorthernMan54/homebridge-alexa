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

var count = 0;
var username;
var limiter;
let Characteristic;

module.exports = {
  alexaLocal: alexaLocal,
  alexaEvent: alexaEvent,
  alexaPriorityEvent: alexaPriorityEvent
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

  if (options.alexaService) {
    Characteristic = options.Characteristic;
    options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
  }

  limiter.on("dropped", function(dropped) {
    options.log.warn("WARNING: ( homebridge-alexa) Dropped event message, message rate too high.");
  });

  username = options.mqttOptions.username;
  var connection = mqtt.connect(options.mqttURL, options.mqttOptions);
  connection.on('connect', function() {
    debug('connect', "command/" + username + "/#");
    if (options.alexaService) {
      options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_DETECTED);
    }
    connection.subscribe("command/" + username + "/#");
    connection.publish("presence/" + username + "/1", JSON.stringify({
      Connected: options.username,
      version: packageConfig.version
    }));
  });

  connection.on('message', function(topic, message) {
    try {
      var msg = JSON.parse(message.toString());

      //    debug("Count", this.listenerCount(msg.directive.header.namespace.toLowerCase()));
      if (options.eventBus.listenerCount(msg.directive.header.namespace) > 0) {
        debug('Emitting', msg.directive.header.namespace);
        options.eventBus.emit(msg.directive.header.namespace, msg, function(err, response) {
          // TODO: if no message, return error Response
          if (response == null) {
            response = _alexaErrorResponse(msg);
          }
          // debug("Response", JSON.stringify(response));
          connection.publish("response/" + username + "/1", JSON.stringify(response));
        });
      } else {
        debug('ERROR: No alexa action listener for', msg);
        var response = _alexaErrorResponse(msg);
        connection.publish("response/" + username + "/1", JSON.stringify(response));
        // debug("Response", JSON.stringify(response, null, 2));
      }
    } catch (err) {
      options.log.error("ERROR: MQTT Message on topic \"%s\" triggered an internal error\n", topic, err);
    }
  });

  connection.on('offline', function() {
    debug('offline');
    if (options.alexaService) {
      options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    }
  });

  connection.on('reconnect', function() {
    count++;
    debug('reconnect');
    if (options.alexaService) {
      options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    }
    if (count % 5 === 0) options.log.error("ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README.");
    if (count > 1000) {
      connection.end({
        force: true
      });
      if (options.alexaService) {
        options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
      }
      options.log.error("ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.");
    }
  });

  connection.on('error', function(err) {
    if (options.alexaService) {
      options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    }
    debug('ERROR: %s -> %s\n', err.message, err.code, err);
    switch (err.code) {
      case 5:
        if (process.uptime() < 20) { // If uptime is less than 20 seconds then error is a bad password and not a backend issue
          options.log.error("ERROR: ( homebridge-alexa) Login to homebridge.ca failed, please validate your credentials in config.json and restart homebridge.");
          connection.end({
            force: true
          });
        }
        break;
      case 'ECONNREFUSED':
        options.log.error("ERROR: Cloud service DDOS Protection tripped, please stop homebridge for 5 to 10 minutes and try again.");
        break;
      default:
        debug('ERROR: %s -> %d\n', err.message, err.code, err);
    }
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
    connection.publish(topic, JSON.stringify(message), {
      retain: false
    }, callback);
  };
  limiter.submit(publish);
  // debug("publish limit", limiter.counts());
}

function alexaPriorityEvent(message) {
  var topic = "event/" + username + "/1";
  var publish = function(callback) {
    debug("Sending priority message", JSON.stringify(message));
    connection.publish(topic, JSON.stringify(message), {
      retain: false
    }, callback);
  };
  limiter.submit({
    priority: 4
  }, publish);

  /*
  var topic = "event/" + username + "/1";
  debug("Sending priority message", JSON.stringify(message));
  connection.publish(topic, JSON.stringify(message));
  */
}

function _alexaErrorResponse(message) {
  var response = {
    "event": {
      "header": {
        "name": "ErrorResponse",
        "namespace": "Alexa",
        "payloadVersion": "3",
        "messageId": message.directive.header.messageId
      },
      "payload": {
        "type": "INVALID_DIRECTIVE",
        "message": "No listener for directive"
      }
    }
  };
  return (response);
}
