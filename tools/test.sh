node parseAccessories.js ~/Code/alexaAwsBackend/samples/dyson_accessories.json > after.json ; diff samples/dyson.json after.json
node parseAccessories.js samples/penny_accessories.json > after.json ; diff samples/penny.json after.json
node parseAccessories.js samples/ikea_accessories.json > after.json ; diff samples/ikea.json after.json
