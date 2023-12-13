"use strict";
var debug = require('debug')('grabDiscover');
var fs = require('fs');
var mqtt = require('mqtt');

var passwords = JSON.parse(fs.readFileSync(process.argv[2]));

var clientUsername = process.argv[3];

var statusCommand = JSON.parse(fs.readFileSync(process.argv[4]));

if (!clientUsername) {
  console.log("Missing clientUsername");
  process.exit();
}

var options = {
  mqttURL: "mqtts://clone.homebridge.ca:8883/",
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
  client.publish("command/" + clientUsername + "/1", JSON.stringify(statusCommand));

  client.on('message', async function (topic, message) {
    try {
      var msg = JSON.parse(message.toString());
      console.log(message.toString());

      const homeDir = require('os').homedir(); // See: https://www.npmjs.com/package/os
      const desktopDir = `${homeDir}/Desktop/status-`;

      fs.writeFileSync(desktopDir + clientUsername + '.json', message);
      await sleep(5000);
      process.exit();
      //    debug("Count", this.listenerCount(msg.directive.header.namespace.toLowerCase()));
      // process.exit();
    } catch (err) {
      console.log("ERROR: MQTT Message on topic \"%s\" triggered an internal error\n", topic, err);
    }
  });
});


async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


