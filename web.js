"use strict";

var Accessory, Service, Characteristic, UUIDGen, CommunityTypes;
var http = require('http');
var HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher();
var fs = require('fs');
var path = require('path');
//var mdns = require('mdns');
var hb = require('./lib/hb.js');
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

    this.debug = config['debug'] || false;
    this.port = config['port'] || 8080;
    this.pin = config['pin'] || "031-45-154";
    self = this;

    hb.discoverHap(log,this.pin);

    init(self, self.port);

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
    callback(accessory);
}



function init(self, port) {

    function handleRequest(request, response) {
        try {
            dispatcher.dispatch(request, response);
        } catch (err) {
            self.log(err);
        }
    }

    //Create a server
    var server = http.createServer(handleRequest);

    //Lets start our server
    server.listen(port, function() {
        //Callback triggered when server is successfully listening. Hurray!
        self.log("Web Server listening on: http://localhost:%s", port);
    });

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
            item["additionalApplianceDetails"] = device.additionalApplianceDetails;
            listOfDevices.push(item);

        }
    }
    //    console.log("Devices", JSON.stringify(listOfDevices));
    //    self.log(JSON.stringify(listOfDevices));
    self.log("Discover Returned %s devices", Object.keys(listOfDevices).length)
    res.end(JSON.stringify(listOfDevices));
});

dispatcher.onGet("/ifttt/indexd.php", function(req, res) {
    //    console.log(req);

    var payload = JSON.parse(decodeURI(req.params.device));
    var action = req.params.action;
    var applianceId = new Buffer(payload.appliance.applianceId, 'base64').toString().split(":");
    var characteristics = payload.appliance.additionalApplianceDetails[action];
    var host = applianceId[0];
    var port = applianceId[1];

    self.log("Control Attempt %s:%s", host, port, action, characteristics,payload.percentageState.value);

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
        hb.control(host,port,body, function(err, response) {

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
