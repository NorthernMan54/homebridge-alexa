var request = require('request');

exports.discover = function(callback) {

    request({
        method: 'GET',
        url: 'http://localhost:51826/accessories',
        timeout: 10000,
        headers: {
            "Content-Type": "Application/json",
            "authorization": "031-45-154"
        },

    }, function(err, response) {
        // Response s/b 200 OK
        if (err || response.statusCode != 200) {
            console.log("HD Discover failed", err);
            //            deferred.reject("TCC Login failed, can't connect to TCC Web Site");
            callback(err);
        } else {
            try {
                json = JSON.parse(response.body);
                callback(null, parseHbtoAlexa(json));
            } catch (ex) {
                //                console.error(ex);
                console.error("JSON Parse Error", response.statusCode, response.statusMessage);
                console.error("JSON Parse Error", response.body);
                console.error("JSON Parse Error", ex);
                //                console.error(response);
                callback(new Error(ex));
            }
        }
    });
}

// curl -X PUT http://127.0.0.1:51826/characteristics --header "Content-Type:Application/json"
// --header "authorization: 031-45-154" --data "{ \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"

exports.control = function(body, callback) {

    request({
        method: 'PUT',
        url: 'http://localhost:51826/characteristics',
        timeout: 10000,
        headers: {
            "Content-Type": "Application/json",
            "authorization": "031-45-154"
        },
        body: body
    }, function(err, response) {
        // Response s/b 200 OK

        if (err || response.statusCode != 207) {
            console.log("HD Control failed", err);
            //            deferred.reject("TCC Login failed, can't connect to TCC Web Site");
            callback(err);
        } else {
            try {
                json = JSON.parse(response.body);
            } catch (ex) {
                //                console.error(ex);
                console.error("HB Response Failed",response.statusCode, response.statusMessage);
                console.error("HB Response Failed",response.body);
                //                console.error(response);
                callback(new Error(ex));
            }
            callback(null, json);
        }
    });

}

function parseHbtoAlexa(hb) {
    var alexadevices = {};

    for (var accessory in hb.accessories) {

        var aid = hb.accessories[accessory].aid;
        var device = hb.accessories[accessory];
        var iid, name, description, model, manufacturer;

        for (var service in device.services) {
            name = "";
            var serviceType = device.services[service].type;
            var additionalApplianceDetails = {};
            var actions = [];
            //            console.log("Service=", aid, serviceType);
            //            console.log("Object: %s", JSON.stringify(device.services[service], null, 2));
            // Switch or Outlet
            if (serviceType.startsWith("00000043") || serviceType.startsWith("00000047") ||
                serviceType.startsWith("00000049") || serviceType.startsWith("0000003E")) {
                for (var id in device.services[service].characteristics) {
                    //      console.log("ID=",id);
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
                        console.log("Accessory ( Switch )= ", aid, iid, name, description);
                        additionalApplianceDetails["TurnOnRequest"] = "{\"aid\":"
                        + parseInt(aid) + ",\"iid\":" + parseInt(iid) + ",\"value\":1}";
                        additionalApplianceDetails["TurnOffRequest"] = "{\"aid\": "
                        + parseInt(aid) + ",\"iid\":" + parseInt(iid) + ",\"value\":0}";

                        actions.push("turnOn", "turnOff");
                    }

                    if (type.startsWith("00000008")) {
                        // Accessory Bright/Dim
                        additionalApplianceDetails["SetPercentageRequest"] = "{\"aid\": "
                        + parseInt(aid) + ",\"iid\":" + parseInt(iid) + ",\"value\":1}";

                        actions.push("setPercentage");
                        console.log("Accessory ( Dimmer )= ", aid, iid, name, description);
                    }

                }

                if (actions.length > 0) {
                    alexadevices[aid.toString()] = {
                        'friendlyName': name,
                        'friendlyDescription': name + " Switch",
                        'modelName': model,
                        'manufacturerName': manufacturer,
                        'applianceId': "aid=" + aid.toString(),
                        'additionalApplianceDetails': additionalApplianceDetails,
                        'actions': actions
                    };
                    console.log("Object: %s", JSON.stringify(alexadevices[aid.toString()], null, 2));
                }
            }
        }

    }

    return alexadevices;
}
