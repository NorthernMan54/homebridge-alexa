var debug = require('debug')('translator');

module.exports = {
  endPoints: endPoints
};

function endPoints(accessories) {
  var devices = [];
  accessories.forEach(function(element) {
    devices.push(_parseHbtoAlexa(element.host, element.port, element.HBname, element.accessories));
  });
  return (_endPoints(devices));
}

function _parseHbtoAlexa(host, port, hapname, hb) {
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
        serviceType.startsWith("00000049") || serviceType.startsWith("00000040") ||
        serviceType.startsWith("0000003E")) {
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
            cookie["TurnOn"] = "{ \"host\": \"" + host + "\" , \"port\": " + port + ", \"aid\":" +
              parseInt(aid) + ",\"iid\":" + parseInt(iid) + ",\"value\":1}";
            cookie["TurnOff"] = "{ \"host\": \"" + host + "\" , \"port\": " + port + ", \"aid\":" +
              parseInt(aid) + ",\"iid\":" + parseInt(iid) + ",\"value\":0}";

            displayCategories.push("SWITCH");
            capabilities.push({
              "type": "AlexaInterface",
              "interface": "Alexa.PowerController",
              "version": "3",
              "properties": {
                "supported": [{
                  "name": "powerState"
                }]
              }
            });
          }

          if (type.startsWith("00000008") || type.startsWith("00000029")) {
            // Accessory Bright/Dim
            cookie["SetPowerLevel"] = "{ \"host\": \"" + host + "\" , \"port\": " + port + ", \"aid\":" +
              parseInt(aid) + ",\"iid\":" + parseInt(iid) + ",\"value\":1}";

            displayCategories.push("LIGHT");

            capabilities.push({
              "type": "AlexaInterface",
              "interface": "Alexa.PowerLevelController",
              "version": "3",
              "properties": {
                "supported": [{
                  "name": "powerLevel"
                }],
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

  debug("Alexa Controllable",hapname,Object.keys(alexadevices).length);
  return alexadevices;
}

function _endPoints(discovered) {

  var listOfDevices = [];
  for (var id in discovered) {

    var devices = discovered[id];
    for (var did in devices) {
      var item = {};
      var device = devices[did];
      item["endpointId"] = new Buffer(device.applianceId).toString('base64');
      item["friendlyName"] = device.friendlyName;
      item["description"] = device.friendlyDescription;
      item["manufacturerName"] = device.manufacturerName;
      item["displayCategories"] = device.displayCategories;
      item["cookie"] = device.cookie;
      item["capabilities"] = device.capabilities;
      listOfDevices.push(item);

    }
  }
  return (listOfDevices);
}
