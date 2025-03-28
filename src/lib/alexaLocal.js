"use strict";

const mqtt = require('mqtt');
const debug = require('debug')('alexaLocal');
const Bottleneck = require('bottleneck');
const Validator = require('is-my-json-valid');
const packageConfig = require('../../package.json');
const alexaSchema = require('./alexa_smart_home_message_schema.json');

const checkAlexaMessage = Validator(alexaSchema, { verbose: true });

let connection = {};
let count = 0;
let username;
let limiter;
let Characteristic;

module.exports = {
  alexaLocal,
  alexaEvent,
  alexaPriorityEvent,
};

function alexaLocal(options) {
  debug("Connecting to Homebridge Smart Home Skill");

  // Configure rate limiting
  limiter = new Bottleneck({
    maxConcurrent: 1,
    highWater: 10,
    minTime: 10000,
    strategy: Bottleneck.strategy.BLOCK,
  });

  if (options.alexaService) {
    Characteristic = options.Characteristic;
    options.alexaService.setCharacteristic(
      Characteristic.ContactSensorState,
      Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    );
  }

  limiter.on("dropped", () => {
    options.log("WARNING: (homebridge-alexa) Dropped event message, message rate too high.");
  });

  username = options.mqttOptions.username;
  connection.client = mqtt.connect(options.mqttURL, options.mqttOptions);

  connection.client.on('connect', () => handleConnect(options));
  connection.client.on('offline', () => handleOffline(options));
  connection.client.on('reconnect', () => handleReconnect(options));
  connection.client.on('error', (err) => handleError(err, options));
}

function handleConnect(options) {
  debug('Connected to', options.mqttURL);

  if (options.alexaService) {
    options.alexaService.setCharacteristic(
      Characteristic.ContactSensorState,
      Characteristic.ContactSensorState.CONTACT_DETECTED
    );
  }

  connection.client.removeAllListeners('message');
  connection.client.subscribe(`command/${username}/#`);

  connection.client.publish(`presence/${username}/1`, JSON.stringify({
    Connected: username,
    version: packageConfig.version,
    transport: options.transport,
    keepalive: options.mqttOptions.keepalive,
    routines: options.routines,
  }));

  connection.client.on('message', (topic, message) => handleMessage(topic, message, options));
}

function handleMessage(topic, message, options) {
  try {
    const msg = JSON.parse(message.toString());
    const namespace = msg.directive.header.namespace;

    if (options.eventBus.listenerCount(namespace) > 0) {
      debug('Emitting', msg.directive.header.namespace, msg.directive.header.name, msg.directive.header.correlationToken, msg.directive.endpoint?.endpointId);

      options.eventBus.emit(namespace, msg, (err, response) => {
        if (!response) {
          response = createAlexaErrorResponse(msg);
          options.log.error("ERROR Response", JSON.stringify(msg));
        }
        connection.client.publish(`response/${username}/1`, JSON.stringify(response));
      });
    } else {
      debug('No listener for', namespace);
      const response = createAlexaErrorResponse(msg);
      connection.client.publish(`response/${username}/1`, JSON.stringify(response));
    }
  } catch (err) {
    options.log.error(`ERROR: MQTT Message on topic "${topic}" triggered an internal error`, err);
  }
}

function handleOffline(options) {
  debug('Client offline');

  if (options.alexaService) {
    options.alexaService.setCharacteristic(
      Characteristic.ContactSensorState,
      Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    );
  }
}

function handleReconnect(options) {
  count++;
  debug('Client reconnecting');

  if (options.alexaService) {
    options.alexaService.setCharacteristic(
      Characteristic.ContactSensorState,
      Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    );
  }

  if (count % 5 === 0) {
    options.log("ERROR: (homebridge-alexa) Review the README for troubleshooting.");
  }

  if (count > 1000) {
    connection.client.end({ force: true });
    options.log("ERROR: Stopping connection due to excessive reconnects.");
  }
}

function handleError(err, options) {
  console.error('ERROR:', err.message, err.code);

  if (options.alexaService) {
    options.alexaService.setCharacteristic(
      Characteristic.ContactSensorState,
      Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    );
  }

  switch (err.code) {
    case 5:
      const errorMessage = process.uptime() < 20
        ? "Login failed. Validate credentials in config.json."
        : "Login failed. Validate configuration in config.json.";
      options.log.error(`ERROR: (homebridge-alexa) ${errorMessage}`);
      connection.client.end({ force: true });
      break;
    case 'ECONNREFUSED':
      options.log.error("ERROR: Cloud service DDOS Protection triggered. Stop Homebridge for 5-10 minutes and try again.");
      break;
    default:
      debug('Unhandled error:', err);
  }
}

function alexaEvent(message) {
  var topic = "event/" + username + "/1";
  var publish = function (callback) {
    debug("Sending message", topic, JSON.stringify(message));
    connection.client.publish(topic, JSON.stringify(message), {
      retain: false
    }, callback);
  };
  limiter.submit(publish);
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
}

function createAlexaErrorResponse(message) {
  return {
    event: {
      header: {
        name: "ErrorResponse",
        namespace: "Alexa",
        payloadVersion: "3",
        messageId: message.directive.header.messageId,
      },
      payload: {
        type: "INVALID_DIRECTIVE",
        message: "No listener for directive",
      },
    },
  };
}
