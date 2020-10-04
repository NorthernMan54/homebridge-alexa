var debug = require('debug')('parse');

var fs = require('fs');
// JSON.parse(fs.readFileSync(process.argv[2]).toString())
var response = JSON.parse(fs.readFileSync(process.argv[2]).toString());

debug(response);

// endpointId: Buffer.from(this.id + "-" + this.homebridge + "-" + accessory.info.Manufacturer + "-" + playback + "-00000049-0000-1000-8000-0026BB765291").toString('base64').replace('/', ''),

response.event.payload.endpoints.forEach((item, i) => {
  debug('endpointid', item.endpointId, item.friendlyName);
  var normal = Buffer.from(item.endpointId, 'base64').toString('ascii');
  debug('normal', normal);
  item.normal = normal;
});

console.log(JSON.stringify(response, null, 2));
