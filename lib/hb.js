var request = require('request');
//require('request').debug = true
var mdns = require('mdns');
var discovered = [];
var log, pin;

exports.discover = function() {
    //    log("DISCOVERED", discovered);
    return discovered;

}

// curl -X PUT http://127.0.0.1:51826/characteristics --header "Content-Type:Application/json"
// --header "authorization: 031-45-154" --data "{ \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"

exports.control = function(host, port, body, callback) {

    request({
        method: 'PUT',
        url: 'http://' + host + ':' + port + '/characteristics',
        timeout: 10000,
        headers: {
            "Content-Type": "Application/json",
            "authorization": pin
        },
        body: body
    }, function(err, response) {
        // Response s/b 200 OK

        if (err || response.statusCode != 207) {
            log.error("Homebridge Control failed %s:%s", host, port, body, err, response.body);
            //            deferred.reject("TCC Login failed, can't connect to TCC Web Site");
            callback(err);
        } else {
            try {
                json = JSON.parse(response.body);
            } catch (ex) {
                //                log.error(ex);
                log.error("Homebridge Response Failed %s:%s", host, port, response.statusCode, response.statusMessage);
                log.error("Homebridge Response Failed %s:%s", host, port, response.body);
                //                log.error(response);
                callback(new Error(ex));
            }
            callback(null, json);
        }
    });

}

exports.discoverHap = function(_log, _pin) {
    log = _log;
    pin = _pin;
    log("Starting mDNS listener");
    try {

        var sequence = [
            mdns.rst.DNSServiceResolve(),
            'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({
                families: [4]
            }),
            mdns.rst.makeAddressesUnique()
        ];
        var browser = mdns.createBrowser(mdns.tcp('hap'), {
            resolverSequence: sequence
        });
        browser.on('serviceUp', function(service) {
            log("Found HAP device: %s http://%s:%s", service.name, service.host, service.port);
            //            for (var i = 0; i < 5; i++) {
//            if ( service.name == "Bart-Dev") {
            getAccessories(service.host, service.port, service.name, function(err, data) {
                if (!err) {
                    log("HAP Discovered %s http://%s:%s %s device(s)", service.name, service.host, service.port, Object.keys(data).length);
                    if (Object.keys(data).length > 0) {
                        discovered.push(data);
                        //                    log("DISCOVERED", JSON.stringify(discovered,null,2));
                    }
                } else {
                    // Error, no data
                }
            })
//          } else {
//            log( "Skipping",service.name);
//          }
            //            }
        });
        browser.on('serviceDown', function(service) {
            log("HAP down: ", service.name);

        });
        browser.on('error', handleError);
        browser.start();
    } catch (ex) {
        handleError(ex);
    }

}

function getAccessories(host, port, hapname, callback) {

    var data = "";
    request({
        method: 'GET',
        url: 'http://' + host + ':' + port + '/accessories',
        timeout: 10000,
        json: true,
        headers: {
            "Content-Type": "Application/json",
            "authorization": pin,
            "connection": "keep-alive",
        },
    }, function(err, response, body) {
        // Response s/b 200 OK
        if (err || response.statusCode != 200) {
            if (err) {
                log("HAP Discover failed http://%s:%s error %s", host, port, err.code);
            } else {
                // Status code = 401 = homebridge not running in insecure mode
                log("HAP Discover failed http://%s:%s error code %s", host, port, response.statusCode);
                err = new Error("Http Err", response.statusCode);
            }
            callback(err);
        } else {
            //            log("RESPONSE",body,Object.keys(body.accessories).length);
            if (Object.keys(body.accessories).length > 0) {
                callback(null, parseHbtoAlexa(host, port, hapname, body));
            } else {
                log.error("Short json data received http://%s:%s", host, port, JSON.stringify(body));
                callback(new Error("Short json data receivedh http://%s:%s", host, port));
            }
        }
    });
}

function handleError(err) {
    switch (err.errorCode) {
        case mdns.kDNSServiceErr_Unknown:
            console.warn(err);
            setTimeout(createBrowser, 5000);
            break;
        default:
            console.warn(err);
    }
}

function parseHbtoAlexa(host, port, hapname, hb) {
    var alexadevices = {};

    for (var accessory in hb.accessories) {

        var aid = hb.accessories[accessory].aid;
        var device = hb.accessories[accessory];
        var iid, name, description, model, manufacturer;

        for (var service in device.services) {
            name = "";
            var serviceType = device.services[service].type;
            var cookie = {};
            var capabilities = [];
            capabilities.push({
                "type": "AlexaInterface",
                "interface": "Alexa",
                "version": "3"
            });
            var displayCategories = [];
            //            log("Service=", aid, serviceType);
            //            log("Object: %s", JSON.stringify(device.services[service], null, 2));
            // Switch or Outlet
            if (serviceType.startsWith("00000043") || serviceType.startsWith("00000047") ||
                serviceType.startsWith("00000049") || serviceType.startsWith("0000003E")) {
                for (var id in device.services[service].characteristics) {
                    //      log("ID=",id);
                    var characteristic = device.services[service].characteristics[id];
                    var type = characteristic.type;
                    var iid = characteristic.iid;
                    //                name = characteristic.value;

                    if (type.startsWith("00000020")) {
                        // Accessory Model
                        manufacturer = characteristic.value;
                    }
                    if (type.startsWith("00000021")) {
                        // Accessory Model
                        model = characteristic.value;
                    }
                    if (type.startsWith("00000023")) {
                        // Accessory Name
                        name = characteristic.value;
                        description = characteristic.description;
                    }

                    if (type.startsWith("00000025")) {
                        // Accessory On/Off
                        //                        log("Accessory ( Switch )= ", aid, iid, name, description);
                        cookie["TurnOn"] = "{ \"host\": \""+host+"\" , \"port\": "+port+", \"aid\":" +
                            parseInt(aid) + ",\"iid\":" + parseInt(iid) + ",\"value\":1}";
                        cookie["TurnOff"] = "{ \"host\": \""+host+"\" , \"port\": "+port+", \"aid\":" +
                            parseInt(aid) + ",\"iid\":" + parseInt(iid) + ",\"value\":0}";

                        displayCategories.push("SWITCH");
                        capabilities.push({
                            "type": "AlexaInterface",
                            "interface": "Alexa.PowerController",
                            "version": "3",
                            "properties": {
                                "supported": [
                                    {
                                        "name": "powerState"
                                    }
                                ]
                            }
                        });
                    }

                    if (type.startsWith("00000008")) {
                        // Accessory Bright/Dim
                        cookie["SetPercentageRequest"] = "{ \"host\": \""+host+"\" , \"port\": "+port+", \"aid\":" +
                            parseInt(aid) + ",\"iid\":" + parseInt(iid) + ",\"value\":1}";

                            displayCategories.push("LIGHT");

                            capabilities.push({
                                "type": "AlexaInterface",
                                "interface": "Alexa.PowerLevelController",
                                "version": "3",
                                "properties": {
                                    "supported": [
                                        {
                                            "name": "powerLevel"
                                        }
                                    ],
                                    "proactivelyReported": false,
                                    "retrievable": false
                                }
                            });
                        //                        log("Accessory ( Dimmer )= ", aid, iid, name, description);
                    }

                }

                if (capabilities.length > 1) {
                    alexadevices[host + ":" +
                        port + ",aid:" + aid.toString()] = {
                        'friendlyName': name,
                        'friendlyDescription': hapname + " " + name + " Switch",
                        'modelName': model,
                        'manufacturerName': manufacturer,
                        'applianceId': host + ":" + port + ":" + aid.toString(),
                        'cookie': cookie,
                        'displayCategories': displayCategories,
                        'capabilities': capabilities
                    };
                    //                    log("Object: %s", JSON.stringify(alexadevices[aid.toString()], null, 2));
                }
            }
        }

    }

    return alexadevices;
}
