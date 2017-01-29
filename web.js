"use strict";

var Accessory, Service, Characteristic, UUIDGen, CommunityTypes;
var http = require('http');
var HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher();
var fs = require('fs');
var path = require('path');
//var mdns = require('mdns');
var devices = [];
var x10 = require('./lib/x10.js');
var hb = require('./lib/hb.js');
var devices, self;

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
    self = this;
    hb.discover(function(err, res) {
        devices = res;

        //       log("Object: %s", JSON.stringify(devices, null, 2));
        init(self, self.port);
    });
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
            //log the request on console
            //            log(request.url);
            //Disptach
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
    for (var id in devices) {
        var item = {};
        var device = devices[id];

        item["applianceId"] = device.applianceId;
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
    //    console.log("Devices", JSON.stringify(listOfDevices));
    self.log(JSON.stringify(listOfDevices));
    res.end(JSON.stringify(listOfDevices));
});

dispatcher.onGet("/ifttt/indexd.php", function(req, res) {
    //    console.log(req);
    var aid = req.params.aid;
    var iid = req.params.iid;
    var device = JSON.parse(decodeURI(req.params.device));
    var action = req.params.action;

    self.log("Control Attempt", device, action);

    switch (action) {
        case "TurnOffRequest":
        case "TurnOnRequest":

            self.log("function", device.appliance.additionalApplianceDetails[action]);
            //{"characteristics":[{"aid":2,"iid":9,"value":0}]}
  //          var body = device.appliance.additionalApplianceDetails[action];
            var body = "{\"characteristics\":["+device.appliance.additionalApplianceDetails[action]+"]";

                self.log("HK",body);
                self.log("OK");
            break;
        case "SetPercentageRequest":
        self.log("%s not implemented", action);
            break;
        default:
            self.log("Unknown Action", action);
    }

    if (body) {
        hb.control(body, function(err, response) {

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
