"use strict";

var http = require('http');
var HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher();
var fs = require('fs');
var path = require('path');
var mdns = require('mdns');
var devices = [];
var x10 = require('./lib/x10.js');
var hb = require('./lib/hb.js');
var devices;


function init(port) {

    function handleRequest(request, response) {
        try {
            //log the request on console
            //            log(request.url);
            //Disptach
            dispatcher.dispatch(request, response);
        } catch (err) {
            log(err);
        }
    }

    //Create a server
    var server = http.createServer(handleRequest);

    //Lets start our server
    server.listen(port, function() {
        //Callback triggered when server is successfully listening. Hurray!
        console.log("Web Server listening on: http://localhost:", port);
    });

}

function log(data) {
    console.log(data);
}


hb.discover( function( err, res){

  devices = res;
  console.log("Object: %s", JSON.stringify(devices, null, 2));
  init(8082);
});



//For all your static (js/css/images/etc.) set the directory name (relative path).
dispatcher.setStatic('/static');
dispatcher.setStaticDirname(__dirname + "/static");

//A sample GET request
dispatcher.onGet("/devices.js", function(req, res) {
    var listOfDevices = [];
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    for (var id in devices) {
        var item = {};
        var device = devices[id];
        //        console.log("Device", device.displayName, device.context.url, device.context);
        if (!device.displayName.endsWith("LS")) {
            // skip the fake accessories
            item["name"] = device.displayName;
            item["url"] = device.context.url;
            listOfDevices.push(item);
        }
    }
    //    console.log("Devices", JSON.stringify(listOfDevices));
    res.end(JSON.stringify(listOfDevices));
});

dispatcher.onGet("/", function(req, res) {
    var filePath = path.join(__dirname, "./static/index.html");
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
});

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
        item["actions"] = [
            "turnOn",
            "turnOff"
        ];
        item["additionalApplianceDetails"] = {};
        listOfDevices.push(item);

    }
    //    console.log("Devices", JSON.stringify(listOfDevices));
    log(JSON.stringify(listOfDevices));
    res.end(JSON.stringify(listOfDevices));
});


//A sample POST request
dispatcher.onPost("/post1", function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Got Post Data');
});

dispatcher.onError(function(req, res) {
    console.log("ERROR-No dispatcher", req.url);
    res.writeHead(404);
    res.end();
});
