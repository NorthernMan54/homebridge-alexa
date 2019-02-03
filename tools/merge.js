var messageUtil = require('../lib/util/messageUtil.js');

var fs = require('fs');

var accessories = JSON.parse(fs.readFileSync(process.argv[2]).toString());

var combine = {
  'into': "TV",
  'from': ['KODI']
};

messageUtil.combine({ 'combine': combine }, accessories);
console.log('Result\n', JSON.stringify(accessories, null, 4));
