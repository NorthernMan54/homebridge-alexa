node parseAccessories.js ~/Code/alexaAwsBackend/samples/dyson_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/dyson.json after.json
node parseAccessories.js ~/Code/alexaAwsBackend/samples/penny_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/penny.json after.json
#node parseAccessories.js samples/ikea_accessories.json > after.json ; diff samples/ikea.json after.json
