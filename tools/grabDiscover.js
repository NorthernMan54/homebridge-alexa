"use strict";
var debug = require('debug')('grabDiscover');
var fs = require('fs');
var mqtt = require('mqtt');

var passwords = JSON.parse(fs.readFileSync(process.argv[2]));

var clientUsername = process.argv[3];

if (!clientUsername) {
  console.log("Missing clientUsername");
  process.exit();
}

var options = {
  mqttURL: "mqtts://alexa.homebridge.ca:8883/",
  mqttOptions: {
    username: passwords.username,
    password: passwords.password,
    rejectUnauthorized: false
  }
}

var client = mqtt.connect(options.mqttURL, options.mqttOptions);

var discoveryCommand = { "directive": { "header": { "namespace": "Alexa.Discovery", "name": "Discover", "payloadVersion": "3", "messageId": "d5945222-26dd-40ee-a59f-3ea49a7af43a" }, "payload": {} } };

client.on('connect', function () {
  debug('connect', options.mqttURL, "command/" + clientUsername + "/#");
  client.removeAllListeners('message'); // Clean up event handlers
  client.subscribe("response/" + clientUsername + "/#");
  client.publish("command/" + clientUsername + "/1", JSON.stringify(discoveryCommand));

  client.on('message', function (topic, message) {
    try {
      var msg = JSON.parse(message.toString());
      console.log(message.toString());
      //    debug("Count", this.listenerCount(msg.directive.header.namespace.toLowerCase()));
      process.exit();
    } catch (err) {
      options.log.error("ERROR: MQTT Message on topic \"%s\" triggered an internal error\n", topic, err);
    }
  });
});





