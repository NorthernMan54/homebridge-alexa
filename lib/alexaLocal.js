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

  limiter.on("dropped", function (dropped) {
    options.log("WARNING: ( homebridge-alexa) Dropped event message, message rate too high.");
  });

  username = options.mqttOptions.username;
  connection.client = mqtt.connect(options.mqttURL, options.mqttOptions);
  connection.client.on('connect', function () {
    debug('connect', options.mqttURL, "command/" + username + "/#");
    if (options.alexaService) {
      options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_DETECTED);
    }
    connection.client.removeAllListeners('message'); // Clean up event handlers
    connection.client.subscribe("command/" + username + "/#");
    connection.client.publish("presence/" + username + "/1", JSON.stringify({
      Connected: username,
      version: packageConfig.version,
      transport: options.transport,
      keepalive: options.mqttOptions.keepalive,
      routines: options.events
    }));
    connection.client.on('message', function (topic, message) {
      try {
        var msg = JSON.parse(message.toString());

        //    debug("Count", this.listenerCount(msg.directive.header.namespace.toLowerCase()));
        if (options.eventBus.listenerCount(msg.directive.header.namespace) > 0) {
          debug('Emitting', msg.directive.header.namespace);
          options.eventBus.emit(msg.directive.header.namespace, msg, function (err, response) {
            // TODO: if no message, return error Response
            if (response == null) {
              response = _alexaErrorResponse(msg);
            }
            // debug("Response", JSON.stringify(response));
            connection.client.publish("response/" + username + "/1", JSON.stringify(response));
          });
        } else {
          debug('No listener for', msg.directive.header.namespace.toLowerCase());
          var response = _alexaErrorResponse(msg);
          connection.client.publish("response/" + username + "/1", JSON.stringify(response));
          debug("Response", JSON.stringify(response, null, 2));
        }
      } catch (err) {
        options.log.error("ERROR: MQTT Message on topic \"%s\" triggered an internal error\n", topic, err);
      }
    });
  });

  connection.client.on('offline', function () {
    debug('offline');
    if (options.alexaService) {
      options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    }
  });

  connection.client.on('reconnect', function () {
    count++;
    debug('reconnect');
    if (options.alexaService) {
      options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    }
    if (count % 5 === 0) options.log("ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README.");
    if (count > 1000) {
      connection.client.end({
        force: true
      });
      if (options.alexaService) {
        options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
      }
      options.log("ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.");
    }
  });

  connection.client.on('error', function (err) {
    if (options.alexaService) {
      options.alexaService.setCharacteristic(Characteristic.ContactSensorState, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    }
    switch (err.code) {
      case 5:
        if (process.uptime() < 20) { // If uptime is less than 20 seconds then error is a bad password and not a backend issue
          options.log.error("ERROR: ( homebridge-alexa) Login to homebridge.ca failed, please validate your credentials in config.json and restart homebridge.");
          connection.client.end({
            force: true
          });
        } else {
          options.log.error("ERROR: ( homebridge-alexa) Login to homebridge.ca failed, please validate your configuration in config.json and restart homebridge.");
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
  var publish = function (callback) {
    debug("Sending message", topic, JSON.stringify(message));
    connection.client.publish(topic, JSON.stringify(message), {
      retain: false
    }, callback);
  };
  limiter.submit(publish);
  // debug("publish limit", limiter.counts());
}

function alexaPriorityEvent(message) {
  var topic = "event/" + username + "/1";
  var publish = function (callback) {
    debug("Sending priority message", topic, JSON.stringify(message));
    connection.client.publish(topic, JSON.stringify(message), {
      retain: false
    }, callback);
  };
  limiter.submit({ priority: 4 }, publish);

  /*
  var topic = "event/" + username + "/1";
  debug("Sending priority message", JSON.stringify(message));
  connection.client.publish(topic, JSON.stringify(message));
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
