// var debug = require('debug')('Homebridges');
var Homebridge = require('./Homebridge.js').Homebridge;

module.exports = {
  Homebridges: Homebridges
};

/*
* Homebridges -> Homebridge -> Accessory -> Service -> Characteristic
*/

function Homebridges(devices) {
  // debug("Homebridges", devices);
  this.homebridges = [];
  devices.forEach(function(element) {
    var homebridge = new Homebridge(element);
    this.homebridges.push(homebridge);
  }.bind(this));
}

/**
 * Homebridges.toList - description
 *
 * @param  {type} opt description
 * @return {type}     description
 */

Homebridges.prototype.toList = function(opt) {
  var list = [];
  for (var index in this.homebridges) {
    var homebridge = this.homebridges[index];
    // list.push(homebridge.toList());
    list = list.concat(homebridge.toList(opt));
  }

  list.sort((a, b) => (a.sortName > b.sortName) ? 1 : ((b.sortName > a.sortName) ? -1 : 0));
  // debug("opt",opt,list.length);
  return (list);
};

Homebridges.prototype.toAlexa = function(opt) {
  var list = [];
  for (var index in this.homebridges) {
    var homebridge = this.homebridges[index];
    // list.push(homebridge.toList());
    list = list.concat(homebridge.toAlexa(opt));
  }

  list.sort((a, b) => (a.sortName > b.sortName) ? 1 : ((b.sortName > a.sortName) ? -1 : 0));
  // debug("opt",opt,list.length);
  return (list);
};

/* {
  "characteristics": [{
    "aid": endpoint.aid,
    "iid": endpoint.iid,
    "ev": true
  }]
};
*/

Homebridges.prototype.findDevice = function(node) {
  var list = [];
  for (var index in this.homebridges) {
    var homebridge = this.homebridges[index];
    // list.push(homebridge.toList());
    list = list.concat(homebridge.toList());
  }
  return (list.find(x => x.uniqueId === node));
};
