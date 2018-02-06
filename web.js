//{
//"platform": "Alexa",
//     "name": "Alexa",
//     "port": 8082
//}

"use strict";

var Accessory, Service, Characteristic, UUIDGen, CommunityTypes;
var http = require('http');
var HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher();
var fs = require('fs');
var path = require('path');
var debug = require('debug')('Alexa');
var Validator = require('jsonschema').Validator;
var v = new Validator();
var alexaSchema = require('./lib/alexa_smart_home_message_schema.json');

//var mdns = require('mdns');
var hb = require('./lib/hb.js');
var mqtt = require('mqtt');
var alexa = {};
var options = {};
var self;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  Accessory = homebridge.platformAccessory;
  UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform("homebridge-alexa", "Alexa", alexahome);
};

function alexahome(log, config, api) {
  this.log = log;
  this.config = config;
  this.pin = config['pin'] || "031-45-154";
  this.username = config['username'] || false;
  this.password = config['username'] || false;
  self = this;

  // MQTT Options

  options = {
    username: this.username,
    password: this.password,
    clientId: this.username,
    reconnectPeriod: 5000,
    servers: [{
        protocol: 'mqtts',
        host: 'homebridge.cloudwatch.net',
        port: 8883
      },
      {
        protocol: 'mqtt',
        host: 'homebridge.cloudwatch.net',
        port: 1883
      }
    ]
  };

  hb.discoverHap(log, this.pin);
  init(this);
  //var hbAccessories = new hb(this.pin, init());

  //    if (api) {
  //        this.api = api;
  //        this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
  //    }
}

alexahome.prototype = {
  accessories: function(callback) {

    this.log("accessories");
    callback();
  }
};

alexahome.prototype.configureAccessory = function(accessory) {

  this.log("configureAccessory");
  callback();
}



function init(self) {

  debug("Starting MQTT", options);
  alexa.client = mqtt.connect(options);
  alexa.client.setMaxListeners(0);

  alexa.client.on('connect', function() {
    //    debug("options",options);
    debug('connect', "command/" + options.username + "/#");
    alexa.client.removeAllListeners('message');
    alexa.client.subscribe("command/" + options.username + "/#");
    alexa.client.on('message', function(topic, message) {
      var msg = JSON.parse(message.toString());

      // handle alexa directive

      handleAlexaMessage(msg, function(err, response) {

//        v.addSchema(alexaSchema);
//        debug(v.validate(response));
        alexa.client.publish("response/1", JSON.stringify(response));
      });



    });
  });

  alexa.client.on('offline', function() {
    debug('reconnect');
  });

  alexa.client.on('reconnect', function() {
    debug('reconnect');
  });

  alexa.client.on('error', function(err) {

    debug('error', err);
  });


}

function handleAlexaMessage(message, callback) {
  debug("handleAlexaMessage", message);

  switch (message.directive.header.namespace.toLowerCase()) {
    case "alexa.discovery":
      var response = {
        "event": {
          "header": {
            "namespace": "Alexa.Discovery",
            "name": "Discover.Response",
            "payloadVersion": "3",
            "messageId": message.directive.header.messageId
          },
          "payload": {
            "endpoints": endPoints()
          }
        }
      };
      break;
    case "alexa.powercontroller":
      var action = message.directive.header.name;
      var endpointId = message.directive.endpoint.endpointId;
      var haAction = JSON.parse(message.directive.endpoint.cookie[action]);
      debug("alexa.powercontroller", action,endpointId,haAction);
//      aid: 2, iid: 10, value: 1
//      { \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"
      var body = { "characteristics": [{ "aid": haAction.aid, "iid": haAction.iid, "value": haAction.value }]};
      hb.control(haAction.host, haAction.port, JSON.stringify(body), callback);
    break;
    default:
      console.log("Unhandled Alexa Directive", message.directive.header.namespace);
      var response = {
        "event": {
          "header": {
            "name": "ErrorResponse",
            "namespace": "Alexa",
            "payloadVersion": "3",
            "messageId": message.directive.header.messageId
          },
          "payload": {
            "endpoints": []
          }
        }
      };
  }
  debug("handleAlexaMessage - response", JSON.stringify(response));
  callback(null, response);
}

function endPoints() {
  var listOfDevices = [];
  var haps = hb.discover();
  for (var id in haps) {

    var devices = haps[id];

    for (var did in devices) {
      var item = {};
      var device = devices[did];
      //            console.log("Devices ------------------------------", JSON.stringify(device));
      item["endpointId"] = new Buffer(device.applianceId).toString('base64');
      item["friendlyName"] = device.friendlyName;
      item["description"] = device.friendlyDescription;
//      item["applianceId"] = new Buffer(device.applianceId).toString('base64');
      item["manufacturerName"] = device.manufacturerName;
//      item["modelName"] = device.modelName;
//      item["version"] = "1.0";
      item["displayCategories"] = device.displayCategories;
      item["cookie"] = device.cookie;
//      item["isReachable"] = true;
      item["capabilities"] = device.capabilities;
      listOfDevices.push(item);

    }
  }
  return (listOfDevices);
}


//For all your static (js/css/images/etc.) set the directory name (relative path).
//dispatcher.setStatic('/static');
//dispatcher.setStaticDirname(__dirname + "/static");

//A sample GET request

dispatcher.onGet("/ifttt/discover.php", function(req, res) {
  var listOfDevices = [];
  res.writeHead(200, {
    'Content-Type': 'application/json'
  });
  var haps = hb.discover();
  for (var id in haps) {


    var devices = haps[id];

    for (var did in devices) {
      var item = {};
      var device = devices[did];
      //            console.log("Devices ------------------------------", JSON.stringify(device));
      item["applianceId"] = new Buffer(device.applianceId).toString('base64');
      item["manufacturerName"] = device.manufacturerName;
      item["modelName"] = device.modelName;
      item["version"] = "1.0";
      item["friendlyName"] = device.friendlyName;
      item["friendlyDescription"] = device.friendlyDescription;
      item["isReachable"] = true;
      item["actions"] = device.actions;
      item["cookie"] = device.cookie;
      listOfDevices.push(item);

    }
  }
  //    console.log("Devices", JSON.stringify(listOfDevices));
  //    self.log(JSON.stringify(listOfDevices));
  self.log("Discover request from", req.connection.remoteAddress);
  self.log("Discover devices returned %s devices", Object.keys(listOfDevices).length)
  res.end(JSON.stringify(listOfDevices));
});

dispatcher.onGet("/ifttt/indexd.php", function(req, res) {
  //    console.log(req);

  var payload = JSON.parse(decodeURI(req.params.device));
  var action = req.params.action;
  var applianceId = new Buffer(payload.appliance.applianceId, 'base64').toString().split(":");
  var characteristics = payload.appliance.cookie[action];
  var host = applianceId[0];
  var port = applianceId[1];

  self.log("Control request from", req.connection.remoteAddress);
  self.log("Control Attempt %s:%s", host, port, action, characteristics);

  switch (action) {
    case "TurnOffRequest":
    case "TurnOnRequest":
      var body = "{ \"characteristics\": [" + characteristics + "] }";
      break;
    case "SetPercentageRequest":
      var t = JSON.parse(characteristics);
      t.value = payload.percentageState.value;
      var body = "{ \"characteristics\": [" + JSON.stringify(t) + "] }";
      break;
    default:
      self.log("Unknown Action", action);
  }

  if (body) {
    hb.control(host, port, body, function(err, response) {

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      self.log("Control Success", response.characteristics);
      res.end();
    })
  } else {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    self.log("Control Failure");
    res.end();
  }
});


dispatcher.onError(function(req, res) {
  self.log("ERROR-No dispatcher", req.url);
  res.writeHead(404);
  res.end();
});
