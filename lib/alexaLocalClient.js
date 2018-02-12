// Local event based client for alexa
//
// Generates events for each Alexa Skill message
//
var mqtt = require('mqtt');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('Alexa');

var Validator = require('jsonschema').Validator;
var v = new Validator();
var alexaSchema = require('./alexa_smart_home_message_schema.json');

var connection = {};

module.exports = {
  alexaLocalClient: alexaLocalClient
};

function alexaLocalClient(options) {

  debug("Starting MQTT", options);
  connection.client = mqtt.connect(options);
  connection.client.setMaxListeners(0);

  connection.client.on('connect', function() {
    //    debug("options",options);
    debug('connect', "command/" + options.username + "/#");
    connection.client.removeAllListeners('message');
    connection.client.subscribe("command/" + options.username + "/#");
    connection.client.on('message', function(topic, message) {
      var msg = JSON.parse(message.toString());

      debug('Emitting',msg.directive.header.namespace.toLowerCase());
      this.emit('alexa.discovery', msg, function(err, response) {

        //        v.addSchema(alexaSchema);
        //        debug(v.validate(response));
        connection.client.publish("response/1", JSON.stringify(response));
      });

    });
  });

  connection.client.on('offline', function() {
    debug('reconnect');
  });

  connection.client.on('reconnect', function() {
    debug('reconnect');
  });

  connection.client.on('error', function(err) {

    debug('error', err);
  });


}

inherits(alexaLocalClient, EventEmitter);
