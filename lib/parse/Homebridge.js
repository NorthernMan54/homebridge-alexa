var debug = require('debug')('Homebridge');
var Accessory = require('./Accessory.js').Accessory;

module.exports = {
  Homebridge: Homebridge
};

/*
* Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
*/

/*

{ ipAddress: '192.168.1.202',
  instance:
   { addresses: [ '192.168.1.202', 'fe80::eab6:f43b:eb39:9d7f' ],
     name: 'Leonard-Aztest-A6F3',
     fqdn: 'Leonard-Aztest-A6F3._hap._tcp.local',
     host: 'AC_22_3D_E3_CE_32.local',
     referer:
      { address: '192.168.1.202',
        family: 'IPv4',
        port: 5353,
        size: 374 },
     port: 51828,
     type: 'hap',
     protocol: 'tcp',
     subtypes: [],
     rawTxt: <Buffer 11 6d 64 3d 4c 65 6f 6e 61 72 64 2d 41 7a 74 65 73 74 06 70 76 3d 31 2e 30 14 69 64 3d 41 43 3a 32 32 3a 33 44 3a 45 33 3a 43 45 3a 33 32 04 63 23 3d ... >,
     txt:
      { md: 'Leonard-Aztest',
        pv: '1.0',
        id: 'AC:22:3D:E3:CE:32',
        'c#': '5',
        's#': '1',
        ff: '0',
        ci: '2',
        sf: '1',
        sh: 'HjMYzQ==' } },
  accessories: { accessories: [ [Object], [Object] ] } }
*/

function Homebridge(devices, context) {
  // debug("Homebridge", devices);
  this.accessories = [];
  this.host = devices.ipAddress;
  this.port = devices.instance.port;
  this.homebridge = devices.instance.txt.md;
  this.id = devices.instance.txt.id;
  this.events = context.events;
  this.speakers = context.speakers;
  devices.accessories.accessories.forEach(function(element) {
    var accessory = new Accessory(element, this);
    this.accessories.push(accessory);
  }.bind(this));
}

Homebridge.prototype.toList = function(opt) {
  var list = [];
  for (var index in this.accessories) {
    var accessory = this.accessories[index];
    list = list.concat(accessory.toList({
      host: this.host,
      port: this.port,
      homebridge: this.homebridge,
      id: this.id,
      opt: opt
    }));
    // list.push(accessory.toList());
  }
  // debug("opt",opt,list.length);
  return (list);
};

Homebridge.prototype.toAlexa = function(opt) {
  var list = [];
  for (var index in this.accessories) {
    // debug("Accessories", index);
    var accessory = this.accessories[index];
    list = list.concat(accessory.toAlexa({
      host: this.host,
      port: this.port,
      homebridge: this.homebridge,
      id: this.id,
      opt: opt
    }));
    // list.push(accessory.toList());
  }
  // debug("opt",opt,list.length);
  return (list);
};
